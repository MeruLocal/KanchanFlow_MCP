/**
 * The shape every KanchanFlow MCP tool takes.
 *
 * Tools are plain data plus a handler. The registry in ./index.ts turns them
 * into MCP registrations, so a tool file never touches the SDK and can be
 * unit-tested by calling `handler` directly.
 *
 * A handler returns the payload it wants inside `{ success: true, data }`, or
 * throws a ToolError. It never formats MCP content and never catches its own
 * errors — the registry does both, identically for every tool.
 */

import type { ZodRawShape } from "zod";

export interface ToolDefinition<Args = Record<string, unknown>> {
  /** kanchanflow_<action>_<resource>. */
  name: string;
  /** Short human label for client UIs. */
  title: string;
  /**
   * What the tool does, when an AI should reach for it, what it returns and
   * what it will refuse. Written for a model, not for a changelog.
   */
  description: string;
  /** Zod raw shape. The SDK converts this to the advertised JSON Schema. */
  inputSchema: ZodRawShape;
  /**
   * Optional Zod raw shape of the success payload ({ success, data }). When
   * set, the registry also returns the payload as structuredContent and the
   * SDK validates it.
   */
  outputSchema?: ZodRawShape;
  handler: (args: Args) => unknown;
}

/**
 * Every tool on this server is read-only. There is no write path to protect,
 * because there is nothing behind this server to write to: it serves the
 * published KanchanFlow website's own content. Stated as a constant so the
 * server can advertise it and the test suite can assert it.
 */
export const READ_ONLY = true as const;

/** Shared pagination clamp. Keeps a list response a usable size for a model. */
export function paginate<T>(
  items: readonly T[],
  limit: number | undefined,
  offset: number | undefined,
  defaultLimit = 25,
  maxLimit = 200
): { page: T[]; total: number; limit: number; offset: number; hasMore: boolean } {
  const off = Math.max(0, Math.trunc(offset ?? 0));
  const lim = Math.max(1, Math.min(Math.trunc(limit ?? defaultLimit), maxLimit));
  const page = items.slice(off, off + lim);
  return { page, total: items.length, limit: lim, offset: off, hasMore: off + page.length < items.length };
}

/** Case-insensitive "does this record mention the query" test. */
export function matches(query: string | undefined, ...haystack: (string | undefined)[]): boolean {
  if (!query || !query.trim()) return true;
  const needle = query.toLowerCase().trim();
  return haystack.some((h) => (h ?? "").toLowerCase().includes(needle));
}
