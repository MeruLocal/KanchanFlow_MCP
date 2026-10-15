/**
 * UTM tags on the KanchanFlow website's own URLs, so traffic an AI agent sends
 * can be told apart in analytics.
 *
 * Only absolute https URLs on kanchanflow.com or www.kanchanflow.com are
 * tagged. Relative paths, other hosts and already-tagged URLs are returned
 * unchanged. Any existing query string and fragment are kept.
 */

const OWN_HOSTS = new Set(["kanchanflow.com", "www.kanchanflow.com"]);

export function withUtm(url: string, toolName: string): string {
  if (!/^https:\/\//i.test(url)) return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (!OWN_HOSTS.has(parsed.hostname.toLowerCase())) return url;
  if (parsed.username || parsed.password || parsed.port) return url;
  if (parsed.searchParams.has("utm_source")) return url;
  parsed.searchParams.append("utm_source", "mcp");
  parsed.searchParams.append("utm_medium", "ai_agent");
  parsed.searchParams.append("utm_campaign", toolName);
  return parsed.toString();
}

/** Keys whose values are identity or provenance, not links an agent shares. */
const SKIP_KEYS = new Set(["source", "siteUrl", "domain"]);

/**
 * A copy of `value` with every own-site absolute URL string tagged. Walks
 * objects and arrays; leaves `source` (provenance) untouched.
 */
export function tagUrls<T>(value: T, toolName: string): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return withUtm(v, toolName);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
        out[k] = SKIP_KEYS.has(k) ? child : walk(child);
      }
      return out;
    }
    return v;
  };
  return walk(value) as T;
}
