/**
 * The rate-limit key for an HTTP request.
 *
 * By default this is the TCP peer address, which the caller cannot choose.
 * X-Forwarded-For is written by whoever sends the request, so keying on its
 * first value would let a caller mint a fresh bucket per request.
 *
 * Behind a reverse proxy every request arrives from the proxy, so the socket
 * address would put all visitors in one bucket. With `trustProxy` the key is
 * the X-Forwarded-For entry at position `len - trustProxy` (trustProxy is the
 * number of trusted proxy hops): the address the outermost trusted proxy
 * appended. Anything to its left was supplied by the client and is ignored.
 * A header with fewer entries than hops falls back to the socket address.
 * CF-Connecting-IP is never read.
 *
 * This is a rate-limit key, never an authorisation input.
 */

import type http from "node:http";

/** A forwarded hop longer than this is not an address; fall back to the socket. */
const MAX_HOP_CHARS = 64;

export function clientKey(req: Pick<http.IncomingMessage, "headers" | "socket">, trustProxy: number): string {
  const socketAddress = req.socket?.remoteAddress ?? "unknown";
  if (!(trustProxy >= 1)) return socketAddress;

  const raw = req.headers["x-forwarded-for"];
  const joined = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  const hops = joined
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);
  if (hops.length < trustProxy) return socketAddress;
  const hop = hops[hops.length - trustProxy];
  if (!hop || hop.length > MAX_HOP_CHARS) return socketAddress;
  return hop;
}
