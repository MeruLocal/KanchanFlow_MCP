/**
 * The rate-limit key for an HTTP request.
 *
 * By default this is the TCP peer address, which the caller cannot choose.
 * X-Forwarded-For is written by whoever sends the request, so keying on its
 * first value would let a caller mint a fresh bucket per request.
 *
 * Behind a reverse proxy every request arrives from the proxy, so the socket
 * address would put all visitors in one bucket. With `trustProxy` the key is
 * the RIGHT-most hop: the address the trusted proxy itself appended. Anything
 * to its left was supplied by the client and is ignored.
 *
 * This is a rate-limit key, never an authorisation input.
 */

import type http from "node:http";

/** A forwarded hop longer than this is not an address; fall back to the socket. */
const MAX_HOP_CHARS = 64;

export function clientKey(req: Pick<http.IncomingMessage, "headers" | "socket">, trustProxy: boolean): string {
  const socketAddress = req.socket?.remoteAddress ?? "unknown";
  if (!trustProxy) return socketAddress;

  const raw = req.headers["x-forwarded-for"];
  const joined = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  const hops = joined
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);
  const last = hops[hops.length - 1];
  if (!last || last.length > MAX_HOP_CHARS) return socketAddress;
  return last;
}
