/**
 * Runtime configuration, read once from the environment.
 *
 * Everything here is optional. With no configuration at all the server runs
 * as a public, read-only stdio server, which is the normal desktop setup.
 * See .env.example for the documented list.
 */

export type Transport = "stdio" | "http";
export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

const LOG_LEVELS: readonly LogLevel[] = ["silent", "error", "warn", "info", "debug"];

function int(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * Number of trusted proxy hops. 0 = none (use the socket address). Legacy
 * true/yes/1 mean 1. Anything unparsable or negative means 0.
 */
export function parseTrustProxy(value: string | undefined): number {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "true" || v === "yes") return 1;
  if (!/^\d{1,2}$/.test(v)) return 0;
  return Number(v);
}

function list(value: string | undefined, fallback: readonly string[]): string[] {
  if (value === undefined || value.trim() === "") return [...fallback];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/** Host names the HTTP transport answers to by default (port is ignored). */
export const DEFAULT_ALLOWED_HOSTS: readonly string[] = [
  "localhost",
  "127.0.0.1",
  "[::1]",
  "mcp.kanchanflow.com",
];

/** Browser origins allowed by default. ":*" matches any port. */
export const DEFAULT_ALLOWED_ORIGINS: readonly string[] = [
  "https://mcp.kanchanflow.com",
  "https://kanchanflow.com",
  "https://www.kanchanflow.com",
  "http://localhost:*",
  "http://127.0.0.1:*",
];

/**
 * An absolute http(s) origin with no path, query or fragment, or null.
 * A trailing "/" is tolerated and dropped.
 */
function publicOrigin(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password || url.search || url.hash) return null;
  if (url.pathname !== "/" && url.pathname !== "") return null;
  return url.origin;
}

export interface Config {
  transport: Transport;
  port: number;
  /** URL path the Streamable HTTP endpoint is served from. Always starts with "/". */
  path: string;
  /** Bearer token required by the HTTP transport, or null for a public endpoint. */
  authToken: string | null;
  /** Requests per client per minute on the HTTP transport. 0 disables limiting. */
  rateLimitPerMinute: number;
  /**
   * Key the rate limiter on the right-most X-Forwarded-For hop (the one a
   * trusted reverse proxy appended) instead of the socket address. Only turn
   * this on behind a proxy that appends the header.
   */
  trustProxy: number;
  /** Interface the HTTP transport binds. Loopback unless set. */
  host: string;
  /** Host header names (port ignored) the MCP endpoint answers. ["*"] disables the check. */
  allowedHosts: string[];
  /** Browser Origins allowed on the MCP endpoint. ":*" is a port wildcard; ["*"] allows any. */
  allowedOrigins: string[];
  /** Public origin (e.g. https://mcp.kanchanflow.com) used to build absolute URLs, or null. */
  publicUrl: string | null;
  logLevel: LogLevel;
  /** Override for the packaged reference/ directory. */
  referenceDir: string | null;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const transport: Transport =
    (env.KANCHANFLOW_MCP_TRANSPORT ?? "stdio").toLowerCase() === "http" ? "http" : "stdio";

  const rawPath = env.KANCHANFLOW_MCP_PATH?.trim() || "/mcp";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  const rawLevel = (env.KANCHANFLOW_MCP_LOG_LEVEL ?? "info").toLowerCase() as LogLevel;
  const logLevel: LogLevel = LOG_LEVELS.includes(rawLevel) ? rawLevel : "info";

  const token = env.KANCHANFLOW_MCP_AUTH_TOKEN?.trim();

  return {
    transport,
    port: int(env.KANCHANFLOW_MCP_PORT, 3010),
    path,
    authToken: token ? token : null,
    rateLimitPerMinute: int(env.KANCHANFLOW_MCP_RATE_LIMIT, 60),
    trustProxy: parseTrustProxy(env.KANCHANFLOW_MCP_TRUST_PROXY ?? env.TRUST_PROXY),
    host: env.KANCHANFLOW_MCP_HOST?.trim() || env.HOST?.trim() || "127.0.0.1",
    allowedHosts: list(env.KANCHANFLOW_MCP_ALLOWED_HOSTS, DEFAULT_ALLOWED_HOSTS).map((h) => h.toLowerCase()),
    allowedOrigins: list(env.KANCHANFLOW_MCP_ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS),
    publicUrl: publicOrigin(env.KANCHANFLOW_MCP_PUBLIC_URL),
    logLevel,
    referenceDir: env.KANCHANFLOW_REFERENCE_DIR?.trim() || null,
  };
}
