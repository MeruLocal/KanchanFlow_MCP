# KanchanFlow MCP — overview

## What it is

An MCP server that gives AI assistants and agents accurate, current answers
about KanchanFlow — the RFQ-to-Order manufacturing CRM by Soor LLC — from what
the product actually publishes.

## The problem it solves

Ask a general-purpose assistant about a specific product and it answers from
whatever it absorbed in training. For a young product that produces two failure
modes, and the second is the dangerous one:

1. It knows nothing and says so.
2. It knows a little, fills the rest in from generic CRM knowledge, and states
   it with the same confidence as the part it got right.

The second is how a prospect ends up told that a feature is available when it is
in development, or quoted a price that changed. This server exists so an
assistant can check instead of guess: every advertised feature carries its real
status, every price is the published price, every connector carries the date a
human last tested it end to end, and a term the product does not cover comes back
empty rather than invented.

## What it serves

| Area | Tools |
|---|---|
| Company and positioning | `kanchanflow_get_company_profile` |
| Feature catalog with truthful status | `kanchanflow_list_features`, `kanchanflow_get_feature` |
| Pricing, plan gates, add-ons, AI credits | `kanchanflow_get_pricing`, `kanchanflow_compare_tiers`, `kanchanflow_get_addons`, `kanchanflow_get_ai_credits` |
| Connectors, setup and limitations | `kanchanflow_list_integrations`, `kanchanflow_get_integration` |
| Display markets and currency conversion | `kanchanflow_list_markets`, `kanchanflow_convert_price` |
| Editorial: blog, glossary, changelog, roadmap | `kanchanflow_list_blog_posts`, `kanchanflow_get_blog_post`, `kanchanflow_list_glossary_terms`, `kanchanflow_get_glossary_term`, `kanchanflow_get_changelog`, `kanchanflow_get_roadmap` |
| Partner program | `kanchanflow_get_partner_program` |
| Website structure and the SEO contract | `kanchanflow_list_pages`, `kanchanflow_get_seo_rules` |
| Cross-collection discovery | `kanchanflow_search` |
| Next step: trial, demo, contact, pricing | `kanchanflow_get_started` |
| This reference set | `kanchanflow_list_reference_documents`, `kanchanflow_get_reference_document`, `kanchanflow_search_reference` |

Plus eight JSON resources, one resource per reference document, and five prompts.
See `mcp/tools.md`, `mcp/resources.md` and `mcp/prompts.md`.

## Running it

```bash
npm install
npm run sync          # regenerate the mirror from the website repo (optional; one is committed)
npm run build
npm run mcp           # stdio
```

During development:

```bash
npm run mcp:dev       # tsx watch, stdio
```

As a hosted endpoint:

```bash
KANCHANFLOW_MCP_TRANSPORT=http KANCHANFLOW_MCP_PORT=3010 npm run mcp
```

## Connecting a client

Local, over stdio — the usual desktop setup:

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

Remote, over Streamable HTTP:

```json
{
  "mcpServers": {
    "kanchanflow": {
      "url": "https://your-host/mcp"
    }
  }
}
```

Add an `Authorization: Bearer` header only if the instance you are connecting to
sets `KANCHANFLOW_MCP_AUTH_TOKEN`. A public instance needs none.

## Configuration

Every variable is optional; `.env.example` documents them all.

| Variable | Default | Purpose |
|---|---|---|
| `KANCHANFLOW_MCP_TRANSPORT` | `stdio` | `stdio` or `http` |
| `KANCHANFLOW_MCP_PORT` | `3010` | HTTP listen port |
| `KANCHANFLOW_MCP_PATH` | `/mcp` | HTTP endpoint path |
| `KANCHANFLOW_MCP_AUTH_TOKEN` | unset | Bearer token for a private HTTP instance |
| `KANCHANFLOW_MCP_RATE_LIMIT` | `60` | Requests per client per minute; `0` disables |
| `KANCHANFLOW_MCP_TRUST_PROXY` (or `TRUST_PROXY`) | off | `1`/`true`/`yes`: key the limiter on the right-most `X-Forwarded-For` hop. Set it behind a proxy that **appends** the header |
| `KANCHANFLOW_MCP_HOST` (or `HOST`) | `127.0.0.1` | HTTP bind address. Containers and remote hosts need `0.0.0.0` |
| `KANCHANFLOW_MCP_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1],mcp.kanchanflow.com` | Host names (port ignored) the MCP endpoint answers; `*` disables the check |
| `KANCHANFLOW_MCP_ALLOWED_ORIGINS` | `https://mcp.kanchanflow.com,https://kanchanflow.com,https://www.kanchanflow.com,http://localhost:*,http://127.0.0.1:*` | Browser origins allowed on the MCP endpoint (`:*` = any port); `*` allows any |
| `KANCHANFLOW_MCP_PUBLIC_URL` | unset | Public origin, e.g. `https://mcp.kanchanflow.com`. Used for `/.well-known/mcp.json` and the homepage; never derived from `Host` |
| `KANCHANFLOW_MCP_STALE_AFTER_DAYS` | `14` | Mirror age (days) after which responses carry `source.stale: true` and a note |
| `KANCHANFLOW_MCP_LOG_LEVEL` | `info` | `silent`, `error`, `warn`, `info`, `debug` |
| `KANCHANFLOW_REFERENCE_DIR` | packaged `reference/` | Override the reference root |
| `KANCHANFLOW_REPO` | `../KanchanFlow` | Website repo path — used by `npm run sync` only |

## Usage logs

Usage is answered from the JSON log lines on stderr; nothing else is stored.
Three lines matter, and none carries an argument value, an IP address at info
level, or a token:

| Line | Fields |
|---|---|
| `http.request` | `method`, `path`, `status`, `durationMs`, `ua` — the caller's `User-Agent` reduced to its first product token (`name/version`, at most 64 characters of `[A-Za-z0-9._-]`), otherwise `unknown` |
| `mcp.initialize` | `clientInfo.name` and `clientInfo.version` from the initialize request, sanitised the same way |
| `tool.call` | `tool`, `client` (the same `ua` token, HTTP only), `argKeys` (names only), `outcome`, `errorCode`, `durationMs` |

Tool × client × day, with `jq` over a log file:

```bash
jq -r 'select(.msg=="tool.call") | [.ts[0:10], .tool, (.client // "stdio")] | @tsv' server.log \
  | sort | uniq -c | sort -rn
```

## What it is not

It does not connect to a customer's KanchanFlow workspace, and it cannot create,
change or delete anything. It is a window onto published content. If you need
programmatic access to your own KanchanFlow data, that is the product's REST API,
which is a different thing on a different roadmap.
