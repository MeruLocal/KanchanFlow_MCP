# KanchanFlow MCP server

A Model Context Protocol server that gives AI assistants and agents accurate,
current answers about **KanchanFlow** — the RFQ-to-Order manufacturing CRM by
Soor LLC — from what the product actually publishes.

Ask a general assistant about a young product and it answers from training data:
it knows a little, fills the rest in from generic CRM knowledge, and states both
halves with the same confidence. That is how a prospect gets told a feature is
available when it is still in development. This server exists so an assistant can
check instead of guess.

**24 read-only tools · 8 JSON resources · 30 reference documents · 5 prompts**

---

## Quick start

```bash
npm install
npm run build
npm run mcp          # stdio
```

Connect a desktop MCP client:

```json
{
  "mcpServers": {
    "kanchanflow": {
      "command": "node",
      "args": ["/absolute/path/to/kanchanflow-mcp/dist/index.js"]
    }
  }
}
```

Or run it over HTTP, which also serves a browser homepage:

```bash
npm run dev          # http://localhost:3010 — homepage + MCP endpoint
```

| URL | Serves |
|---|---|
| `/` | Homepage: every tool, resource and prompt, with a console to run one |
| `/mcp` | The Streamable HTTP MCP endpoint |
| `/health` | Liveness probe, no token needed |
| `/.well-known/mcp.json` | Discovery document: name, version, endpoint, transport, auth. No tool list |

The homepage is generated from the same registries the protocol advertises, so
it cannot drift from what the server actually exposes. `/mcp` is JSON-RPC and
needs `Accept: application/json, text/event-stream` — opening it in a browser
looks like a failure even when the server is healthy.

```json
{ "mcpServers": { "kanchanflow": { "url": "https://your-host/mcp" } } }
```

---

## What it can do

| Area | Tools |
|---|---|
| Company, positioning, compliance | `kanchanflow_get_company_profile` |
| Feature catalog with truthful status | `kanchanflow_list_features` · `kanchanflow_get_feature` |
| Pricing, plan gates, add-ons, AI credits | `kanchanflow_get_pricing` · `kanchanflow_compare_tiers` · `kanchanflow_get_addons` · `kanchanflow_get_ai_credits` |
| Connectors, setup, limitations | `kanchanflow_list_integrations` · `kanchanflow_get_integration` |
| Display markets and currency | `kanchanflow_list_markets` · `kanchanflow_convert_price` |
| Blog, glossary, changelog, roadmap | `kanchanflow_list_blog_posts` · `kanchanflow_get_blog_post` · `kanchanflow_list_glossary_terms` · `kanchanflow_get_glossary_term` · `kanchanflow_get_changelog` · `kanchanflow_get_roadmap` |
| Partner program | `kanchanflow_get_partner_program` |
| Website URLs and the SEO contract | `kanchanflow_list_pages` · `kanchanflow_get_seo_rules` |
| Cross-collection discovery | `kanchanflow_search` |
| This repository's reference set | `kanchanflow_list_reference_documents` · `kanchanflow_get_reference_document` · `kanchanflow_search_reference` |

Full descriptions: [`reference/mcp/tools.md`](reference/mcp/tools.md).
Resources: [`reference/mcp/resources.md`](reference/mcp/resources.md).
Prompts: [`reference/mcp/prompts.md`](reference/mcp/prompts.md).

### What it cannot do

It does not connect to a customer's KanchanFlow workspace, and it cannot create,
change or delete anything. There is no workspace, quote, RFQ or customer record
behind it — it serves the published content of kanchanflow.com. Every tool is a
read, and every one advertises `readOnlyHint: true`.

---

## Where the data comes from

Nothing here is transcribed by hand or scraped from rendered HTML.

```
KanchanFlow website repo             this repo
  content/brand.js
  content/pricing.js      npm run sync    data/site-mirror.json
  content/features.js    ------------->   reference/site/*.md
  content/integrations.js
  … and the rest
```

`scripts/sync-content.mjs` imports the website's own content modules, derives the
route map from its `app/` directory, and copies its build contract and SEO
documentation into `reference/site/`. The mirror records the website repo's
commit hash and the sync timestamp, and every tool response carries
`source.syncedAt` so a client can judge freshness.

