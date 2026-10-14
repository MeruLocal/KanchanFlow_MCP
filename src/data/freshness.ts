/**
 * How old the content mirror is, stated on every response.
 *
 * An AI client will quote a six-week-old price as current unless something
 * tells it otherwise. Every tool response already carries source.syncedAt;
 * this adds the age, a stale flag and, when stale, a sentence the client can
 * pass on.
 */

/** Days after which the mirror is reported stale, unless overridden. */
export const DEFAULT_STALE_AFTER_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

/** KANCHANFLOW_MCP_STALE_AFTER_DAYS, a positive integer, else the default. */
export function staleAfterDays(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.KANCHANFLOW_MCP_STALE_AFTER_DAYS?.trim();
  if (!raw) return DEFAULT_STALE_AFTER_DAYS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_STALE_AFTER_DAYS;
}

export interface Freshness {
  syncedAt: string;
  /** Whole days since the sync, or null when syncedAt is not a date. */
  ageDays: number | null;
  stale: boolean;
  note?: string;
}

export function freshness(
  syncedAt: string,
  now: number = Date.now(),
  staleAfter: number = staleAfterDays(),
  siteUrl = "https://kanchanflow.com"
): Freshness {
  const at = Date.parse(syncedAt);
  if (!Number.isFinite(at)) {
    return {
      syncedAt,
      ageDays: null,
      stale: true,
      note: `The sync date of this content is unknown, so it may be out of date. Confirm prices and feature status at ${siteUrl} before relying on them.`,
    };
  }
  const ageDays = Math.max(0, Math.floor((now - at) / DAY_MS));
  const stale = ageDays > staleAfter;
  return {
    syncedAt,
    ageDays,
    stale,
    ...(stale
      ? {
          note: `This content was synced ${ageDays} days ago and may be out of date. Confirm prices and feature status at ${siteUrl} before relying on them.`,
        }
      : {}),
  };
}
