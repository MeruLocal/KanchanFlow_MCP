# Plan: correct HTTP status for oversized bodies and internal failures

- **Severity:** P2 (error codes; MCP Center C1.parse_error / X.body_cap / C3)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

The HTTP handler's single `catch` in `runHttp()` (src/server.ts, the block after `await server.connect(transport)`) answers **every** failure with `400 VALIDATION_ERROR "Malformed MCP request."`:

1. **Oversized body.** `readBody()` throws `"payload too large"` past 1 MB; the client gets 400 "Malformed MCP request", not 413. Measured: `PASS X.body_cap a 2.5 MB body is refused (HTTP 400)`. The cap works; the status is wrong.
2. **Server-side failures** (`server.connect` or `transport.handleRequest` throwing) are also reported as the caller's fault (400). The skill's rule: a transport failure must not be reported as a parse error.
3. **Bad JSON** gets an HTTP-level `VALIDATION_ERROR` envelope rather than a JSON-RPC `-32700` error object. Measured: `PASS C1.parse_error malformed JSON → VALIDATION_ERROR` (the script accepts either).
4. The body is read **after** a server and transport are built, so an oversized or junk body still costs a full `buildServer()` (24 tools, all resources and prompts registered).

**Audit run** (2026-10-14 13:18 UTC, commit `3706839`, local HTTP build on :3937, path `/mcp`, `audit-live-mcp.mjs` with the forbidden-brand list and `--sample-tool kanchanflow_get_pricing`): 3 fail · 6 warn · 26 pass.

**Not checked:** behaviour behind the production proxy (which may impose its own body limit).

## Proposed fix

In src/server.ts:

1. Read and parse the body **before** `buildServer()`.
2. Throw typed errors from `readBody()`: `BodyTooLarge` and `BadJson`.
3. Map them:
   - `BodyTooLarge` → **413**, `{ error: { code: "VALIDATION_ERROR", message: "Request body exceeds 1 MB." } }`
   - `BadJson` → **400** with a JSON-RPC body `{ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }`
   - anything else → **500** `INTERNAL_ERROR` with the generic message from src/errors.ts; the real message is logged server-side only (as today).
4. Keep the "never echo internals" rule.

## Tests to add (HTTP test, spawned server)

- 1.5 MB body → 413; a server instance is not built (assert via a log line or a counter seam).
- `{bad json` → 400 with `error.code === -32700`.
- A forced internal failure (test seam that makes `handleRequest` throw) → 500 with the generic message and no stack text.
- Re-run the audit script: `X.body_cap` should report 413.

## Risks

- Clients that keyed on the old 400 for oversized bodies will now see 413. No known client does.
- Touches the same function as the rate-limit and HTTP-hardening plans; merge after them to avoid conflicts.
