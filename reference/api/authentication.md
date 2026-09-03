# Authentication and authorization

## The short version

There is nothing to authenticate against, because there is nothing private
behind this server. Every tool returns the published content of kanchanflow.com —
the same words any visitor reads. There is no user, no workspace, no tenant and
no record that belongs to one customer rather than another.

So the server does not invent an identity system it has no use for. Instead:

- **stdio** — no authentication. The MCP host spawned the process; the trust
  boundary is the host, exactly as it is for every other local MCP server.
- **Streamable HTTP** — optional bearer token, for an operator who wants a
  private instance rather than a public one.

## Optional bearer token

Set `KANCHANFLOW_MCP_AUTH_TOKEN` and every request to the MCP path must present:

```
Authorization: Bearer <token>
```

A missing or wrong token gets `401` with `WWW-Authenticate: Bearer` and a body of
`{ "error": { "code": "UNAUTHORIZED", ... } }`. Comparison is length-checked and
then constant-time over the bytes, so a token cannot be probed a character at a
time.

Leave the variable unset and the HTTP endpoint is public. That is a legitimate
configuration for this server, not an oversight: a public read-only endpoint over
public content is what the website's `/mcp` page documents.

`/health` is always reachable without a token. It reports liveness and the
server version, and nothing else — no configuration, no environment, no counts
that would tell an unauthenticated caller anything about the deployment.

## Authorization

There is one authorization rule and it is structural: **there is no privileged
tool.** Every tool is read-only over public content, so there is no operation a
token would unlock. `tools/list` returns the same 24 tools to every caller.

If a future version ever adds a tool that reads or writes anything customer-
specific, that rule changes and this document changes with it. The pattern to
follow then is the one this server already sets up: gate the tool out of
`tools/list` for an unauthenticated session, and refuse it in `tools/call`
before the name is even looked up, so an unauthenticated caller cannot
distinguish "gated" from "does not exist" by probing.

## What is never exposed

No tool, resource or prompt returns an environment variable, a configuration
value, a token, an internal hostname or a filesystem path. Two specific
protections:

- **Resources are named slices**, not an arbitrary key expression. A resource URI
  selects one of eight predefined readers over the mirror. There is no
  `kanchanflow://config/<key>` and no way to construct one.
- **Reference paths are confined** to the reference folder by normalisation,
  prefix check and `realpath` check. `kanchanflow_get_reference_document` is not
  a file reader; it cannot read `.env`, `package.json` or anything outside that
  folder, and it only serves `.md` and `.json`.

Errors follow the same rule. An unmodelled failure returns a generic
`INTERNAL_ERROR` message; the real message is logged server-side only, because
it can carry a path.
