# KanchanFlow architecture overview

## What KanchanFlow is

KanchanFlow is an RFQ-to-Order CRM for job shops, machine shops, contract
manufacturers, fabricators and custom / engineer-to-order builders. It manages
inbound RFQs, technical review routing, cost buildup and quoting, quote
revisions, follow-up, order handoff and dealer management.

It is owned and operated by **Soor LLC**, a Delaware-registered company. The
product is sold on three plans — Starter, Professional and Enterprise — with a
14-day trial that takes no credit card.

What it deliberately is not: an ERP, an MRP, a CAD or BOM system, or an advanced
CPQ configurator. It manages the customer-facing half of the job — requests,
quotes, follow-ups and the handoff into production.

## The two repositories

There are two codebases, and this MCP server is the second of them.

### 1. `kanchanflow-crm-web` — the brand website

A **Next.js 16 / React 19** marketing site written in JavaScript, styled with
Tailwind CSS, animated with Framer Motion. It builds to a standalone Node
server (`output: "standalone"`) and prerenders every marketing route.

Its defining property, and the one that matters most to this MCP server, is that
**page copy is data, not markup**. Everything a page asserts comes from files in
`content/`: brand facts, pricing, the feature catalog with its status per
feature, the connector catalog, the glossary, the blog, the changelog and the
roadmap. A page file composes primitives around that data; it does not restate
it. See `architecture/website.md`.

The site has no application database, no user accounts and no customer data. Its
only API route is a container health probe. Form endpoints are a later phase and
are not built.

### 2. `kanchanflow-mcp` — this server

A **TypeScript** MCP server built on the official `@modelcontextprotocol/sdk`.
It mirrors the website's content collections into `data/site-mirror.json` and
serves them as MCP tools, resources and prompts. See
`architecture/mcp-server.md`.

## Why the MCP server is read-only

Because there is nothing else it could honestly be.

The content this server exposes is the published KanchanFlow website. There is
no workspace behind it, no customer record, no quote to create and no RFQ to
update. A `kanchanflow_create_task` tool would have nothing to write to, so it
does not exist. Every tool is a read, and the server advertises that on every
tool through the MCP `readOnlyHint` annotation.

That also settles the authorization question. There is no per-user data to
scope, no cross-workspace boundary to enforce and no privilege to escalate,
because every caller sees exactly what any visitor to kanchanflow.com sees.
`mcp/security.md` states the posture in full, including the parts that still
matter: input validation, path confinement, request limits and never leaking a
filesystem path or an environment value into a response.

## How the two fit together

```
KanchanFlow website repo                    KanchanFlow MCP server
------------------------                    ----------------------
content/brand.js
content/pricing.js          npm run sync    data/site-mirror.json
content/features.js        ------------->   reference/site/*.md
content/integrations.js
content/countries.js                              |
content/blog.js                                   v
content/glossary.js                         MCP tools / resources / prompts
content/changelog.js                              |
content/partners.js                               v
SPEC-CONTRACT.md                            MCP clients (Claude, IDEs, agents)
app/**/page.js
        ^
        |
   /mcp page on the website documents the server for humans
```

The website's `/mcp` page is the human-facing side of the same thing: it
explains the server, lists what it can do, and carries the client configuration
snippets. Its capability list is written from the tools that actually exist.

See `architecture/data-flow.md` for the sync in detail.