```bash
npm run sync                              # expects ../KanchanFlow
npm run sync -- --repo /path/to/KanchanFlow
```

**Re-run the sync and commit the result whenever the website's content changes.**
Feature status, prices and connector test dates are exactly the facts an AI will
state confidently, so a stale mirror is not a cosmetic problem.

---

## The reference folder

[`reference/`](reference/) is the written record behind this server, and it is
loaded at runtime rather than being documentation that sits beside the code. The
three reference tools read it, and every document is published as an MCP resource
at `kanchanflow://reference/<path>`.

| Folder | Holds |
|---|---|
| `architecture/` | What KanchanFlow is, how the website is built, how this server is built, how data moves |
| `api/` | The MCP surface, authentication, endpoints, the error vocabulary |
| `mcp/` | Tools, resources, prompts, security posture, worked examples |
| `data-model/` | The entities the mirror carries and the shape of each collection |
| `examples/` | Tool-by-tool usage and end-to-end agent workflows |
| `site/` | **Synced** — verbatim copies of the website's own contract and SEO docs |

Reads are confined to that folder: an absolute path or a `..` segment is a
`VALIDATION_ERROR`, checked by normalisation, prefix and `realpath`.

---

## Configuration

Every variable is optional. With none set, the server runs as a public read-only
stdio server, which is the normal desktop setup. See [`.env.example`](.env.example).

