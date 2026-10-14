/**
 * The rate-limit key must not be caller-controlled.
 *
 * On main the limiter keyed on the FIRST X-Forwarded-For value, which the
 * caller writes, so rotating it minted a fresh bucket per request and the
 * limit never tripped. The HTTP test at the bottom fails against that code.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { loadConfig } from "../config.js";
import { toolsByName } from "../tools/index.js";
import { clientKey } from "../utils/client-key.js";
import { mcpHeaders, request, spawnServer, TOOLS_LIST, type Spawned } from "./helpers/http.js";

type KeyReq = Parameters<typeof clientKey>[0];
const req = (xff: string | string[] | undefined, remoteAddress = "10.0.0.9"): KeyReq =>
  ({ headers: xff === undefined ? {} : { "x-forwarded-for": xff }, socket: { remoteAddress } }) as unknown as KeyReq;

describe("clientKey", () => {
  it("ignores X-Forwarded-For with 0 hops", () => {
    expect(clientKey(req("203.0.113.1"), 0)).toBe("10.0.0.9");
    expect(clientKey(req(undefined), 0)).toBe("10.0.0.9");
  });

  it("1 hop takes the right-most entry", () => {
    expect(clientKey(req("198.51.100.7, 203.0.113.1"), 1)).toBe("203.0.113.1");
    expect(clientKey(req("203.0.113.1"), 1)).toBe("203.0.113.1");
  });

  it("2 hops take the second from the right", () => {
    expect(clientKey(req("198.51.100.7, 203.0.113.1"), 2)).toBe("198.51.100.7");
  });

  it("a 3-hop header with N=2 ignores the client-supplied left entry", () => {
    expect(clientKey(req("192.0.2.66, 198.51.100.7, 203.0.113.1"), 2)).toBe("198.51.100.7");
  });

  it("falls back to the socket when the header is shorter than the hop count", () => {
    expect(clientKey(req("203.0.113.1"), 2)).toBe("10.0.0.9");
  });

  it("joins array headers before counting", () => {
    expect(clientKey(req(["198.51.100.7", "203.0.113.2"]), 1)).toBe("203.0.113.2");
  });

  it("falls back to the socket on a missing, blank or oversized header", () => {
    expect(clientKey(req(undefined), 1)).toBe("10.0.0.9");
    expect(clientKey(req("  ,  "), 1)).toBe("10.0.0.9");
    expect(clientKey(req(`1.2.3.4, ${"x".repeat(65)}`), 1)).toBe("10.0.0.9");
  });

  it("never reads CF-Connecting-IP", () => {
    const r = { headers: { "cf-connecting-ip": "192.0.2.99" }, socket: { remoteAddress: "10.0.0.9" } } as unknown as KeyReq;
    expect(clientKey(r, 1)).toBe("10.0.0.9");
    expect(clientKey(r, 2)).toBe("10.0.0.9");
  });
});

describe("configuration", () => {
  it("defaults to 60/min and no trusted proxy hops", () => {
    const c = loadConfig({});
    expect(c.rateLimitPerMinute).toBe(60);
    expect(c.trustProxy).toBe(0);
  });

  it("parses KANCHANFLOW_MCP_TRUST_PROXY and TRUST_PROXY as a hop count", () => {
    for (const v of ["1", "true", "YES"]) {
      expect(loadConfig({ KANCHANFLOW_MCP_TRUST_PROXY: v }).trustProxy).toBe(1);
      expect(loadConfig({ TRUST_PROXY: v }).trustProxy).toBe(1);
    }
    expect(loadConfig({ KANCHANFLOW_MCP_TRUST_PROXY: "2" }).trustProxy).toBe(2);
    expect(loadConfig({ TRUST_PROXY: " 3 " }).trustProxy).toBe(3);
    expect(loadConfig({ KANCHANFLOW_MCP_TRUST_PROXY: "0" }).trustProxy).toBe(0);
    for (const v of ["no", "false", "", "-1", "1.5", "two", "999"]) {
      expect(loadConfig({ TRUST_PROXY: v }).trustProxy).toBe(0);
    }
  });
});

describe("free-text input caps", () => {
  const field = (tool: string, key: string) => toolsByName.get(tool)?.inputSchema[key] as z.ZodTypeAny;
  const cases: [string, string, number][] = [
    ["kanchanflow_search", "query", 200],
    ["kanchanflow_search_reference", "query", 200],
    ["kanchanflow_get_reference_document", "path", 512],
  ];
  for (const [tool, key, max] of cases) {
    it(`${tool}.${key} accepts ${max} characters and refuses ${max + 1}`, () => {
      expect(field(tool, key).safeParse("a".repeat(max)).success).toBe(true);
      expect(field(tool, key).safeParse("a".repeat(max + 1)).success).toBe(false);
    });
  }
});

describe("HTTP: rotating X-Forwarded-For does not escape the limit", () => {
  let server: Spawned;
  beforeAll(async () => {
    server = await spawnServer({ KANCHANFLOW_MCP_RATE_LIMIT: "3" });
  }, 30_000);
  afterAll(async () => {
    await server?.stop();
  });

  it("returns 429 on the 4th and 5th request", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const res = await request(server.port, {
        method: "POST",
        headers: mcpHeaders(server.port, { "x-forwarded-for": `198.51.100.${i + 1}` }),
        body: TOOLS_LIST,
      });
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 3)).toEqual([200, 200, 200]);
    expect(statuses.slice(3)).toEqual([429, 429]);
  });
});
