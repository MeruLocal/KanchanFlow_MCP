/**
 * Usage logs record which client called which tool — a sanitised product
 * token only, never argument values, IPs or tokens.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { buildServer } from "../server.js";
import { logger } from "../utils/logger.js";
import { clientInfoToken, uaToken } from "../utils/user-agent.js";

describe("uaToken", () => {
  it("keeps the first product token", () => {
    expect(uaToken("claude-code/2.1.0 (linux; node 22)")).toBe("claude-code/2.1.0");
    expect(uaToken("Mozilla/5.0 (X11; Linux x86_64)")).toBe("Mozilla/5.0");
    expect(uaToken("node")).toBe("node");
  });

  it("reduces hostile values to unknown", () => {
    expect(uaToken(undefined)).toBe("unknown");
    expect(uaToken("")).toBe("unknown");
    expect(uaToken("person@example.test")).toBe("unknown");
    expect(uaToken('"quoted"/1.0')).toBe("unknown");
    expect(uaToken("a".repeat(500))).toBe("unknown");
    expect(uaToken("Bearer fake-token-value")).toBe("Bearer");
  });

  it("sanitises clientInfo the same way", () => {
    expect(clientInfoToken({ name: "inspector", version: "0.9.1" })).toEqual({ name: "inspector", version: "0.9.1" });
    expect(clientInfoToken({ name: "person@example.test", version: "x".repeat(100) })).toEqual({
      name: "unknown",
      version: "unknown",
    });
    expect(clientInfoToken(null)).toEqual({ name: "unknown", version: "unknown" });
  });
});

describe("tool.call log", () => {
  let lines: string[] = [];
  beforeEach(() => {
    lines = [];
    logger.setLevel("info");
    vi.spyOn(process.stderr, "write").mockImplementation((chunk: string | Uint8Array) => {
      lines.push(String(chunk));
      return true;
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("carries the client token and argument names, never argument values", async () => {
    const [ct, st] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "usage-test", version: "1.0.0" });
    await Promise.all([buildServer({ client: "inspector/0.9.1" }).connect(st), client.connect(ct)]);
    const SENTINEL = "SENTINEL_ARG_VALUE_42";
    await client.callTool({ name: "kanchanflow_search", arguments: { query: SENTINEL } });
    await client.close();

    const calls = lines.filter((l) => l.includes('"tool.call"')).map((l) => JSON.parse(l));
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0].client).toBe("inspector/0.9.1");
    expect(calls[0].argKeys).toEqual(["query"]);
    expect(lines.join("")).not.toContain(SENTINEL);

    const init = lines.filter((l) => l.includes('"mcp.initialize"')).map((l) => JSON.parse(l));
    expect(init[0]?.clientInfo).toEqual({ name: "usage-test", version: "1.0.0" });
  });
});
