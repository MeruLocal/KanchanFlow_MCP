/**
 * Helpers for HTTP-level tests: spawn the real entry point on a free port,
 * and send raw requests with full control of Host, Origin and
 * X-Forwarded-For (which fetch() would not allow).
 */

import { spawn, type ChildProcess } from "node:child_process";
import http from "node:http";
import net from "node:net";

import { packageRoot } from "../../utils/package-paths.js";

export async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      srv.close(() => resolve(port));
    });
  });
}

export interface Spawned {
  port: number;
  child: ChildProcess;
  stop: () => Promise<void>;
}

/** Start `src/index.ts` with the HTTP transport and wait for server.ready. */
export async function spawnServer(env: Record<string, string> = {}): Promise<Spawned> {
  const port = await freePort();
  const child = spawn(process.execPath, ["--import", "tsx", "src/index.ts"], {
    cwd: packageRoot(),
    env: {
      PATH: process.env.PATH ?? "",
      KANCHANFLOW_MCP_TRANSPORT: "http",
      KANCHANFLOW_MCP_PORT: String(port),
      KANCHANFLOW_MCP_LOG_LEVEL: "info",
      ...env,
    },
    stdio: ["ignore", "ignore", "pipe"],
  });
  await new Promise<void>((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => reject(new Error(`server did not start: ${buf.slice(-500)}`)), 20_000);
    child.stderr?.on("data", (d: Buffer) => {
      buf += d.toString();
      if (buf.includes('"server.ready"')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited ${code}: ${buf.slice(-500)}`));
    });
  });
  child.stderr?.resume();
  return {
    port,
    child,
    stop: () =>
      new Promise<void>((resolve) => {
        if (child.exitCode !== null) return resolve();
        child.once("exit", () => resolve());
        child.kill("SIGTERM");
      }),
  };
}

export interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}

/** Send one request with exactly the headers given. */
export function request(
  port: number,
  opts: { method?: string; path?: string; headers?: Record<string, string>; body?: string | Buffer }
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        method: opts.method ?? "GET",
        path: opts.path ?? "/mcp",
        headers: opts.headers ?? {},
        agent: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") })
        );
      }
    );
    req.on("error", reject);
    if (opts.body !== undefined) req.write(opts.body);
    req.end();
  });
}

export const TOOLS_LIST = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" });

/** Headers for a JSON-RPC POST to the MCP endpoint. */
export function mcpHeaders(port: number, extra: Record<string, string> = {}): Record<string, string> {
  return {
    host: `127.0.0.1:${port}`,
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    ...extra,
  };
}
