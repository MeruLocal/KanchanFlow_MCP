/**
 * The homepage.
 *
 * The page's whole reason for being generated rather than hand-written is
 * that it cannot drift from the protocol. So the properties asserted here are
 * the ones a refactor would quietly lose: every registered tool, resource and
 * prompt is actually on the page, nothing interpolated escapes its quoting,
 * and the auth token never reaches the HTML.
 */

import { describe, expect, it } from "vitest";

import { loadConfig, type Config } from "../config.js";
import { homepage, renderHomepage } from "../homepage.js";
import { prompts } from "../prompts/index.js";
import { referenceResources, siteResources } from "../resources/index.js";
import { allTools } from "../tools/index.js";

const config: Config = loadConfig({ KANCHANFLOW_MCP_TRANSPORT: "http" } as NodeJS.ProcessEnv);
const html = renderHomepage(config);

describe("completeness", () => {
  it("names every registered tool", () => {
    for (const tool of allTools) {
      expect(html, tool.name).toContain(tool.name);
    }
  });

  it("offers every tool in the console picker", () => {
    for (const tool of allTools) {
      expect(html, tool.name).toContain(`<option value="${tool.name}">`);
    }
  });

  it("names every prompt", () => {
    for (const prompt of prompts) {
      expect(html, prompt.name).toContain(prompt.name);
    }
  });

  it("lists every resource URI", () => {
    for (const resource of [...siteResources, ...referenceResources()]) {
      expect(html, resource.uri).toContain(resource.uri);
    }
  });

  it("reports counts that match the registries", () => {
    const resourceCount = siteResources.length + referenceResources().length;
    expect(html).toContain(`<b>${allTools.length}</b><span>Tools</span>`);
    expect(html).toContain(`<b>${resourceCount}</b><span>Resources</span>`);
    expect(html).toContain(`<b>${prompts.length}</b><span>Prompts</span>`);
  });
});

describe("escaping", () => {
  it("escapes every angle bracket that came from tool content", () => {
    // Descriptions are prose and may contain < or >. Any that survived raw
    // would have opened a tag, so no data-search attribute may hold one.
    const attrs = [...html.matchAll(/data-search="([^"]*)"/g)].map((m) => m[1]);
    expect(attrs.length).toBeGreaterThan(0);
    for (const attr of attrs) {
      expect(attr).not.toMatch(/[<>]/);
    }
  });

  it("closes exactly one script block", () => {
    // A "</script>" arriving from interpolated content would end the block
    // early and drop the rest of the page into the document as text.
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it("balances the elements the tool cards are built from", () => {
    for (const [open, close] of [
      ["<article", "</article>"],
      ["<section", "</section>"],
      ["<li", "</li>"],
      ["<ul", "</ul>"],
    ] as const) {
      const opened = html.match(new RegExp(open, "g")) ?? [];
      const closed = html.match(new RegExp(close.replace("/", "\\/"), "g")) ?? [];
      expect(opened.length, open).toBe(closed.length);
    }
  });
});

describe("secret containment", () => {
  it("never renders the configured auth token", () => {
    const secret = "sentinel-homepage-token-6d1f0a";
    const withAuth = loadConfig({
      KANCHANFLOW_MCP_TRANSPORT: "http",
      KANCHANFLOW_MCP_AUTH_TOKEN: secret,
    } as NodeJS.ProcessEnv);

    const page = renderHomepage(withAuth);
    expect(page).not.toContain(secret);
    // It still has to tell the reader a token is needed, and ask for one.
    expect(page).toContain("Bearer token required");
    expect(page).toContain('id="token"');
  });

  it("omits the token field when the endpoint is open", () => {
    expect(html).not.toContain('id="token"');
    expect(html).toContain("Open endpoint");
  });
});

describe("caching", () => {
  it("returns a stable ETag for the same config", () => {
    const first = homepage(config);
    const second = homepage(config);
    expect(first.etag).toBe(second.etag);
    expect(first.html).toBe(second.html);
    expect(first.etag).toMatch(/^"[0-9a-f]{32}"$/);
  });
});
