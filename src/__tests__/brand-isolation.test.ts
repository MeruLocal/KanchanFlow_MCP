/**
 * Brand isolation.
 *
 * KanchanFlow names exactly one company, Soor LLC. Nothing this server serves,
 * and nothing the package ships, may name another company or brand. The
 * forbidden names are held only as digests (scripts/brand-guard.mjs), so this
 * file enforces the rule without repeating them.
 *
 * Every surface a client can reach is scanned: the server identity, every
 * tool (with defaults and with every slug in the mirror), every reference
 * document read in full, every resource, every prompt, the HTTP homepage,
 * and every text file the npm package would ship.
 */

import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { assertBrandClean, findBrandHits, redactBrandGuardrail } from "../../scripts/brand-guard.mjs";
import { loadConfig, type Config } from "../config.js";
import { loadMirror } from "../data/mirror.js";
import { renderHomepage } from "../homepage.js";
import { prompts } from "../prompts/index.js";
import { referenceLoader } from "../reference/index.js";
import { buildServer } from "../server.js";
import { SERVER_DESCRIPTION, SERVER_INSTRUCTIONS, SERVER_TITLE } from "../server-info.js";
import { allTools } from "../tools/index.js";
import { packageRoot } from "../utils/package-paths.js";

/** Assert `text` is clean, naming the surface (never the match) on failure. */
function expectClean(label: string, text: unknown): void {
  const hits = findBrandHits(typeof text === "string" ? text : JSON.stringify(text));
  expect(hits.length, `${label} names a forbidden company or brand at ${hits.map((h) => h.index).join(", ")}`).toBe(0);
}

let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "brand-isolation-test", version: "0.0.0" });
  await Promise.all([buildServer().connect(serverTransport), client.connect(clientTransport)]);
});

afterAll(async () => {
  await client.close();
});

async function callText(name: string, args: Record<string, unknown>): Promise<string> {
  const result = await client.callTool({ name, arguments: args });
  return JSON.stringify(result.content);
}

describe("server identity", () => {
  it("title, description and instructions are clean", () => {
    expectClean("SERVER_TITLE", SERVER_TITLE);
    expectClean("SERVER_DESCRIPTION", SERVER_DESCRIPTION);
    expectClean("SERVER_INSTRUCTIONS", SERVER_INSTRUCTIONS);
    expectClean("initialize instructions", client.getInstructions() ?? "");
  });
});

describe("tools", () => {
  it("every tool's advertised metadata is clean", async () => {
    const { tools } = await client.listTools();
    expect(tools.length).toBe(allTools.length);
    for (const tool of tools) expectClean(`tools/list ${tool.name}`, tool);
  });

  it("every tool called with {} returns clean output", async () => {
    for (const tool of allTools) expectClean(`${tool.name}({})`, await callText(tool.name, {}));
  });

  it("every feature, integration, blog post and glossary term is clean", async () => {
    const m = loadMirror();
    const cases: [string, string[]][] = [
      ["kanchanflow_get_feature", m.features.items.map((f) => f.slug)],
      ["kanchanflow_get_integration", m.integrations.items.map((i) => i.slug)],
      ["kanchanflow_get_blog_post", m.blog.posts.map((p) => p.slug)],
      ["kanchanflow_get_glossary_term", m.glossary.terms.map((t) => t.slug)],
    ];
    for (const [tool, slugs] of cases) {
      expect(slugs.length, tool).toBeGreaterThan(0);
      for (const slug of slugs) expectClean(`${tool}(${slug})`, await callText(tool, { slug }));
    }
  });

  it("every reference document, read in full through the tool, is clean", async () => {
    const docs = referenceLoader().list();
    expect(docs.length).toBeGreaterThan(0);
    for (const doc of docs) {
      // Every reference document fits in one default-sized read; the
      // truncation check proves the whole body was scanned.
      const text = await callText("kanchanflow_get_reference_document", { path: doc.path });
      expect(text, doc.path).toContain('\\"truncated\\": false');
      expectClean(`reference ${doc.path}`, text);
    }
  });

  it("the reference search finds no forbidden name in any line it can return", async () => {
    // Searching for the names themselves would mean writing them here. Every
    // line the search can return is a line of a reference document, so scan
    // every line through the loader instead.
    for (const doc of referenceLoader().list()) {
      const body = referenceLoader().read(doc.path, 1_000_000).content;
      expectClean(`search lines of ${doc.path}`, body);
    }
  });
});

