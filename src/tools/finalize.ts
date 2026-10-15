/**
 * What the registry does to every successful tool payload, in order:
 *
 *   1. freshness — merge the mirror's age and stale flag into data.source
 *   2. UTM       — tag every own-site absolute URL with the tool's name
 *   3. size cap  — replace a payload over MAX_RESPONSE_CHARS with a short
 *                  note naming the arguments that narrow it
 *
 * Kept apart from server.ts so it can be tested without a transport. The
 * same final payload is used for the text content and for structuredContent,
 * so the two always match.
 */

import { freshness } from "../data/freshness.js";
import { loadMirror } from "../data/mirror.js";
import { tagUrls } from "../utils/utm.js";
import type { ToolDefinition } from "./tool-types.js";

/** Most clients truncate or reject tool results above ~25k characters. */
export const MAX_RESPONSE_CHARS = 24_000;

/** Serialised exactly as the registry sends it. */
export const serialise = (payload: unknown): string => JSON.stringify(payload, null, 2);

function withFreshness(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const p = payload as { success?: unknown; data?: unknown };
  if (p.success !== true || !p.data || typeof p.data !== "object") return payload;
  const data = p.data as Record<string, unknown>;
  const src = data.source;
  if (!src || typeof src !== "object") return payload;
  const syncedAt = (src as { syncedAt?: unknown }).syncedAt;
  if (typeof syncedAt !== "string") return payload;
  const fresh = freshness(syncedAt, Date.now(), undefined, loadMirror().brand.url);
  return { ...p, data: { ...data, source: { ...(src as object), ...fresh } } };
}

export interface CappedPayload {
  success: true;
  truncated: true;
  note: string;
  data: { source?: unknown };
}

export function isCapped(payload: unknown): payload is CappedPayload {
  return !!payload && typeof payload === "object" && (payload as { truncated?: unknown }).truncated === true &&
    (payload as { success?: unknown }).success === true && "note" in (payload as object);
}

function capped(tool: ToolDefinition, payload: unknown, size: number): CappedPayload {
  const narrowing = Object.keys(tool.inputSchema);
  const data = (payload as { data?: { source?: unknown } }).data;
  return {
    success: true,
    truncated: true,
    note:
      `The full response was ${size} characters, over the ${MAX_RESPONSE_CHARS}-character limit, so it was not sent. ` +
      (narrowing.length > 0
        ? `Call ${tool.name} again with a narrower request using: ${narrowing.join(", ")}.`
        : `This tool takes no arguments; use a more specific tool for part of this data.`),
    data: data && typeof data === "object" && "source" in data ? { source: data.source } : {},
  };
}

/** The payload the client receives for a successful call. */
export function finalizePayload(tool: ToolDefinition, raw: unknown): unknown {
  const tagged = tagUrls(withFreshness(raw), tool.name);
  const size = serialise(tagged).length;
  return size > MAX_RESPONSE_CHARS ? capped(tool, tagged, size) : tagged;
}
