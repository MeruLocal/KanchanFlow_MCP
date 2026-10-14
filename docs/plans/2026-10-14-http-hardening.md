# Plan: HTTP transport hardening (bind address, Host/Origin allowlist, CORS, token compare)

- **Severity:** P1
- **Effort:** M
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **Binds every interface.** `httpServer.listen(config.port, resolve)` (src/server.ts:385) passes no host, so Node listens on all interfaces. A developer running `npm run dev` exposes the server to the LAN.
2. **No Host/Origin check.** There is no Host or Origin validation, which leaves the server open to DNS rebinding: a web page can drive a locally running server through the victim's browser. The SDK transport is built without `allowedHosts`, `allowedOrigins` or `enableDnsRebindingProtection` (src/server.ts:343).
3. **No CORS.** There is no CORS handling. A browser-based MCP client cannot complete a preflight, and nothing tells the browser which origins are allowed.
4. **Token length leaks.** `tokensMatch()` (src/server.ts:201-205) returns early when the lengths differ, so timing reveals the token's length.

**Measured.** In a local prototype, the server answered `Host: evil.example` normally on main. With the fix it returned 403.

**Audit baseline.** Earlier script: 3 fail · 3 warn · 11 pass. **Re-audit (2026-10-14 13:18 UTC, new skill and script, local :3937, path `/mcp`):** 3 fail · 6 warn · 26 pass. The new script now measures this finding directly: two of the three FAILs are `X.rebinding`: `Origin: http://evil.example accepted (HTTP 200)` and `Host: evil.example accepted (HTTP 200)`. It also reports `INFO C16.cors OPTIONS /mcp → 405`. After this plan both FAILs should PASS and OPTIONS should return 204 for an allowed origin.

**Not checked:** browser behaviour against the production domain, or Cloudflare header rewriting.

## Proposed fix

1. **Config** (src/config.ts):
   - `host`: `KANCHANFLOW_MCP_HOST`, then `HOST`, then `127.0.0.1`.
   - `allowedHosts`: `KANCHANFLOW_MCP_ALLOWED_HOSTS` as a comma list. Defaults are `localhost`, `127.0.0.1`, `[::1]` and `mcp.kanchanflow.com`; `*` disables the check.
   - `allowedOrigins`: `KANCHANFLOW_MCP_ALLOWED_ORIGINS`. Defaults are `https://mcp.kanchanflow.com`, `https://kanchanflow.com`, `https://www.kanchanflow.com`, `http://localhost:*` and `http://127.0.0.1:*`; `*` allows any origin.
2. **New `src/utils/http-guard.ts`:**
   - `hostAllowed(hostHeader, list)` compares hostnames and ignores the port, so changing `KANCHANFLOW_MCP_PORT` does not need a list change. The SDK's own `allowedHosts` does an exact `host:port` match, which is brittle, so we use our own check.
   - `originAllowed(origin, list)` matches exactly, plus a `:*` port wildcard for local origins.
   - `applyCors(res, origin)` sets ACAO = origin, `Vary: Origin`, and exposes `mcp-session-id`, `mcp-protocol-version`, `www-authenticate` and `retry-after`.
   - `answerPreflight(res, origin)` returns 204 with methods `GET, POST, DELETE, OPTIONS`, headers `content-type, accept, authorization, mcp-session-id, mcp-protocol-version, last-event-id`, and `max-age 600`.
3. **server.ts, on the MCP path only,** after the 404 check and before the rate limiter (so CORS headers are also on 429 and 401 responses):
   - A bad Host returns 403 FORBIDDEN.
   - If an Origin header is present, a bad one returns 403. An OPTIONS request returns the preflight answer. Otherwise `applyCors` runs.
   - Requests with no Origin (desktop and server clients) are unaffected.
   - `/health`, `/` and the assets keep working for any Host, so container health checks are unaffected.
4. Change the listen call to `listen(config.port, config.host, ...)`.
5. Rewrite `tokensMatch(a, b)` as `timingSafeEqual(sha256(a), sha256(b))`. The fixed 32-byte digests remove the length leak.
6. Document the three variables in .env.example, the README and reference/mcp/overview.md.

## Tests to add (`src/__tests__/http-hardening.test.ts`)

- **Config defaults and overrides:** host defaults to loopback; `HOST` and `KANCHANFLOW_MCP_HOST` take precedence in that order; list parsing works.
- **`hostAllowed`:**
  - a port is ignored
  - matching is case-insensitive
  - IPv6 in brackets is handled
  - `localhost.evil.example` is rejected
- **`originAllowed`:** the local port wildcard matches; `localhost:6274.evil.example` and `mcp.kanchanflow.com.evil.example` are rejected.
- **`tokensMatch`:** an equal token matches; shorter, longer and empty tokens do not.
- **HTTP test** (spawned server):
  - a request with no Origin returns 200 with no ACAO
  - `Host: attacker.example` returns 403 (sent via `node:http`)
  - a disallowed Origin returns 403
  - an allowed Origin gets a 204 preflight with ACAO and a 200 POST with ACAO

## Risks and rollout

- **Container and remote deploys must set `HOST=0.0.0.0`.** Otherwise the server is unreachable from outside. The Dockerfile plan sets it.
- **The production Host must be on the list.** If Apache rewrites Host (no `ProxyPreserveHost`), the upstream Host may be `127.0.0.1:3010`, which is already allowed. Verify after deploy.
- **Merge order.** This conflicts with the rate-limit plan in `Config` and `server.ts`. Merge that one first.