describe("resources", () => {
  it("every resource's listing metadata and content are clean", async () => {
    const { resources } = await client.listResources();
    expect(resources.length).toBeGreaterThan(0);
    for (const resource of resources) {
      expectClean(`resources/list ${resource.uri}`, resource);
      const read = await client.readResource({ uri: resource.uri });
      expectClean(`resources/read ${resource.uri}`, read.contents);
    }
  });
});

describe("prompts", () => {
  it("every prompt renders clean", async () => {
    const { prompts: listed } = await client.listPrompts();
    expect(listed.length).toBe(prompts.length);
    for (const prompt of listed) {
      expectClean(`prompts/list ${prompt.name}`, prompt);
      const args: Record<string, string> = {};
      for (const arg of prompt.arguments ?? []) args[arg.name] = "sample value";
      const rendered = await client.getPrompt({ name: prompt.name, arguments: args });
      expectClean(`prompts/get ${prompt.name}`, rendered.messages);
    }
  });
});

describe("HTTP homepage", () => {
  it("is clean", () => {
    const config: Config = loadConfig({ KANCHANFLOW_MCP_TRANSPORT: "http" } as NodeJS.ProcessEnv);
    expectClean("homepage", renderHomepage(config));
  });
});

describe("published package", () => {
  const root = packageRoot();
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as { files: string[] };
  const TEXT = /\.(md|json|txt|ts|js|mjs|cjs|html|css|svg)$/i;

  function walk(abs: string, out: string[]): void {
    if (!fs.existsSync(abs)) return;
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      if (TEXT.test(abs) || path.basename(abs) === "LICENSE") out.push(abs);
      return;
    }
    for (const entry of fs.readdirSync(abs)) walk(path.join(abs, entry), out);
  }

  it("every text file under package.json files is clean (dist/ is built from src/, covered above)", () => {
    const files: string[] = [];
    for (const entry of pkg.files) {
      if (entry === "dist" || entry.startsWith("dist/")) continue;
      walk(path.join(root, entry), files);
    }
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expectClean(path.relative(root, file), fs.readFileSync(file, "utf8"));
  });

  it("ships and serves no internal SEO planning document", () => {
    expect(fs.existsSync(path.join(root, "reference", "site", "seo"))).toBe(false);
    expect(referenceLoader().list().filter((d) => d.path.startsWith("site/seo/"))).toEqual([]);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, "reference", "site", "MANIFEST.json"), "utf8")
    ) as { documents: { path: string }[] };
    expect(manifest.documents.filter((d) => d.path.startsWith("site/seo/"))).toEqual([]);
  });
});

describe("sync guard (scripts/brand-guard.mjs)", () => {
  it("restates the contract's brand guardrail without the names it lists", () => {
    const sample = [
      "2. **NEVER emit `Review`** — no review data.",
      '3. **NEVER mention "Example Co", "Sample Brand"',
      '   or "Placeholder"** anywhere in shipped copy. The only company named on this',
      "   site is **Soor LLC**.",
      "4. **NEVER fabricate customer logos.**",
    ].join("\n");
    const out = redactBrandGuardrail(sample);
    expect(out).toContain("3. **NEVER name any company other than Soor LLC** anywhere in shipped copy.");
    expect(out).not.toContain("Example Co");
    expect(out).not.toContain("Placeholder");
    expect(out).toContain("2. **NEVER emit `Review`**");
    expect(out).toContain("4. **NEVER fabricate customer logos.**");
  });

  it("leaves a contract with no such guardrail unchanged", () => {
    const text = "1. **NEVER emit `FAQPage` schema.**\n";
    expect(redactBrandGuardrail(text)).toBe(text);
  });

  it("passes clean text and reports offsets, not words, on failure", () => {
    expect(() => assertBrandClean("sample", "KanchanFlow by Soor LLC")).not.toThrow();
    expect(findBrandHits("KanchanFlow, the RFQ-to-Order CRM by Soor LLC")).toEqual([]);
  });
});
