# Plan: serve /.well-known/mcp.json and take the public URL from config

- **Severity:** P1 (discovery; MCP Center C13.well_known / X.discovery_url)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **No discovery document.** `GET /.well-known/mcp.json` returns 404. Measured: `FAIL C13.well_known /.well-known/mcp.json returned 404`. Registries and agents probe this path first, so the hosted endpoint is invisible to them.
2. **The status page advertises localhost.** Measured: `WARN X.discovery_url status page links to a localhost URL`. The homepage builds its HTTP client config from `http://localhost:${config.port}${config.path}` (src/homepage.ts:473). Behind the planned public host, every visitor is told to connect to their own machine.
3. **No public base URL setting.** `Config` (src/config.ts) has port and path but no public origin, so nothing can build a correct absolute URL.

**Audit run** (2026-10-14 13:18 UTC, commit `3706839`, local HTTP build on :3937, path `/mcp`, `audit-live-mcp.mjs` with the forbidden-brand list and `--sample-tool kanchanflow_get_pricing`): 3 fail · 6 warn · 26 pass.

**Not checked:** the production proxy (no public deployment reachable from the sandbox).

## Proposed fix

1. **Config:** add `publicUrl: string | null` from `KANCHANFLOW_MCP_PUBLIC_URL` (for example `https://mcp.kanchanflow.com`). Validate it is an absolute http(s) origin; ignore it otherwise. Never derive it from `Host` or `X-Forwarded-Host` (callers control those).
2. **Discovery route** in src/server.ts, before the 404 branch, GET/HEAD only, no token, `access-control-allow-origin: *`, `cache-control: public, max-age=3600`:
   - `name`, `title`, `version` from src/server-info.ts
   - `description` = `SERVER_DESCRIPTION`
   - `endpoint`: `${publicUrl}${path}` when `publicUrl` is set, otherwise the relative `path`
   - `transport: "streamable-http"`, `stateless: true`, `auth`: `"bearer"` or `"none"` from config
   - **No hand-listed tools** and no capability claims; agents use `tools/list`.
3. **Homepage** (src/homepage.ts:473): use `publicUrl + path` when set; otherwise show the relative path with the note "use this server's own host". Never print `localhost` unless the request is local (simplest: never).
4. Document the variable in .env.example, the README config table and reference/mcp/overview.md.

## Tests to add

- `loadConfig`: a valid public URL is kept; `ftp://x`, `not a url` and a URL with a path are rejected.
- Protocol/HTTP test: `/.well-known/mcp.json` returns 200, JSON, ACAO `*`, `endpoint` equal to `publicUrl + path`, and no `tools` key.
- Homepage test: with `publicUrl` set, the HTML contains it and no `localhost`.
- Re-run the audit script: `C13.well_known` should PASS and `X.discovery_url` should clear (with `--expect-host mcp.kanchanflow.com` once deployed).

## Risks and founder decisions

- **Host name.** `mcp.kanchanflow.com` is assumed (as in the deployment plan). Confirm before it is set in production.
- **Overlap.** The deployment plan (`server.json`) and this one both name the public URL; both should read the same value. Merge order does not matter.
