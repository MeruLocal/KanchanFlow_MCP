/** An in-memory MCP client connected to a fresh server. */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { buildServer, type RequestContext } from "../../server.js";

export async function connect(ctx: RequestContext = {}): Promise<Client> {
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "kanchanflow-test-client", version: "1.0.0" });
  await Promise.all([buildServer(ctx).connect(st), client.connect(ct)]);
  return client;
}

/** The JSON payload in a tool result's first text block. */
export function textPayload(result: { content?: unknown }): any {
  const first = (result.content as { type: string; text: string }[])[0];
  return JSON.parse(first?.text ?? "null");
}
