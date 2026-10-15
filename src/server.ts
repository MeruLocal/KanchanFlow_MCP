/**
 * MCP server assembly.
 *
 * Two transports:
 *   stdio (default) — the host spawns this process and speaks MCP on stdio.
 *   http            — Streamable HTTP, for a hosted endpoint.
 *
 * The security posture is stated plainly because it is unusually simple: this
 * server is read-only over published website content. There is no customer
 * data behind it, no write path, and nothing that a workspace permission would
 * protect. What the HTTP transport therefore has to do is narrower than a
 * normal API: authenticate when an operator wants a private instance, limit
 * request volume, refuse malformed input, and never leak an environment value
 * or a filesystem path into a response.
 */

import http from "node:http";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { loadConfig, type Config } from "./config.js";
import { toErrorPayload, ToolError } from "./errors.js";
import { allTools } from "./tools/index.js";
import { finalizePayload, isCapped, serialise } from "./tools/finalize.js";
import { prompts } from "./prompts/index.js";
import {
  readReferenceResource,
  readSiteResource,
  referenceResources,
  siteResources,
} from "./resources/index.js";
import { homepage } from "./homepage.js";
import { assetFor, ICON_URL } from "./assets.js";
import { logger } from "./utils/logger.js";
import { RateLimiter } from "./utils/rate-limiter.js";
import { clientKey } from "./utils/client-key.js";
import { answerPreflight, applyCors, hostAllowed, isSameOrigin, originAllowed } from "./utils/http-guard.js";
import { clientInfoToken, uaToken } from "./utils/user-agent.js";
import {
  SERVER_DESCRIPTION,
  SERVER_INSTRUCTIONS,
  SERVER_NAME,
  SERVER_TITLE,
  SERVER_VERSION,
} from "./server-info.js";

/** Every tool on this server is a read-only, non-destructive, closed-world query. */
const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

/** Per-request context. Only sanitised, non-identifying values belong here. */
export interface RequestContext {
  /** Product token of the caller's User-Agent (see utils/user-agent.ts). */
  client?: string;
  /**
   * Public origin (KANCHANFLOW_MCP_PUBLIC_URL). When set, the server info
   * carries the brand icon as an absolute URL.
   */
  publicUrl?: string | null;
}

export function buildServer(ctx: RequestContext = {}): McpServer {
  const icons = ctx.publicUrl
    ? [{ src: `${ctx.publicUrl}${ICON_URL}`, mimeType: "image/png", sizes: ["192x192"] }]
    : undefined;
  const server = new McpServer(
    { name: SERVER_NAME, title: SERVER_TITLE, version: SERVER_VERSION, ...(icons ? { icons } : {}) },
    {
      capabilities: { tools: {}, resources: {}, prompts: {} },
      instructions: SERVER_INSTRUCTIONS,
    }
  );

  /* ---------------------------------------------------------------- tools */
  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        ...(tool.outputSchema ? { outputSchema: tool.outputSchema } : {}),
        annotations: { title: tool.title, ...READ_ONLY_ANNOTATIONS },
      },
      // The SDK has already validated args against the tool's input schema by
      // the time this runs, so a handler only deals with semantic failures.
      (args: Record<string, unknown>) => {
        const requestId = randomUUID();
        const started = Date.now();
        try {
          // Freshness, UTM tags and the size cap, applied once so the text
          // and structuredContent are the same object.
          const payload = finalizePayload(tool, tool.handler(args ?? {}));
          const over = isCapped(payload);
          logger.info("tool.call", {
            requestId,
            tool: tool.name,
            ...(ctx.client ? { client: ctx.client } : {}),
            argKeys: Object.keys(args ?? {}),
            outcome: over ? "capped" : "success",
            durationMs: Date.now() - started,
          });
          const content = [{ type: "text" as const, text: serialise(payload) }];
          if (!tool.outputSchema) return { content };
          // A capped payload does not match the tool's output schema; report
          // it as an error result (which the SDK does not validate) carrying
          // the same note on how to narrow the request.
          if (over) return { content, isError: true };
          return { content, structuredContent: payload as Record<string, unknown> };
        } catch (err) {
          const payload = toErrorPayload(err);
          logger.warn("tool.call", {
            requestId,
            tool: tool.name,
            ...(ctx.client ? { client: ctx.client } : {}),
            argKeys: Object.keys(args ?? {}),
            outcome: "error",
            errorCode: payload.error.code,
            durationMs: Date.now() - started,
            // The raw message is only logged for a failure we did not model,
            // and only server-side. It never reaches the client.
            ...(err instanceof ToolError ? {} : { internal: (err as Error)?.message }),
          });
          return {
            content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
            isError: true,
          };
        }
      }
    );
  }

  /* ------------------------------------------------------------ resources */
  for (const resource of siteResources) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: resource.title,
        description: resource.description,
        mimeType: resource.mimeType,
      },
      (uri: URL) => {
        const read = readSiteResource(uri.href);
        if (!read) throw new Error(`Unknown resource: ${uri.href}`);
        return { contents: [read] };
      }
    );
  }

  for (const doc of referenceResources()) {
    server.registerResource(
      doc.name,
      doc.uri,
      { title: doc.title, description: doc.description, mimeType: doc.mimeType },
      (uri: URL) => ({ contents: [readReferenceResource(uri.href)] })
    );
  }

  /* -------------------------------------------------------------- prompts */
  for (const prompt of prompts) {
    server.registerPrompt(
      prompt.name,
      {
        title: prompt.title,
        description: prompt.description,
        argsSchema: prompt.argsSchema,
      },
      (args: Record<string, string | undefined>) => ({
        messages: [
          {
            role: "user" as const,
            content: { type: "text" as const, text: prompt.build(args ?? {}) },
          },
        ],
      })
    );
  }

  // Over stdio one server lives for the whole session, so the client's
  // identity is known once initialization completes. (Over stateless HTTP the
  // initialize request is logged from its body in runHttp instead.)
  server.server.oninitialized = () => {
    const info = server.server.getClientVersion();
    if (info) logger.info("mcp.initialize", { clientInfo: clientInfoToken(info) });
  };

  return server;
}

