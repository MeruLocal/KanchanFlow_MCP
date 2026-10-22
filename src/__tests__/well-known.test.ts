/**
 * Discovery: /.well-known/mcp.json and a public URL taken from config, never
 * from the request.
 */

import type http from "node:http";

import { afterEach, describe, expect, it } from "vitest";

import { loadConfig } from "../config.js";
import { renderHomepage } from "../homepage.js";
import { createHttpServer } from "../server.js";
import { SERVER_VERSION } from "../server-info.js";
import { request } from "./helpers/http.js";

describe("KANCHANFLOW_MCP_PUBLIC_URL", () => {
  it("keeps a valid absolute origin", () => {
    expect(loadConfig({ KANCHANFLOW_MCP_PUBLIC_URL: "https://mcp.kanchanflow.com" }).publicUrl).toBe(
      "https://mcp.kanchanflow.com"
    );
    expect(loadConfig({ KANCHANFLOW_MCP_PUBLIC_URL: "https://mcp.kanchanflow.com/" }).publicUrl).toBe(
      "https://mcp.kanchanflow.com"
    );
  });

  it("rejects other schemes, non-URLs and URLs with a path", () => {
    expect(loadConfig({ KANCHANFLOW_MCP_PUBLIC_URL: "ftp://x" }).publicUrl).toBeNull();
    expect(loadConfig({ KANCHANFLOW_MCP_PUBLIC_URL: "not a url" }).publicUrl).toBeNull();
    expect(loadConfig({ KANCHANFLOW_MCP_PUBLIC_URL: "https://mcp.kanchanflow.com/mcp" }).publicUrl).toBeNull();
    expect(loadConfig({}).publicUrl).toBeNull();
  });
});

let running: http.Server | null = null;
afterEach(async () => {
  await new Promise<void>((resolve) => (running ? running.close(() => resolve()) : resolve()));
  running = null;
});

async function serve(env: Record<string, string>): Promise<number> {
  running = createHttpServer(
    loadConfig({ KANCHANFLOW_MCP_TRANSPORT: "http", KANCHANFLOW_MCP_LOG_LEVEL: "silent", ...env })
  );
  await new Promise<void>((resolve) => running!.listen(0, "127.0.0.1", resolve));
  const addr = running.address();
  return typeof addr === "object" && addr ? addr.port : 0;
}

describe("GET /.well-known/mcp.json", () => {
  it("names the public endpoint and lists no tools", async () => {
    const port = await serve({ KANCHANFLOW_MCP_PUBLIC_URL: "https://mcp.kanchanflow.com" });
    const res = await request(port, { path: "/.well-known/mcp.json", headers: { host: "evil.example" } });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
    const doc = JSON.parse(res.body);
    expect(doc.endpoint).toBe("https://mcp.kanchanflow.com/mcp");
    expect(doc.version).toBe(SERVER_VERSION);
    expect(doc.transport).toBe("streamable-http");
    expect(doc.stateless).toBe(true);
    expect(doc.auth).toBe("none");
    expect(doc).not.toHaveProperty("tools");
    expect(res.body).not.toContain("evil.example");
  });

  it("falls back to the relative path and reports bearer auth", async () => {
    const port = await serve({ KANCHANFLOW_MCP_AUTH_TOKEN: "fake-test-token" });
    const res = await request(port, { path: "/.well-known/mcp.json", headers: { host: "127.0.0.1" } });
    const doc = JSON.parse(res.body);
    expect(doc.endpoint).toBe("/mcp");
    expect(doc.auth).toBe("bearer");
    expect(res.body).not.toContain("fake-test-token");
  });

  it("refuses writes", async () => {
    const port = await serve({});
    const res = await request(port, { method: "POST", path: "/.well-known/mcp.json", body: "{}" });
    expect(res.status).toBe(405);
  });
});

describe("homepage", () => {
  it("uses the public URL and never names localhost", () => {
    const html = renderHomepage(
      loadConfig({ KANCHANFLOW_MCP_TRANSPORT: "http", KANCHANFLOW_MCP_PUBLIC_URL: "https://mcp.kanchanflow.com" })
    );
    expect(html).toContain("https://mcp.kanchanflow.com/mcp");
    expect(html).not.toContain("localhost");
  });

  it("without a public URL shows the relative path, not localhost", () => {
    const html = renderHomepage(loadConfig({ KANCHANFLOW_MCP_TRANSPORT: "http" }));
    expect(html).not.toContain("localhost");
    expect(html).toContain('<pre id="cfg-http">/mcp</pre>');
  });

  it("does not advertise an npx command for an unpublished package", () => {
    const html = renderHomepage(loadConfig({ KANCHANFLOW_MCP_TRANSPORT: "http" }));
    expect(html).not.toMatch(/npx/);
    expect(html).toContain("dist/index.js");
  });
});

describe("server card, llms.txt and robots.txt", () => {
  it("serves a card with the public endpoint, no tool list and read-only stated", async () => {
    const port = await serve({ KANCHANFLOW_MCP_PUBLIC_URL: "https://mcp.kanchanflow.com" });
    const res = await request(port, { path: "/.well-known/mcp/server-card.json" });
    const card = JSON.parse(res.body);
    expect(res.status).toBe(200);
    expect(card.transport.endpoint).toBe("https://mcp.kanchanflow.com/mcp");
    expect(card.authentication.required).toBe(false);
    expect(card.readOnly).toBe(true);
    expect(card).not.toHaveProperty("tools");
  });

  it("serves llms.txt with the endpoint, no counts and no other company", async () => {
    const port = await serve({ KANCHANFLOW_MCP_PUBLIC_URL: "https://mcp.kanchanflow.com" });
    const res = await request(port, { path: "/llms.txt" });
    expect(res.status).toBe(200);
    expect(res.body).toContain("https://mcp.kanchanflow.com/mcp");
    expect(res.body).toMatch(/Soor LLC/);
    expect(res.body).not.toMatch(/\b\d+ tools\b/);
  });

  it("serves robots.txt and refuses POST on these paths", async () => {
    const port = await serve({});
    expect((await request(port, { path: "/robots.txt" })).body).toContain("Allow: /");
    expect((await request(port, { path: "/llms.txt", method: "POST" })).status).toBe(405);
  });
});
