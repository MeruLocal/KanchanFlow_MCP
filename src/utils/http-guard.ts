/**
 * Host / Origin allowlists and CORS for the MCP endpoint.
 *
 * DNS rebinding: a web page on evil.example can resolve its own name to
 * 127.0.0.1 and then drive a locally running server through the visitor's
 * browser. The browser still sends `Host: evil.example` and
 * `Origin: http://evil.example`, so refusing unknown Hosts and Origins closes
 * it. Requests with no Origin header (desktop hosts, server-side clients,
 * curl) are not browser requests and are unaffected by the Origin check.
 *
 * The SDK has its own allowedHosts option, but it matches "host:port" exactly,
 * so changing the port would need a list change. These checks compare host
 * names and treat ":*" as a port wildcard for local origins.
 */

import type http from "node:http";

/** Hostname part of a Host header, lower-cased, port removed. IPv6 keeps its brackets. */
export function hostName(hostHeader: string): string {
  const h = hostHeader.trim().toLowerCase();
  if (h.startsWith("[")) {
    const end = h.indexOf("]");
    return end === -1 ? h : h.slice(0, end + 1);
  }
  const colon = h.indexOf(":");
  return colon === -1 ? h : h.slice(0, colon);
}

/** True when the Host header names an allowed host. ["*"] allows any. */
export function hostAllowed(hostHeader: string | undefined, allowed: readonly string[]): boolean {
  if (allowed.includes("*")) return true;
  if (!hostHeader) return false;
  const name = hostName(hostHeader);
  if (!name) return false;
  return allowed.some((a) => a.toLowerCase() === name);
}

/**
 * True when `origin` is on the list. Entries match exactly (scheme, host and
 * port), except that an entry ending ":*" matches that scheme and host on any
 * port, or none. ["*"] allows any origin.
 */
export function originAllowed(origin: string, allowed: readonly string[]): boolean {
  if (allowed.includes("*")) return true;
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  // An Origin header is scheme://host[:port] and nothing else; "null" and
  // anything carrying a path, credentials or query is refused.
  const actual = parsed.origin.toLowerCase();
  if (actual === "null" || actual !== origin.trim().toLowerCase()) return false;
  for (const entry of allowed) {
    const e = entry.trim().toLowerCase();
    if (e.endsWith(":*")) {
      const base = e.slice(0, -2);
      if (actual === base) return true;
      if (actual.startsWith(`${base}:`) && /^\d+$/.test(actual.slice(base.length + 1))) return true;
      continue;
    }
    if (actual === e.replace(/\/$/, "")) return true;
  }
  return false;
}

/**
 * True when `origin` is this server's own origin as addressed by the Host
 * header — the homepage console calling its own endpoint. Only meaningful
 * once the Host header itself has passed hostAllowed().
 */
export function isSameOrigin(origin: string, hostHeader: string | undefined): boolean {
  if (!hostHeader) return false;
  try {
    const o = new URL(origin);
    return o.host.toLowerCase() === hostHeader.trim().toLowerCase();
  } catch {
    return false;
  }
}

const EXPOSED_HEADERS = "mcp-session-id, mcp-protocol-version, www-authenticate, retry-after";
const ALLOWED_METHODS = "GET, POST, DELETE, OPTIONS";
const ALLOWED_HEADERS = "content-type, accept, authorization, mcp-session-id, mcp-protocol-version, last-event-id";

/** CORS headers for an allowed Origin on an actual (non-preflight) response. */
export function applyCors(res: http.ServerResponse, origin: string): void {
  res.setHeader("access-control-allow-origin", origin);
  res.setHeader("vary", "Origin");
  res.setHeader("access-control-expose-headers", EXPOSED_HEADERS);
}

/** Answer a CORS preflight for an allowed Origin. */
export function answerPreflight(res: http.ServerResponse, origin: string): void {
  res.writeHead(204, {
    "access-control-allow-origin": origin,
    vary: "Origin",
    "access-control-allow-methods": ALLOWED_METHODS,
    "access-control-allow-headers": ALLOWED_HEADERS,
    "access-control-expose-headers": EXPOSED_HEADERS,
    "access-control-max-age": "600",
  });
  res.end();
}
