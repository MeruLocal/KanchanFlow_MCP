/**
 * Security boundaries.
 *
 * The properties asserted here are the ones that would be quietly lost in a
 * refactor: no write tool appears, no secret escapes, no path escapes, an
 * unmodelled error is not echoed back, and the rate limiter actually limits.
 */

import { describe, expect, it, beforeEach } from "vitest";

import { allTools, toolsByName } from "../tools/index.js";
import { siteResources, readSiteResource } from "../resources/index.js";
import { toErrorPayload, ToolError } from "../errors.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { loadConfig } from "../config.js";
import { loadMirror } from "../data/mirror.js";

describe("no write surface", () => {
  it("exposes only read tools", () => {
    // Belt and braces alongside the name check: no handler may reference a
    // filesystem write or a network call.
    for (const tool of allTools) {
      const source = tool.handler.toString();
      expect(source, tool.name).not.toMatch(/writeFileSync|writeFile|unlink|rmSync|fetch\(/);
    }
  });
});

describe("secret containment", () => {
  /**
   * Sentinel values planted in the environment. Asserting on the values, not on
   * words like "password", is the honest test: the published content legitimately
   * discusses passwords and SSO, and a word-list check would fail on prose while
   * still missing an actual leak.
   */
  const SENTINELS: Record<string, string> = {
    KANCHANFLOW_MCP_AUTH_TOKEN: "sentinel-auth-8f2c1d",
    AWS_SECRET_ACCESS_KEY: "sentinel-aws-4b91ae",
    DATABASE_URL: "sentinel-db-77c30f",
    OPENAI_API_KEY: "sentinel-api-19de52",
  };

  it("returns no environment value or variable name from any zero-argument tool", () => {
    Object.assign(process.env, SENTINELS);
    try {
      for (const tool of allTools) {
        if (Object.keys(tool.inputSchema).length > 0) continue;
        const text = JSON.stringify(tool.handler({}));
        for (const [name, value] of Object.entries(SENTINELS)) {
          expect(text, `${tool.name} leaked the value of ${name}`).not.toContain(value);
          expect(text, `${tool.name} leaked the name ${name}`).not.toContain(name);
        }
      }
    } finally {
      for (const name of Object.keys(SENTINELS)) delete process.env[name];
    }
  });

  it("returns no absolute filesystem path from a reference listing", () => {
    const data = JSON.stringify(toolsByName.get("kanchanflow_list_reference_documents")!.handler({}));
    expect(data).not.toMatch(/"\/(home|Users|sessions|var|etc)\//);
    expect(data).not.toMatch(/[A-Z]:\\\\/);
  });

  it("serves resources only from the fixed URI list", () => {
    expect(readSiteResource("kanchanflow://site/company")).not.toBeNull();
    expect(readSiteResource("kanchanflow://site/../../.env")).toBeNull();
    expect(readSiteResource("kanchanflow://config/authToken")).toBeNull();
    expect(readSiteResource("file:///etc/passwd")).toBeNull();
  });

  it("carries no secret in any resource payload", () => {
    process.env.KANCHANFLOW_MCP_AUTH_TOKEN = "resource-token-must-not-leak-xyz";
    try {
      for (const resource of siteResources) {
        const read = readSiteResource(resource.uri);
        expect(read).not.toBeNull();
        expect(read!.text).not.toContain("resource-token-must-not-leak-xyz");
      }
    } finally {
      delete process.env.KANCHANFLOW_MCP_AUTH_TOKEN;
    }
  });
});

describe("error redaction", () => {
  it("preserves a deliberate ToolError", () => {
    const payload = toErrorPayload(new ToolError("NOT_FOUND", "No such feature.", { didYouMean: ["a"] }));
    expect(payload.error.code).toBe("NOT_FOUND");
    expect(payload.error.message).toBe("No such feature.");
  });

  it("never echoes an unmodelled error message", () => {
    const leaky = new Error("ENOENT: /home/deploy/secrets/token.pem not found");
    const payload = toErrorPayload(leaky);
    expect(payload.error.code).toBe("INTERNAL_ERROR");
    expect(payload.error.message).not.toContain("/home/deploy");
    expect(payload.error.message).not.toContain("token.pem");
  });

  it("never echoes a thrown string", () => {
    const payload = toErrorPayload("/etc/shadow could not be read");
    expect(payload.error.code).toBe("INTERNAL_ERROR");
    expect(payload.error.message).not.toContain("/etc/shadow");
  });
});

describe("input rejection", () => {
  it("refuses a path traversal through the reference tool", () => {
    const tool = toolsByName.get("kanchanflow_get_reference_document")!;
    for (const attempt of ["../../.env", "/etc/passwd", "../package.json", "..\\..\\.env"]) {
      try {
        tool.handler({ path: attempt });
        throw new Error(`should have refused ${attempt}`);
      } catch (err) {
        expect(err, attempt).toBeInstanceOf(ToolError);
        expect(["VALIDATION_ERROR", "NOT_FOUND"]).toContain((err as ToolError).code);
      }
    }
  });

  it("refuses an unsupported country rather than guessing a rate", () => {
    const tool = toolsByName.get("kanchanflow_convert_price")!;
    expect(() => tool.handler({ countryCode: "ZZ", amountUsd: 10 })).toThrow(ToolError);
  });

  it("refuses a too-short search rather than returning everything", () => {
    const tool = toolsByName.get("kanchanflow_search")!;
    expect(() => tool.handler({ query: "a" })).toThrow(ToolError);
  });
});

describe("rate limiter", () => {
  let limiter: RateLimiter;
  beforeEach(() => {
    limiter = new RateLimiter(3, 60_000);
  });

  it("allows up to the limit then refuses", () => {
    const now = Date.now();
    expect(limiter.check("1.1.1.1", now).allowed).toBe(true);
    expect(limiter.check("1.1.1.1", now).allowed).toBe(true);
    expect(limiter.check("1.1.1.1", now).allowed).toBe(true);
    const refused = limiter.check("1.1.1.1", now);
    expect(refused.allowed).toBe(false);
    expect(refused.remaining).toBe(0);
    expect(refused.resetSeconds).toBeGreaterThan(0);
  });

  it("keys separately per client", () => {
    const now = Date.now();
    for (let i = 0; i < 3; i += 1) limiter.check("1.1.1.1", now);
    expect(limiter.check("1.1.1.1", now).allowed).toBe(false);
    expect(limiter.check("2.2.2.2", now).allowed).toBe(true);
  });

  it("resets after the window", () => {
    const now = Date.now();
    for (let i = 0; i < 4; i += 1) limiter.check("1.1.1.1", now);
    expect(limiter.check("1.1.1.1", now).allowed).toBe(false);
    expect(limiter.check("1.1.1.1", now + 60_001).allowed).toBe(true);
  });

  it("is disabled at zero", () => {
    const off = new RateLimiter(0);
    expect(off.enabled).toBe(false);
    for (let i = 0; i < 1000; i += 1) expect(off.check("1.1.1.1").allowed).toBe(true);
  });
});

describe("configuration", () => {
  it("defaults to a public read-only stdio server", () => {
    const config = loadConfig({});
    expect(config.transport).toBe("stdio");
    expect(config.authToken).toBeNull();
    expect(config.rateLimitPerMinute).toBe(60);
    expect(config.path).toBe("/mcp");
  });

  it("reads the http transport and normalises the path", () => {
    const config = loadConfig({
      KANCHANFLOW_MCP_TRANSPORT: "HTTP",
      KANCHANFLOW_MCP_PATH: "api/mcp",
      KANCHANFLOW_MCP_PORT: "8080",
      KANCHANFLOW_MCP_AUTH_TOKEN: "  secret  ",
    });
    expect(config.transport).toBe("http");
    expect(config.path).toBe("/api/mcp");
    expect(config.port).toBe(8080);
    expect(config.authToken).toBe("secret");
  });

  it("falls back rather than accepting nonsense", () => {
    const config = loadConfig({
      KANCHANFLOW_MCP_PORT: "not-a-port",
      KANCHANFLOW_MCP_LOG_LEVEL: "loud",
      KANCHANFLOW_MCP_TRANSPORT: "carrier-pigeon",
    });
    expect(config.port).toBe(3010);
    expect(config.logLevel).toBe("info");
    expect(config.transport).toBe("stdio");
  });

  it("treats an empty auth token as no token", () => {
    expect(loadConfig({ KANCHANFLOW_MCP_AUTH_TOKEN: "   " }).authToken).toBeNull();
  });
});

describe("no fabricated evidence reaches a client", () => {
  const m = loadMirror();

  it("publishes no review score or rating anywhere in the mirror", () => {
    // site.forbiddenSchemaTypes names these deliberately, so exclude that field
    // and assert on everything else.
    const { site, ...rest } = m;
    const { forbiddenSchemaTypes, ...siteRest } = site;
    const text = JSON.stringify({ ...rest, site: siteRest }).toLowerCase();
    expect(forbiddenSchemaTypes).toContain("AggregateRating");
    expect(text).not.toContain("aggregaterating");
    expect(text).not.toContain("ratingvalue");
    expect(text).not.toContain('"reviewcount"');
  });

  it("names no parent brand the site contract forbids", () => {
    const text = JSON.stringify(m).toLowerCase();
    for (const banned of ["meru technosoft", "hellogrowthcrm", "hellocrm"]) {
      expect(text, `mirror mentions ${banned}`).not.toContain(banned);
    }
  });
});
