# Plan: key the HTTP rate limit on the socket, not X-Forwarded-For

- **Severity:** P1 (abuse/DoS control can be bypassed)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **The rate-limit key is caller-controlled.** `clientKey()` (src/server.ts:184-190) keys the limiter on the **first** `X-Forwarded-For` value, and the caller writes that value.
   - Sending a different header value on each request gets a new bucket every time, so the limit (src/server.ts:227, `RateLimiter`) never trips.
   - **Measured** with a prototype test: a server with limit 3, sent 5 POSTs with rotating `X-Forwarded-For`, returned no 429 on main.
2. **Free-text inputs have no maximum length:**
   - `kanchanflow_search.query` (src/tools/search.ts:56)
   - `kanchanflow_search_reference.query` (src/tools/reference.ts:85)
   - `kanchanflow_get_reference_document.path` (src/tools/reference.ts:63)

   The body cap is 1 MB (server.ts:182), so one query can be close to 1 MB and is scanned against every document.
3. **Default limit.** The default is 120/min (src/config.ts). The shared convention across our MCP servers is 60/min.

**Audit baseline** (local HTTP :3010, path `/mcp`): 3 fail · 3 warn · 11 pass. The script does not test rate limiting.

**Not checked:** the real Cloudflare to Apache to Node chain in production.

## Proposed fix

1. Create `src/utils/client-key.ts` with `clientKey(req, trustProxy)`:
   - When `trustProxy` is false (the default), return `req.socket.remoteAddress`.
   - When it is true, join the header values, split on commas, trim, and take the **right-most** non-empty hop (the one the trusted proxy appended). Fall back to the socket address if that hop is missing or longer than 64 characters.
2. Add `trustProxy: boolean` to `Config` in src/config.ts. It is set from `KANCHANFLOW_MCP_TRUST_PROXY` or `TRUST_PROXY` being `1`, `true` or `yes`. Change the `rateLimitPerMinute` default from 120 to 60.
3. In src/server.ts, call `limiter.check(clientKey(req, config.trustProxy))`, delete the inline `clientKey`, and log `trustProxy` in `server.ready`.
4. Add length caps: `.max(200)` on both `query` fields and `.max(512)` on `path`.
5. Document the new variable and the new default in .env.example, the README config table and reference/mcp/overview.md.

## Tests to add (`src/__tests__/rate-limit-key.test.ts`)

- **Unit tests** for `clientKey`:
  - the header is ignored by default
  - the right-most hop is used with `trustProxy`
  - array headers are joined
  - it falls back to the socket address on a missing, blank or oversized header
- **Config:** env parsing for both variable names.
- **Length caps:** a value at the limit passes and one character over fails (zod `safeParse` on each tool's `inputSchema`).
- **HTTP test:** spawn `src/index.ts` with `--import tsx` and limit 3, send 5 POSTs with rotating `X-Forwarded-For`, and expect the last two to be 429. This test fails against main's server.ts.
- Update `security.test.ts:176` (expects 120) to expect 60.

## Risks and rollout

- **Deploy env change.** Production runs behind Cloudflare/Apache, so after this change every visitor would share the proxy's bucket unless `KANCHANFLOW_MCP_TRUST_PROXY=1` is set there. Apache must append (not just pass through) `X-Forwarded-For`. Ship this change with that env setting.
- **Lower default.** The lower 60/min default could throttle a heavy single client. It can still be set with `KANCHANFLOW_MCP_RATE_LIMIT`.
- **Conflicts.** This touches `Config` and `server.ts`, as does the HTTP-hardening plan. Merge this one first.
