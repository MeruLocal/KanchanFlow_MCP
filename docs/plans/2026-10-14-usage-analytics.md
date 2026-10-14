# Plan: record which client called which tool (without arguments)

- **Severity:** P2 (skill V4, MCP Center C18.usage)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

The registry logs each call (src/server.ts `buildServer`, `logger.info("tool.call", …)`) with tool name, argument **keys**, outcome and duration. That is good: no argument values, so no PII. Two gaps:

1. **No client identity.** Nothing records which MCP client made the call. The server is stateless (one `McpServer` per POST), so the `clientInfo` sent in `initialize` is gone by the time `tools/call` arrives. The only per-request signal is the HTTP `User-Agent`, which is not logged (`http.request` logs method, path, status and duration only).
2. **Logs only.** Usage exists only as stderr JSON lines. There is no count anyone looks at, so "which tools do agents use, from which clients" cannot be answered.

**Audit run** (2026-10-14 13:18 UTC, commit `3706839`, local HTTP build on :3937, path `/mcp`, `audit-live-mcp.mjs` with the forbidden-brand list and `--sample-tool kanchanflow_get_pricing`): 3 fail · 6 warn · 26 pass. The script does not measure analytics; this is from reading the code.

## Proposed fix

1. **http.request log:** add `ua`: the `User-Agent` reduced to its product token (first `name/version`, max 64 chars, `[A-Za-z0-9._/-]` only). Never log the full header, IPs at info level, or tokens.
2. **initialize:** log `clientInfo.name` and `version` (same sanitising) as `mcp.initialize`.
3. **tool.call:** pass the request's `ua` into the tool handler log via the per-request `buildServer(ctx)` (it is already built per request).
4. **Aggregation:** document a log query (tool × client × day) in reference/mcp/overview.md. No new storage in this plan.

## Tests to add

- Logger capture: `tool.call` carries `ua` and never the argument values (existing sentinel test pattern in security.test.ts).
- A hostile `User-Agent` (long, with quotes or an email-shaped string) is reduced to a safe token or `unknown`.

## Risks and founder decisions

- **Founder decision:** where usage should land beyond logs (a usage store, or nothing). This plan stops at logs.