| Variable | Default | Purpose |
|---|---|---|
| `KANCHANFLOW_MCP_TRANSPORT` | `stdio` | `stdio` or `http` |
| `KANCHANFLOW_MCP_PORT` | `3010` | HTTP listen port |
| `KANCHANFLOW_MCP_PATH` | `/mcp` | HTTP endpoint path |
| `KANCHANFLOW_MCP_AUTH_TOKEN` | unset | Bearer token for a private HTTP instance |
| `KANCHANFLOW_MCP_RATE_LIMIT` | `60` | Requests per client per minute; `0` disables |
| `KANCHANFLOW_MCP_TRUST_PROXY` (or `TRUST_PROXY`) | `0` | Number of trusted proxy hops. `0` keys the limiter on the socket address; `N` keys on the `N`th-from-right `X-Forwarded-For` entry (short header falls back to the socket). `true`/`yes`/`1` mean `1`; unparsable means `0`. `CF-Connecting-IP` is never read |
| `KANCHANFLOW_MCP_HOST` (or `HOST`) | `127.0.0.1` | HTTP bind address. Keep loopback when the reverse proxy runs on the same host; use `0.0.0.0` only inside containers |
| `KANCHANFLOW_MCP_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1],mcp.kanchanflow.com` | Host names (port ignored) the MCP endpoint answers; `*` disables the check |
| `KANCHANFLOW_MCP_ALLOWED_ORIGINS` | `https://mcp.kanchanflow.com,https://kanchanflow.com,https://www.kanchanflow.com,http://localhost:*,http://127.0.0.1:*` | Browser origins allowed on the MCP endpoint (`:*` = any port); `*` allows any |
| `KANCHANFLOW_MCP_PUBLIC_URL` | unset | Public origin, e.g. `https://mcp.kanchanflow.com`. Used for `/.well-known/mcp.json` and the homepage; never derived from `Host` |
| `KANCHANFLOW_MCP_LOG_LEVEL` | `info` | `silent` · `error` · `warn` · `info` · `debug` |
| `KANCHANFLOW_REFERENCE_DIR` | packaged `reference/` | Override the reference root |
| `KANCHANFLOW_REPO` | `../KanchanFlow` | Website repo path — used by `npm run sync` only |

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Run from source over HTTP — homepage on http://localhost:3010 |
| `npm run dev:stdio` | Run from source over stdio (no port is opened) |
| `npm run start:http` | Run the built server over HTTP |
| `npm run mcp` | Run the built server (stdio by default) |
| `npm run mcp:dev` | Run from source with `tsx watch` |
| `npm run sync` | Regenerate `data/site-mirror.json` and `reference/site/` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run verify` | Typecheck then test |

---

## Testing

```bash
npm test
```

141 tests across six suites:

- **`reference-loader`** — indexing, determinism, truncation, caching, and the
  traversal guard against absolute paths, `..` segments, Windows drive paths, NUL
  bytes and symlinks.
- **`registry`** — the naming convention, uniqueness, description quality, that
  every parameter is described, that no write-shaped tool exists, and that no
  prompt names a tool that does not.
- **`mirror`** — the invariants the website itself is held to: no target date on
  a planned feature, a visible target on every building one, matrix rows aligned
  to the plan columns, revision history and RFQ line items never capped, every
  connector dated, unaudited certifications flagged unverified.
- **`tools`** — filtering, pagination, alias resolution, currency conversion
  arithmetic, seat-count bounds, and the error a miss produces.
- **`security`** — planted environment sentinels never appear in any response,
  resources resolve only from the fixed URI list, an unmodelled error is never
  echoed back, and the rate limiter limits.
- **`mcp-protocol`** — a real client and server across a linked in-memory
  transport: handshake, schema publication, annotations, content framing, error
  framing, resource reads and prompt rendering.

---

## Security

Treat MCP as an external attack surface, then be precise about what is behind it.
Behind this server is a copy of published website content and a folder of
documentation. No database, no credential store, no customer record, no write
path.

That removes privilege escalation, cross-workspace access, IDOR, destructive
operations and data exfiltration by construction. What remains is enforced:
schema validation on every argument, path confinement on every reference read,
per-IP rate limiting, a 1 MB body cap, stateless per-request server instances,
optional bearer auth, and a rule that no response ever carries an environment
value, a token or a filesystem path.

[`reference/mcp/security.md`](reference/mcp/security.md) covers all of it,
including the residual risk worth naming: prompt injection through stored
content, and why the mitigation is Git review rather than a filter.

Security contact: `security@kanchanflow.com`.

---

## Deployment

**stdio** — ship `dist/`, `data/site-mirror.json` and `reference/`. The `files`
field in `package.json` already scopes a publish to those.

**HTTP** — set `KANCHANFLOW_MCP_TRANSPORT=http` and a port, put it behind TLS,
and set `KANCHANFLOW_MCP_AUTH_TOKEN` if the instance should be private. `/health`
answers without a token for orchestrators. The server binds `127.0.0.1` unless
`HOST`/`KANCHANFLOW_MCP_HOST` says otherwise, answers only the Host names in
`KANCHANFLOW_MCP_ALLOWED_HOSTS`, and refuses browser Origins not on
`KANCHANFLOW_MCP_ALLOWED_ORIGINS`. Behind a reverse proxy, set
`KANCHANFLOW_MCP_TRUST_PROXY` to the number of proxies in front: `2` behind
Cloudflare then Apache, or configure Apache `mod_remoteip` with Cloudflare's
ranges and use `1`. Each proxy must append to `X-Forwarded-For`. Left at `0`,
every visitor shares the proxy's rate-limit bucket. Set
`KANCHANFLOW_MCP_PUBLIC_URL` so `/.well-known/mcp.json` and the homepage name
the public endpoint. The rate limiter is per process, so a
horizontally scaled deployment needs a shared limiter at the edge if you want a
global limit.

---

## Layout

```
kanchanflow-mcp/
├── data/site-mirror.json     generated — every fact the server serves
├── reference/                loaded at runtime; see above
├── scripts/sync-content.mjs  regenerates the mirror from the website repo
└── src/
    ├── index.ts  server.ts  server-info.ts  config.ts  errors.ts
    ├── data/     types.ts  mirror.ts
    ├── reference/ loader.ts  index.ts  types.ts
    ├── tools/    one file per domain, plus the registry
    ├── resources/ prompts/
    ├── utils/    logger.ts  rate-limiter.ts  package-paths.ts
    └── __tests__/
```

## Releasing

The homepage's stdio snippet must name a package that is actually published.
Today it shows the local `node …/dist/index.js` form because `kanchanflow-mcp`
is not on npm. Switch it to `npx` only in the same change that follows a
publish, and check `npm view kanchanflow-mcp version` equals `package.json`.

## Licence

MIT © Soor LLC. See [LICENSE](LICENSE).
