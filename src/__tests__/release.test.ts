/**
 * Release metadata: one version source, and a registry manifest that names
 * only KanchanFlow.
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { SERVER_VERSION } from "../server-info.js";
import { packageRoot } from "../utils/package-paths.js";

const root = packageRoot();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as { name: string; version: string; mcpName?: string };
const serverJsonText = fs.readFileSync(path.join(root, "server.json"), "utf8");
const serverJson = JSON.parse(serverJsonText) as {
  name: string;
  version: string;
  description: string;
  repository?: unknown;
  packages: { registryType: string; identifier: string; version: string }[];
  remotes: { type: string; url: string }[];
};

describe("version source", () => {
  it("SERVER_VERSION is package.json's version", () => {
    expect(SERVER_VERSION).toBe(pkg.version);
  });
});

describe("server.json", () => {
  it("matches package.json", () => {
    expect(serverJson.version).toBe(pkg.version);
    expect(serverJson.packages[0]?.version).toBe(pkg.version);
    expect(serverJson.packages[0]?.identifier).toBe(pkg.name);
  });

  it("carries the npm ownership marker the MCP Registry verifies", () => {
    expect(pkg.mcpName).toBe(serverJson.name);
  });

  it("advertises the hosted endpoint", () => {
    expect(serverJson.remotes[0]).toEqual({ type: "streamable-http", url: "https://mcp.kanchanflow.com/mcp" });
  });

  it("uses the KanchanFlow DNS namespace and names no code host or other org", () => {
    expect(serverJson.name).toBe("com.kanchanflow/mcp");
    expect(serverJson.repository).toBeUndefined();
    expect(serverJsonText).not.toMatch(/github|gitlab|bitbucket/i);
    const urls = serverJsonText.match(/https?:\/\/[^"\s]+/g) ?? [];
    for (const url of urls) {
      if (url.startsWith("https://static.modelcontextprotocol.io/")) continue;
      expect(new URL(url).hostname, url).toMatch(/(^|\.)kanchanflow\.com$/);
    }
  });

  it("keeps the description within the registry's 100-character limit", () => {
    expect(serverJson.description.length).toBeLessThanOrEqual(100);
  });
});

describe("docs carry no hand-written counts", () => {
  // Counts drift (README once said 141 tests when there were 162). The
  // homepage and tools/list generate them from the registries instead.
  const files = ["README.md", "reference/api/overview.md", "reference/mcp/security.md", "reference/mcp/tools.md", "reference/api/authentication.md"];
  const COUNT = /\b\d+\s+(?:read-only\s+)?(?:tools|resources|prompts|reference documents|tests|suites)\b/i;
  for (const file of files) {
    it(`${file} has no "<number> tools/tests/…" phrase`, () => {
      const text = fs.readFileSync(path.join(root, file), "utf8");
      expect(text.match(COUNT)?.[0] ?? null).toBeNull();
    });
  }
});
