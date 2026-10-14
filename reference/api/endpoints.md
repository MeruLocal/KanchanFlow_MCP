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

1. **Host and Origin** — a `Host` not in `KANCHANFLOW_MCP_ALLOWED_HOSTS` (port
   ignored) gets `403`. A request with an `Origin` header not in
   `KANCHANFLOW_MCP_ALLOWED_ORIGINS` (and not this server's own origin) gets
   `403`; an allowed one gets CORS headers, and `OPTIONS` gets a `204`
   preflight. Requests with no `Origin` (desktop and server clients) skip the
   Origin check. This closes DNS rebinding.
2. **Rate limit** — fixed window per client key: the socket address, or with
   `KANCHANFLOW_MCP_TRUST_PROXY=1` the right-most `X-Forwarded-For` hop (the
   one the trusted proxy appended). Over the limit gets `429` with
   `Retry-After`. `KANCHANFLOW_MCP_RATE_LIMIT` sets the per-minute allowance
   (default 60); `0` disables it.
3. **Authentication** — bearer token, when `KANCHANFLOW_MCP_AUTH_TOKEN` is set,
   compared in constant time over SHA-256 digests. See `api/authentication.md`.
4. **Body** — read and parsed before any server is built. Over 1 MB is `413`;
   invalid JSON is `400` with a JSON-RPC `-32700` parse error.
5. **MCP dispatch** — the SDK validates the JSON-RPC envelope and the tool
   arguments against each tool's schema. A failure inside the server is `500`
   `INTERNAL_ERROR` with a generic message; the detail is logged server-side.

The client key is a rate-limit input only. It is never an authorization input.

## `GET /.well-known/mcp.json`

Discovery document: `name`, `title`, `version`, `description`, `endpoint`
(`KANCHANFLOW_MCP_PUBLIC_URL` + path when set, otherwise the relative path),
`transport: "streamable-http"`, `stateless: true` and `auth` (`bearer` or
`none`). No tool list: agents call `tools/list`. Public, `GET`/`HEAD` only,
`Access-Control-Allow-Origin: *`, cached for an hour.

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