/* ------------------------------------------------------------------ */
/* stdio                                                               */
/* ------------------------------------------------------------------ */

async function runStdio(config: Config): Promise<void> {
  const server = buildServer({ publicUrl: config.publicUrl });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("server.ready", {
    transport: "stdio",
    version: SERVER_VERSION,
    tools: allTools.length,
    resources: siteResources.length + referenceResources().length,
    prompts: prompts.length,
  });
}

/* ------------------------------------------------------------------ */
/* Streamable HTTP                                                     */
/* ------------------------------------------------------------------ */

/** Largest MCP request body accepted. Anything bigger is refused with 413. */
export const MAX_BODY_BYTES = 1024 * 1024;

/** The request body is larger than MAX_BODY_BYTES. */
export class BodyTooLarge extends Error {
  constructor() {
    super("payload too large");
    this.name = "BodyTooLarge";
  }
}

/** The request body is not valid JSON. */
export class BadJson extends Error {
  constructor() {
    super("invalid JSON");
    this.name = "BadJson";
  }
}

function bearerToken(req: http.IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (!header || Array.isArray(header)) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match ? match[1]! : null;
}

/**
 * Constant-time token comparison. Both sides are hashed to fixed 32-byte
 * digests first, so neither the content nor the length of the configured
 * token can be probed through response timing.
 */
