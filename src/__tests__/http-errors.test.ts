/**
 * HTTP status for oversized bodies, bad JSON and internal failures.
 *
 * Before: every failure was 400 "Malformed MCP request", and the body was read
 * after a server had been built. These tests run the real request handler
 * in-process so a seam can count server builds and force a failure.
 */

import type http from "node:http";

import { afterEach, describe, expect, it } from "vitest";

import { loadConfig } from "../config.js";
import { buildServer, createHttpServer, type RequestContext } from "../server.js";
import { mcpHeaders, request, TOOLS_LIST } from "./helpers/http.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const config = loadConfig({ KANCHANFLOW_MCP_TRANSPORT: "http", KANCHANFLOW_MCP_LOG_LEVEL: "silent" });

let running: http.Server | null = null;

async function start(build: (ctx: RequestContext) => McpServer): Promise<number> {
  running = createHttpServer(config, { buildServer: build });
  await new Promise<void>((resolve) => running!.listen(0, "127.0.0.1", resolve));
  const addr = running.address();
  return typeof addr === "object" && addr ? addr.port : 0;
}

afterEach(async () => {
  await new Promise<void>((resolve) => (running ? running.close(() => resolve()) : resolve()));
  running = null;
});

describe("body errors", () => {
  it("answers a 1.5 MB body with 413 and builds no server", async () => {
    let builds = 0;
    const port = await start((ctx) => {
      builds += 1;
      return buildServer(ctx);
    });
    const res = await request(port, {
      method: "POST",
      headers: mcpHeaders(port),
      body: Buffer.alloc(1.5 * 1024 * 1024, 0x20),
    });
    expect(res.status).toBe(413);
    expect(JSON.parse(res.body).error.code).toBe("VALIDATION_ERROR");
    expect(builds).toBe(0);
  });

  it("answers bad JSON with a JSON-RPC -32700 parse error", async () => {
    let builds = 0;
    const port = await start((ctx) => {
      builds += 1;
      return buildServer(ctx);
    });
    const res = await request(port, { method: "POST", headers: mcpHeaders(port), body: "{bad json" });
    expect(res.status).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.jsonrpc).toBe("2.0");
    expect(body.id).toBeNull();
    expect(body.error.code).toBe(-32700);
    expect(builds).toBe(0);
  });

  it("still serves a normal request", async () => {
    const port = await start(buildServer);
    const res = await request(port, { method: "POST", headers: mcpHeaders(port), body: TOOLS_LIST });
    expect(res.status).toBe(200);
  });
});

describe("internal failures", () => {
  it("answers 500 with the generic message and no internals", async () => {
    const port = await start(() => {
      throw new Error("boom at /srv/secret/path.ts:12");
    });
    const res = await request(port, { method: "POST", headers: mcpHeaders(port), body: TOOLS_LIST });
    expect(res.status).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(res.body).not.toContain("boom");
    expect(res.body).not.toContain("/srv/");
    expect(res.body).not.toMatch(/\bat\s+\S+:\d+/);
  });
});
