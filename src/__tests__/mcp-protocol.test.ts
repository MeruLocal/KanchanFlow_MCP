/**
 * End-to-end over the MCP protocol.
 *
 * A real client speaks to a real server across a linked in-memory transport
 * pair, so this exercises schema publication, argument validation, content
 * framing and error framing exactly as a desktop host would.
 */

import { describe, expect, it, beforeAll, afterAll } from "vitest";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { buildServer } from "../server.js";
import { allTools } from "../tools/index.js";
import { prompts } from "../prompts/index.js";

let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = buildServer();
  client = new Client({ name: "kanchanflow-test-client", version: "1.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterAll(async () => {
  await client.close();
});

/** Parse the JSON payload out of a tool result. */
function payload(result: { content: unknown[] }): { success: boolean; data?: unknown; error?: { code: string } } {
  const first = result.content[0] as { type: string; text: string };
  expect(first.type).toBe("text");
  return JSON.parse(first.text);
}

describe("handshake", () => {
  it("advertises tools, resources and prompts", () => {
    const caps = client.getServerCapabilities();
    expect(caps?.tools).toBeDefined();
    expect(caps?.resources).toBeDefined();
    expect(caps?.prompts).toBeDefined();
  });

  it("sends usable client instructions", () => {
    const instructions = client.getInstructions() ?? "";
    expect(instructions).toContain("read-only");
    expect(instructions).toContain("kanchanflow_search");
  });
});

describe("tools/list", () => {
  it("publishes every tool with a JSON Schema and read-only annotations", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(allTools.length);
    for (const tool of tools) {
      expect(tool.description!.length, tool.name).toBeGreaterThan(180);
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true);
      expect(tool.annotations?.destructiveHint, tool.name).toBe(false);
      expect(tool.annotations?.openWorldHint, tool.name).toBe(false);
    }
  });
});

describe("tools/call", () => {
  it("returns a success envelope", async () => {
    const result = await client.callTool({
      name: "kanchanflow_list_features",
      arguments: { status: "live", limit: 2 },
    });
    const body = payload(result as { content: unknown[] });
    expect(body.success).toBe(true);
    expect((body.data as { features: unknown[] }).features).toHaveLength(2);
    expect(result.isError).toBeFalsy();
  });

  it("returns a structured error with isError set", async () => {
    const result = await client.callTool({
      name: "kanchanflow_get_feature",
      arguments: { slug: "definitely-not-a-feature" },
    });
    expect(result.isError).toBe(true);
    const body = payload(result as { content: unknown[] });
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("NOT_FOUND");
  });

  it("rejects arguments that fail the published schema", async () => {
    // The SDK validates against the advertised JSON Schema before the handler
    // runs and reports the failure as an error result rather than a transport
    // fault, so a bad enum can never reach a handler.
    const result = await client.callTool({
      name: "kanchanflow_list_features",
      arguments: { status: "shipping-soon" },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as { text: string }[])[0]!.text;
    expect(text.toLowerCase()).toMatch(/invalid|validation|expected/);
  });

  it("rejects an unknown tool", async () => {
    const result = await client.callTool({
      name: "kanchanflow_delete_everything",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    const text = (result.content as { text: string }[])[0]!.text;
    expect(text.toLowerCase()).toContain("kanchanflow_delete_everything");
  });

  it("refuses a path traversal through the protocol", async () => {
    const result = await client.callTool({
      name: "kanchanflow_get_reference_document",
      arguments: { path: "../../package.json" },
    });
    expect(result.isError).toBe(true);
    const body = payload(result as { content: unknown[] });
    expect(body.error?.code).toBe("VALIDATION_ERROR");
  });
});

describe("resources", () => {
  it("lists the site resources and one per reference document", async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    expect(uris).toContain("kanchanflow://site/pricing");
    expect(uris).toContain("kanchanflow://site/features");
    expect(uris.some((u) => u.startsWith("kanchanflow://reference/"))).toBe(true);
  });

  it("reads a site resource with its provenance", async () => {
    const result = await client.readResource({ uri: "kanchanflow://site/markets" });
    const body = JSON.parse((result.contents[0] as { text: string }).text);
    expect(body.source.siteUrl).toBe("https://kanchanflow.com");
    expect(body.data.countries).toHaveLength(7);
  });

  it("reads a reference document as markdown", async () => {
    const result = await client.readResource({ uri: "kanchanflow://reference/mcp/security.md" });
    const content = result.contents[0] as { mimeType: string; text: string };
    expect(content.mimeType).toBe("text/markdown");
    expect(content.text).toContain("Threat model");
  });
});

describe("prompts", () => {
  it("lists every prompt", async () => {
    const { prompts: listed } = await client.listPrompts();
    expect(listed).toHaveLength(prompts.length);
  });

  it("renders a prompt with its arguments", async () => {
    const result = await client.getPrompt({
      name: "kanchanflow_plan_recommendation",
      arguments: { shopProfile: "14-person machine shop with four regional reps", countryCode: "US" },
    });
    const text = (result.messages[0]!.content as { text: string }).text;
    expect(text).toContain("14-person machine shop");
    expect(text).toContain("kanchanflow_compare_tiers");
    expect(text).toContain("Ground every claim in a tool result");
  });
});