export function tokensMatch(presented: string, expected: string): boolean {
  const a = createHash("sha256").update(presented, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

function sendJson(res: http.ServerResponse, status: number, body: unknown, headers: http.OutgoingHttpHeaders = {}): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    ...headers,
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

/**
 * Read and parse a JSON body. Throws BodyTooLarge past MAX_BODY_BYTES (checked
 * against Content-Length before reading, and again while streaming) and
 * BadJson when the bytes do not parse. An empty body is `undefined`.
 */
async function readBody(req: http.IncomingMessage): Promise<unknown> {
  const declared = Number(req.headers["content-length"]);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new BodyTooLarge();

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new BodyTooLarge();
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new BadJson();
  }
}

/** The JSON-RPC initialize request in a body (single or batch), if any. */
function initializeParams(body: unknown): unknown {
  const messages = Array.isArray(body) ? body : [body];
  for (const m of messages) {
    if (m && typeof m === "object" && (m as { method?: unknown }).method === "initialize") {
      return ((m as { params?: { clientInfo?: unknown } }).params ?? {}).clientInfo;
    }
  }
  return undefined;
}

/** GET /.well-known/mcp.json — where this server's MCP endpoint is. */
export function discoveryDocument(config: Config): Record<string, unknown> {
  return {
    name: SERVER_NAME,
    title: SERVER_TITLE,
    version: SERVER_VERSION,
    description: SERVER_DESCRIPTION,
    endpoint: config.publicUrl ? `${config.publicUrl}${config.path}` : config.path,
    transport: "streamable-http",
    stateless: true,
    auth: config.authToken ? "bearer" : "none",
  };
}

export const DISCOVERY_PATH = "/.well-known/mcp.json";

/** Seams for tests. Production uses the defaults. */
export interface HttpDeps {
  buildServer?: (ctx: RequestContext) => McpServer;
}

/** The HTTP server, not yet listening. runHttp() binds it. */
export function createHttpServer(config: Config, deps: HttpDeps = {}): http.Server {
  const limiter = new RateLimiter(config.rateLimitPerMinute);
  const build = deps.buildServer ?? buildServer;

  return http.createServer((req, res) => {
    void (async () => {
      const requestId = randomUUID();
      const started = Date.now();
      const ua = uaToken(req.headers["user-agent"]);
      // Only the path is used. The Host header is caller-controlled and is
      // never used to build a URL.
      let pathname = "/";
      try {
        pathname = new URL(req.url ?? "/", "http://localhost").pathname;
      } catch {
        pathname = "/";
      }

      const finish = (status: number, note?: string): void => {
        logger.info("http.request", {
          requestId,
          method: req.method,
          path: pathname,
          status,
          ua,
          durationMs: Date.now() - started,
          ...(note ? { note } : {}),
        });
      };

      // Brand artwork for the homepage and the browser tab. Public and
      // read-only, like the page that references it. This is an allowlist of
      // three filenames, not a static file server — see src/assets.ts.
      // /favicon.ico is aliased onto the icon so a browser that asks for it by
      // convention gets one instead of a 404 in the log.
      const assetPath = pathname === "/favicon.ico" ? ICON_URL : pathname;
      const asset = assetFor(assetPath);
      if (asset) {
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.writeHead(405, { allow: "GET, HEAD" });
          res.end();
          finish(405);
          return;
        }
        if (req.headers["if-none-match"] === asset.etag) {
          res.writeHead(304, { etag: asset.etag });
          res.end();
          finish(304);
          return;
        }
        res.writeHead(200, {
          "content-type": asset.contentType,
          "content-length": asset.bytes.length,
          "cache-control": "public, max-age=86400",
          "x-content-type-options": "nosniff",
          etag: asset.etag,
        });
        res.end(req.method === "HEAD" ? undefined : asset.bytes);
        finish(200);
        return;
      }

      // The homepage. Reachable without a token: it is generated from the
      // same registries the protocol advertises and contains nothing a client
      // could not already list. GET/HEAD only, so it can never be a write path.
      if (pathname === "/" || pathname === "/index.html") {
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.writeHead(405, { allow: "GET, HEAD" });
          res.end();
          finish(405);
          return;
        }
        const page = homepage(config);
        if (req.headers["if-none-match"] === page.etag) {
          res.writeHead(304, { etag: page.etag });
          res.end();
          finish(304);
          return;
        }
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "content-length": Buffer.byteLength(page.html),
          "x-content-type-options": "nosniff",
          "referrer-policy": "no-referrer",
          etag: page.etag,
        });
        res.end(req.method === "HEAD" ? undefined : page.html);
        finish(200);
        return;
      }

      // Health probe, deliberately reachable without a token so an
      // orchestrator can use it. It reports liveness and nothing else.
      if (pathname === "/health") {
        sendJson(res, 200, { status: "ok", service: SERVER_NAME, version: SERVER_VERSION });
        finish(200);
        return;
      }

      // Discovery document. Public, cacheable, and deliberately free of a
      // tool list: agents read tools/list for that.
      if (pathname === DISCOVERY_PATH) {
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.writeHead(405, { allow: "GET, HEAD" });
          res.end();
          finish(405);
          return;
        }
        const text = JSON.stringify(discoveryDocument(config), null, 2);
        res.writeHead(200, {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(text),
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=3600",
          "x-content-type-options": "nosniff",
        });
        res.end(req.method === "HEAD" ? undefined : text);
        finish(200);
        return;
      }

      if (pathname !== config.path) {
        sendJson(res, 404, { error: { code: "NOT_FOUND", message: "No such endpoint." } });
        finish(404);
        return;
      }

      // DNS-rebinding guard. Runs before the limiter so a refused request
      // costs nothing, and before auth so CORS headers are on 401s and 429s.
      if (!hostAllowed(req.headers.host, config.allowedHosts)) {
        sendJson(res, 403, { error: { code: "FORBIDDEN", message: "Host not allowed." } });
        finish(403, "host-not-allowed");
        return;
      }
      const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
      if (origin !== undefined) {
        if (!originAllowed(origin, config.allowedOrigins) && !isSameOrigin(origin, req.headers.host)) {
          sendJson(res, 403, { error: { code: "FORBIDDEN", message: "Origin not allowed." } });
          finish(403, "origin-not-allowed");
          return;
        }
        if (req.method === "OPTIONS") {
          answerPreflight(res, origin);
          finish(204, "preflight");
          return;
        }
        applyCors(res, origin);
      }

      const decision = limiter.check(clientKey(req, config.trustProxy));
      if (!decision.allowed) {
        res.setHeader("retry-after", String(decision.resetSeconds));
        sendJson(res, 429, {
          error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." },
        });
        finish(429, "rate-limited");
        return;
      }

      if (config.authToken) {
        const presented = bearerToken(req);
        if (!presented || !tokensMatch(presented, config.authToken)) {
          res.setHeader("www-authenticate", 'Bearer realm="kanchanflow-mcp"');
          sendJson(res, 401, {
            error: { code: "UNAUTHORIZED", message: "A bearer token is required for this endpoint." },
          });
          finish(401, "unauthorized");
          return;
        }
      }

      // Read and parse the body before any server is built, so an oversized
      // or junk body costs nothing beyond the read.
      let body: unknown;
      try {
        body = req.method === "POST" ? await readBody(req) : undefined;
      } catch (err) {
        if (err instanceof BodyTooLarge) {
          sendJson(
            res,
            413,
            { error: { code: "VALIDATION_ERROR", message: "Request body exceeds 1 MB." } },
            { connection: "close" }
          );
          finish(413, "body-too-large");
          return;
        }
        if (err instanceof BadJson) {
          sendJson(res, 400, { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
          finish(400, "parse-error");
          return;
        }
        throw err;
      }

      const clientInfo = initializeParams(body);
      if (clientInfo !== undefined) {
        logger.info("mcp.initialize", { requestId, ua, clientInfo: clientInfoToken(clientInfo) });
      }

      // A fresh server and transport per request: stateless mode. Nothing is
      // shared between callers, so one session can never observe another.
      try {
        const server = build({ client: ua, publicUrl: config.publicUrl });
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        res.on("close", () => {
          void transport.close();
          void server.close();
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, body);
        finish(res.statusCode);
      } catch (err) {
        // A failure here is ours, not the caller's: report it as 500 with the
        // generic message. The real message is logged server-side only.
        logger.error("http.error", { requestId, internal: (err as Error)?.message });
        if (!res.headersSent) sendJson(res, 500, toErrorPayload(err));
        finish(res.statusCode || 500, "error");
      }
    })().catch((err: unknown) => {
      logger.error("http.error", { internal: (err as Error)?.message });
      if (!res.headersSent) sendJson(res, 500, toErrorPayload(err));
    });
  });
}

