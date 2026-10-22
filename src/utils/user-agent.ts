/**
 * Client identity for usage logs, reduced to something safe to store.
 *
 * A User-Agent or an MCP clientInfo is written by the caller, so it can hold
 * anything: an email address, a token, a megabyte of text. Only a product
 * token survives — `name/version` or a bare `name`, built from
 * [A-Za-z0-9._-] and at most 64 characters. Anything else is "unknown".
 */

const PRODUCT = /^([A-Za-z0-9._-]{1,40})(?:\/([A-Za-z0-9._-]{1,23}))?(?=$|[\s(;,])/;

/** The first product token of a User-Agent header, or "unknown". */
export function uaToken(header: string | string[] | undefined): string {
  const raw = (Array.isArray(header) ? header[0] : header)?.trim();
  if (!raw) return "unknown";
  const m = PRODUCT.exec(raw);
  if (!m) return "unknown";
  const token = m[2] ? `${m[1]}/${m[2]}` : (m[1] as string);
  return token.length <= 64 ? token : "unknown";
}

/** clientInfo { name, version } from an initialize request, sanitised the same way. */
export function clientInfoToken(info: unknown): { name: string; version: string } {
  const rec = (info && typeof info === "object" ? info : {}) as Record<string, unknown>;
  const clean = (v: unknown): string => {
    if (typeof v !== "string") return "unknown";
    const t = v.trim();
    return /^[A-Za-z0-9._ -]{1,64}$/.test(t) && !t.includes("@") ? t : "unknown";
  };
  return { name: clean(rec.name), version: clean(rec.version) };
}
