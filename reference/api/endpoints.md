# Endpoints

Only the Streamable HTTP transport has endpoints. Under stdio the process speaks
MCP on stdin/stdout and listens on no port.

## `POST /mcp`

The MCP endpoint. Path is configurable with `KANCHANFLOW_MCP_PATH` (default
`/mcp`); `GET` and `DELETE` on the same path are handled by the SDK's Streamable
HTTP transport as the protocol requires.

Requests are handled **statelessly**: each one gets a fresh `McpServer` and
transport, torn down when the response closes. No state is shared between
callers, so one session can never observe another's.

Request handling, in order:

1. **Rate limit** — fixed window per client key, from the first
   `X-Forwarded-For` hop or the socket address. Over the limit gets `429` with
   `Retry-After`. `KANCHANFLOW_MCP_RATE_LIMIT` sets the per-minute allowance;
   `0` disables it.
2. **Authentication** — bearer token, when `KANCHANFLOW_MCP_AUTH_TOKEN` is set.
   See `api/authentication.md`.
3. **Body size** — anything over 1 MB is refused unread.
4. **MCP dispatch** — the SDK parses and validates the JSON-RPC envelope and the
   tool arguments against each tool's schema.

The client key is a rate-limit input only. It is never an authorization input,
because a forwarded header is caller-controlled.

## `GET /`

A human-readable homepage, generated from the same registries the protocol
advertises — `allTools`, `prompts`, `siteResources`, `referenceResources` — so a
tool added to the registry appears on it at the next boot and the page cannot
drift from what `tools/list` returns. Built once and served from a cached string
with an ETag.

Reachable without a token: it contains nothing a client could not already list.
`GET` and `HEAD` only; anything else is `405` with an `Allow` header.

## `GET /assets/brand/<file>`

The brand artwork the homepage references: the KanchanFlow lockup for a light
ground, the lockup for a dark ground, and the browser-tab icon. `GET`/`HEAD`,
public, `Cache-Control: public, max-age=86400`, with a content-hash ETag so a
revalidation is a `304`.

`GET /favicon.ico` is an alias onto the icon, so a browser asking for one by
convention gets it rather than leaving a 404 in the log.

This is **not** a static file server. `src/assets.ts` holds a fixed allowlist of
three filenames, and a request is matched against that list rather than joined
onto a directory and read — so there is no path that reaches the filesystem and
nothing to traverse out of. Anything not on the list falls through to the 404
below. The files arrive via `npm run sync`, copied from the website repository;
when they are absent the homepage falls back to a typographic mark rather than
linking a broken image.

## `GET /health`

Liveness, always reachable without a token so an orchestrator can use it:

```json
{ "status": "ok", "service": "kanchanflow", "version": "1.0.0" }
```

It touches no dependency, which means it cannot report unhealthy for a reason the
platform cannot act on. It reports nothing about configuration.

## Anything else

`404` with `{ "error": { "code": "NOT_FOUND", "message": "No such endpoint." } }`.

## Response headers

The transport sets its own content type for MCP responses. Errors raised before
dispatch are `application/json` with an explicit `Content-Length`. A rate-limited
response carries `Retry-After` in seconds; a `401` carries
`WWW-Authenticate: Bearer realm="kanchanflow-mcp"`.

## Logging

One structured JSON line per request on stderr:

```json
{"ts":"2026-09-03T10:14:02.881Z","level":"info","service":"kanchanflow-mcp",
 "msg":"http.request","requestId":"...","method":"POST","path":"/mcp",
 "status":200,"durationMs":7}
```

and one per tool call:

```json
{"ts":"...","level":"info","service":"kanchanflow-mcp","msg":"tool.call",
 "requestId":"...","tool":"kanchanflow_get_feature","argKeys":["slug"],
 "outcome":"success","durationMs":2}
```

Argument **names** are logged, never values, so a malformed call is diagnosable
without writing caller input into the log. Tokens and headers are never logged.