async function runHttp(config: Config): Promise<void> {
  const httpServer = createHttpServer(config);

  // listen() reports failure through an 'error' event, not a throw. Without
  // this the common case — a stale server still holding the port — surfaces as
  // an unhandled event and a raw Node stack trace.
  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        reject(
          new Error(
            `Port ${config.port} is already in use. Stop the process using it, or set KANCHANFLOW_MCP_PORT to a free port.`
          )
        );
        return;
      }
      reject(err);
    });
    httpServer.listen(config.port, config.host, resolve);
  });
  logger.info("server.ready", {
    transport: "http",
    host: config.host,
    port: config.port,
    path: config.path,
    homepage: config.publicUrl ? `${config.publicUrl}/` : `http://localhost:${config.port}/`,
    publicUrl: config.publicUrl,
    authRequired: config.authToken !== null,
    rateLimitPerMinute: config.rateLimitPerMinute,
    trustProxy: config.trustProxy,
    allowedHosts: config.allowedHosts,
    version: SERVER_VERSION,
    tools: allTools.length,
    prompts: prompts.length,
  });

  const shutdown = (): void => {
    logger.info("server.shutdown", {});
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

/* ------------------------------------------------------------------ */

export async function runServer(config: Config = loadConfig()): Promise<void> {
  logger.setLevel(config.logLevel);
  logger.debug("server.start", { transport: config.transport, description: SERVER_DESCRIPTION });

  if (config.transport === "http") {
    await runHttp(config);
    return;
  }
  await runStdio(config);
}
