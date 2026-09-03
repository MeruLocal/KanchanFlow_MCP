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
| `KANCHANFLOW_MCP_RATE_LIMIT` | `120` | Requests per IP per minute; `0` disables |
| `KANCHANFLOW_MCP_LOG_LEVEL` | `info` | `silent`, `error`, `warn`, `info`, `debug` |
| `KANCHANFLOW_REFERENCE_DIR` | packaged `reference/` | Override the reference root |
| `KANCHANFLOW_REPO` | `../KanchanFlow` | Website repo path — used by `npm run sync` only |

## What it is not

It does not connect to a customer's KanchanFlow workspace, and it cannot create,
change or delete anything. It is a window onto published content. If you need
programmatic access to your own KanchanFlow data, that is the product's REST API,
which is a different thing on a different roadmap.
