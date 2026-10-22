/**
 * HTTP transport hardening: bind address, Host/Origin allowlists (DNS
 * rebinding), CORS, and a token comparison that does not leak length.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadConfig } from "../config.js";
import { tokensMatch } from "../server.js";
import { hostAllowed, originAllowed } from "../utils/http-guard.js";
import { mcpHeaders, request, spawnServer, TOOLS_LIST, type Spawned } from "./helpers/http.js";

describe("configuration", () => {
  it("binds loopback by default", () => {
    expect(loadConfig({}).host).toBe("127.0.0.1");
  });

  it("takes HOST, then KANCHANFLOW_MCP_HOST over it", () => {
    expect(loadConfig({ HOST: "0.0.0.0" }).host).toBe("0.0.0.0");
    expect(loadConfig({ HOST: "0.0.0.0", KANCHANFLOW_MCP_HOST: "::1" }).host).toBe("::1");
  });

  it("parses the host and origin lists, with defaults", () => {
    const d = loadConfig({});
    expect(d.allowedHosts).toEqual(["localhost", "127.0.0.1", "[::1]", "mcp.kanchanflow.com"]);
    expect(d.allowedOrigins).toContain("https://kanchanflow.com");
    expect(d.allowedOrigins).toContain("http://localhost:*");
    const c = loadConfig({
      KANCHANFLOW_MCP_ALLOWED_HOSTS: " Example.test , localhost ,",
      KANCHANFLOW_MCP_ALLOWED_ORIGINS: "https://app.example.test",
    });
    expect(c.allowedHosts).toEqual(["example.test", "localhost"]);
    expect(c.allowedOrigins).toEqual(["https://app.example.test"]);
  });
});

describe("hostAllowed", () => {
  const list = ["localhost", "127.0.0.1", "[::1]", "mcp.kanchanflow.com"];
  it("ignores the port", () => {
    expect(hostAllowed("localhost:3010", list)).toBe(true);
    expect(hostAllowed("mcp.kanchanflow.com:443", list)).toBe(true);
  });
  it("is case-insensitive", () => {
    expect(hostAllowed("MCP.KanchanFlow.com", list)).toBe(true);
  });
  it("handles bracketed IPv6", () => {
    expect(hostAllowed("[::1]:3010", list)).toBe(true);
    expect(hostAllowed("[::2]:3010", list)).toBe(false);
  });
  it("rejects look-alikes and a missing header", () => {
    expect(hostAllowed("localhost.evil.example", list)).toBe(false);
    expect(hostAllowed("evil.example", list)).toBe(false);
    expect(hostAllowed(undefined, list)).toBe(false);
  });
  it("allows anything with *", () => {
    expect(hostAllowed("evil.example", ["*"])).toBe(true);
  });
});

describe("originAllowed", () => {
  const list = loadConfig({}).allowedOrigins;
  it("matches the local port wildcard", () => {
    expect(originAllowed("http://localhost:6274", list)).toBe(true);
    expect(originAllowed("http://127.0.0.1:3010", list)).toBe(true);
    expect(originAllowed("http://localhost", list)).toBe(true);
  });
  it("matches exact origins", () => {
    expect(originAllowed("https://kanchanflow.com", list)).toBe(true);
    expect(originAllowed("http://kanchanflow.com", list)).toBe(false);
  });
  it("rejects look-alikes and non-origins", () => {
    expect(originAllowed("http://localhost:6274.evil.example", list)).toBe(false);
    expect(originAllowed("https://mcp.kanchanflow.com.evil.example", list)).toBe(false);
    expect(originAllowed("http://evil.example", list)).toBe(false);
    expect(originAllowed("null", list)).toBe(false);
    expect(originAllowed("https://kanchanflow.com/path", list)).toBe(false);
  });
});

describe("tokensMatch", () => {
  it("matches only the identical token", () => {
    expect(tokensMatch("s3cret-token", "s3cret-token")).toBe(true);
    expect(tokensMatch("s3cret-toke", "s3cret-token")).toBe(false);
    expect(tokensMatch("s3cret-tokenX", "s3cret-token")).toBe(false);
    expect(tokensMatch("", "s3cret-token")).toBe(false);
  });
});

describe("HTTP", () => {
  let server: Spawned;
  beforeAll(async () => {
    server = await spawnServer();
  }, 30_000);
  afterAll(async () => {
    await server?.stop();
  });

  it("serves a request with no Origin, without CORS headers", async () => {
    const res = await request(server.port, { method: "POST", headers: mcpHeaders(server.port), body: TOOLS_LIST });
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("refuses a foreign Host with 403", async () => {
    const res = await request(server.port, {
      method: "POST",
      headers: mcpHeaders(server.port, { host: "attacker.example" }),
      body: TOOLS_LIST,
    });
    expect(res.status).toBe(403);
  });

  it("refuses a disallowed Origin with 403", async () => {
    const res = await request(server.port, {
      method: "POST",
      headers: mcpHeaders(server.port, { origin: "http://evil.example" }),
      body: TOOLS_LIST,
    });
    expect(res.status).toBe(403);
  });

  it("answers a preflight and a POST from an allowed Origin with CORS", async () => {
    const origin = "http://localhost:6274";
    const pre = await request(server.port, {
      method: "OPTIONS",
      headers: {
        host: `127.0.0.1:${server.port}`,
        origin,
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type, mcp-protocol-version",
      },
    });
    expect(pre.status).toBe(204);
    expect(pre.headers["access-control-allow-origin"]).toBe(origin);
    expect(String(pre.headers["access-control-allow-headers"])).toContain("mcp-protocol-version");
    expect(String(pre.headers["access-control-expose-headers"])).toContain("mcp-session-id");

    const post = await request(server.port, {
      method: "POST",
      headers: mcpHeaders(server.port, { origin }),
      body: TOOLS_LIST,
    });
    expect(post.status).toBe(200);
    expect(post.headers["access-control-allow-origin"]).toBe(origin);
    expect(post.headers.vary).toContain("Origin");
  });

  it("lets the homepage console call its own endpoint (same origin)", async () => {
    const res = await request(server.port, {
      method: "POST",
      headers: mcpHeaders(server.port, { host: `localhost:${server.port}`, origin: `http://localhost:${server.port}` }),
      body: TOOLS_LIST,
    });
    expect(res.status).toBe(200);
  });

  it("keeps /health reachable for any Host", async () => {
    const res = await request(server.port, { path: "/health", headers: { host: "anything.example" } });
    expect(res.status).toBe(200);
  });
});
