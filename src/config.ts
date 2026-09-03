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

export interface Config {
  transport: Transport;
  port: number;
  /** URL path the Streamable HTTP endpoint is served from. Always starts with "/". */
  path: string;
  /** Bearer token required by the HTTP transport, or null for a public endpoint. */
  authToken: string | null;
  /** Requests per IP per minute on the HTTP transport. 0 disables limiting. */
  rateLimitPerMinute: number;
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
    rateLimitPerMinute: int(env.KANCHANFLOW_MCP_RATE_LIMIT, 120),
    logLevel,
    referenceDir: env.KANCHANFLOW_REFERENCE_DIR?.trim() || null,
  };
}
