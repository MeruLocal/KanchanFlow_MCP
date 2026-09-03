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
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { loadConfig, type Config } from "./config.js";
import { toErrorPayload, ToolError } from "./errors.js";
import { allTools } from "./tools/index.js";
import { prompts } from "./prompts/index.js";
import {
  readReferenceResource,
  readSiteResource,
  referenceResources,
  siteResources,
} from "./resources/index.js";
import { homepage } from "./homepage.js";
import { logger } from "./utils/logger.js";
import { RateLimiter } from "./utils/rate-limiter.js";
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

export function buildServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, title: SERVER_TITLE, version: SERVER_VERSION },
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
        annotations: { title: tool.title, ...READ_ONLY_ANNOTATIONS },
      },
      // The SDK has already validated args against the tool's input schema by
      // the time this runs, so a handler only deals with semantic failures.
      (args: Record<string, unknown>) => {
        const requestId = randomUUID();
        const started = Date.now();
        try {
          const payload = tool.handler(args ?? {});
          logger.info("tool.call", {
            requestId,
            tool: tool.name,
            argKeys: Object.keys(args ?? {}),
            outcome: "success",
            durationMs: Date.now() - started,
          });
          return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
        } catch (err) {
          const payload = toErrorPayload(err);
          logger.warn("tool.call", {
            requestId,
            tool: tool.name,
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

  return server;
}

/* ------------------------------------------------------------------ */
/* stdio                                                               */
/* ------------------------------------------------------------------ */

async function runStdio(): Promise<void> {
  const server = buildServer();
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

/** Largest MCP request body accepted. Anything bigger is refused unread. */
const MAX_BODY_BYTES = 1024 * 1024;

function clientKey(req: http.IncomingMessage): string {
  // Trust only the first hop of X-Forwarded-For, and fall back to the socket.
  // This is a rate-limit key, never an authorisation input.
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (first ?? req.socket.remoteAddress ?? "unknown").trim();
}

function bearerToken(req: http.IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (!header || Array.isArray(header)) return null;
  const [scheme, value] = header.split(" ");
  if (!value || scheme?.toLowerCase() !== "bearer") return null;
  return value.trim();
}

/** Constant-time-ish comparison, so a token cannot be probed byte by byte. */
function tokensMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(text) });
  res.end(text);
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new Error("payload too large");
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function runHttp(config: Config): Promise<void> {
  const limiter = new RateLimiter(config.rateLimitPerMinute);

  const httpServer = http.createServer((req, res) => {
    void (async () => {
      const requestId = randomUUID();
      const started = Date.now();
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

      const finish = (status: number, note?: string): void => {
        logger.info("http.request", {
          requestId,
          method: req.method,
          path: url.pathname,
          status,
          durationMs: Date.now() - started,
          ...(note ? { note } : {}),
        });
      };

      // The homepage. Reachable without a token: it is generated from the
      // same registries the protocol advertises and contains nothing a client
      // could not already list. GET/HEAD only, so it can never be a write path.
      if (url.pathname === "/" || url.pathname === "/index.html") {
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
      if (url.pathname === "/health") {
        sendJson(res, 200, { status: "ok", service: SERVER_NAME, version: SERVER_VERSION });
        finish(200);
        return;
      }

      if (url.pathname !== config.path) {
        sendJson(res, 404, { error: { code: "NOT_FOUND", message: "No such endpoint." } });
        finish(404);
        return;
      }

      const decision = limiter.check(clientKey(req));
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

      // A fresh server and transport per request: stateless mode. Nothing is
      // shared between callers, so one session can never observe another.
      const server = buildServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

      res.on("close", () => {
        void transport.close();
        void server.close();
      });

      try {
        await server.connect(transport);
        const body = req.method === "POST" ? await readBody(req) : undefined;
        await transport.handleRequest(req, res, body);
        finish(res.statusCode);
      } catch (err) {
        logger.error("http.error", { requestId, internal: (err as Error)?.message });
        if (!res.headersSent) {
          sendJson(res, 400, {
            error: { code: "VALIDATION_ERROR", message: "Malformed MCP request." },
          });
        }
        finish(res.statusCode || 400, "error");
      }
    })();
  });

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
    httpServer.listen(config.port, resolve);
  });
  logger.info("server.ready", {
    transport: "http",
    port: config.port,
    path: config.path,
    homepage: `http://localhost:${config.port}/`,
    authRequired: config.authToken !== null,
    rateLimitPerMinute: config.rateLimitPerMinute,
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
  await runStdio();
}
