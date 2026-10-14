/**
 * Tool registry conventions.
 *
 * These are the properties a client depends on and that a careless edit breaks
 * silently: the naming convention, uniqueness, and descriptions good enough for
 * a model to choose between 24 tools.
 */

import { describe, expect, it } from "vitest";

import { allTools, NAME_PATTERN, toolsByName } from "../tools/index.js";
import { prompts, promptsByName } from "../prompts/index.js";
import { siteResources } from "../resources/index.js";

describe("tool registry", () => {
  it("registers every tool", () => {
    expect(allTools.length).toBe(25);
    expect(toolsByName.size).toBe(allTools.length);
  });

  it("follows kanchanflow_<action>_<resource>", () => {
    for (const tool of allTools) {
      expect(tool.name, tool.name).toMatch(NAME_PATTERN);
      expect(tool.name.startsWith("kanchanflow_")).toBe(true);
    }
  });

  it("has no duplicate names", () => {
    const names = allTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every tool a substantial description", () => {
    for (const tool of allTools) {
      expect(tool.title.length, tool.name).toBeGreaterThan(3);
      // Long enough to say what it does, when to use it and what it errors on.
      expect(tool.description.length, tool.name).toBeGreaterThan(180);
    }
  });

  it("describes every declared parameter", () => {
    for (const tool of allTools) {
      for (const [key, schema] of Object.entries(tool.inputSchema)) {
        expect((schema as { description?: string }).description, `${tool.name}.${key}`).toBeTruthy();
      }
    }
  });

  it("exposes no write, delete or execute tool", () => {
    const forbidden = /_(create|update|delete|remove|archive|publish|execute|run|send|set|write)_?/;
    for (const tool of allTools) {
      expect(tool.name, `${tool.name} looks like a write tool`).not.toMatch(forbidden);
    }
  });

  it("names only tools that exist in prompt guidance", () => {
    const known = new Set(allTools.map((t) => t.name));
    for (const prompt of prompts) {
      const referenced = prompt.build({}).match(/kanchanflow_[a-z_]+/g) ?? [];
      for (const name of referenced) {
        // A prompt may name another prompt; only assert on tool-shaped names.
        if (promptsByName.has(name)) continue;
        expect(known.has(name), `${prompt.name} references unknown tool ${name}`).toBe(true);
      }
    }
  });
});

describe("prompts", () => {
  it("registers five prompts with unique names", () => {
    expect(prompts).toHaveLength(5);
    expect(new Set(prompts.map((p) => p.name)).size).toBe(5);
  });

  it("builds usable text even with no arguments", () => {
    for (const prompt of prompts) {
      const text = prompt.build({});
      expect(text.length, prompt.name).toBeGreaterThan(200);
      expect(text, prompt.name).toContain("kanchanflow_");
    }
  });

  it("carries the grounding rule in every prompt", () => {
    for (const prompt of prompts) {
      expect(prompt.build({ question: "x", capability: "x", shopProfile: "x", integration: "x", topic: "x" }))
        .toContain("Ground every claim in a tool result");
    }
  });
});

describe("resources", () => {
  it("uses the kanchanflow:// scheme and unique URIs", () => {
    const uris = siteResources.map((r) => r.uri);
    expect(new Set(uris).size).toBe(uris.length);
    for (const uri of uris) expect(uri.startsWith("kanchanflow://site/")).toBe(true);
  });

  it("describes every resource", () => {
    for (const r of siteResources) {
      expect(r.title.length).toBeGreaterThan(3);
      expect(r.description.length).toBeGreaterThan(30);
      expect(r.mimeType).toBe("application/json");
    }
  });
});
