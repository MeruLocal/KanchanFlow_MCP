/** outputSchema + structuredContent on the core tools. */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { connect, textPayload } from "./helpers/client.js";

const WITH_SCHEMA: [string, Record<string, unknown>][] = [
  ["kanchanflow_get_pricing", {}],
  ["kanchanflow_get_pricing", { countryCode: "GB" }],
  ["kanchanflow_compare_tiers", {}],
  ["kanchanflow_list_features", {}],
  ["kanchanflow_list_features", { limit: 200 }],
  ["kanchanflow_search", { query: "quote" }],
  ["kanchanflow_search", { query: "in", limit: 50 }],
  ["kanchanflow_search", { query: "zzzz-no-such-term" }],
];

let client: Client;
beforeAll(async () => {
  client = await connect();
});
afterAll(async () => {
  await client.close();
});

describe("tools/list", () => {
  it("advertises an object outputSchema on exactly the four core tools", async () => {
    const { tools } = await client.listTools();
    const withSchema = tools.filter((t) => t.outputSchema).map((t) => t.name).sort();
    expect(withSchema).toEqual(
      ["kanchanflow_compare_tiers", "kanchanflow_get_pricing", "kanchanflow_list_features", "kanchanflow_search"].sort()
    );
    for (const t of tools.filter((x) => x.outputSchema)) expect(t.outputSchema?.type).toBe("object");
  });
});

describe("tools/call", () => {
  for (const [name, args] of WITH_SCHEMA) {
    it(`${name}(${JSON.stringify(args)}) returns structuredContent equal to the text`, async () => {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent).toEqual(textPayload(result));
    });
  }

  it("an error on a schema tool is isError with no structuredContent and no SDK validation error", async () => {
    const result = await client.callTool({ name: "kanchanflow_compare_tiers", arguments: { group: "No such group" } });
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    expect(textPayload(result).error.code).toBe("NOT_FOUND");
  });

  it("tools without a schema return text only", async () => {
    const result = await client.callTool({ name: "kanchanflow_list_markets", arguments: {} });
    expect(result.structuredContent).toBeUndefined();
    expect(textPayload(result).success).toBe(true);
  });
});
