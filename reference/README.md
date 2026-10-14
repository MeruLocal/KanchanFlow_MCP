# KanchanFlow reference

The written record behind the KanchanFlow MCP server. Everything here is either
authored against the real KanchanFlow codebase or synced verbatim from it —
nothing describes a capability that does not exist.

This folder is not decoration. It is loaded at runtime: `kanchanflow_list_reference_documents`,
`kanchanflow_get_reference_document` and `kanchanflow_search_reference` read it
through `src/reference/loader.ts`, and every document is also published as an
MCP resource under `kanchanflow://reference/<path>`. Edit a document here and
every surface that quotes it changes on the next server start.

## Layout

| Folder | What it holds |
|---|---|
| `architecture/` | What KanchanFlow is, how the website is built, how this MCP server is built, and how data moves between them |
| `api/` | The surface this server exposes, how it authenticates, its endpoints and its error vocabulary |
| `mcp/` | The MCP integration itself: tools, resources, prompts, security posture and worked examples |
| `data-model/` | The entities the mirror carries and the shape of each content collection |
| `examples/` | Tool-by-tool usage and end-to-end agent workflows |
| `site/` | **Synced.** Copies of the website repository's own build contract and README |

## What is authored and what is generated

Everything except `site/` is authored by hand and reviewed like code.

`site/` is written by `npm run sync` from the KanchanFlow website repository, so
the packaged reference set carries the site's own build contract without this
repo restating it in different words. Each file there opens with a header naming
its source. Do not edit `site/` by hand — the next sync overwrites it.
`site/MANIFEST.json` records what was copied and from where.

## Ground rules these documents follow

The same rules the KanchanFlow website itself is held to, because a reference
set that contradicts the product is worse than no reference set:

1. **No invented capability.** If the server does not implement it, it is not
   documented here as though it does.
2. **Status is truthful.** A feature described as live is live in production. A
   feature in development says so and names its target milestone.
3. **No fabricated evidence.** No customer names, no testimonials, no adoption
   counts, no benchmark numbers that were not measured.
4. **No secrets.** Nothing in this folder is a credential, a token, an internal
   hostname or a private endpoint. The loader will serve any file here to any
   client, so treat it as public.

## Where the rest of the truth lives

- Product content — features, pricing, connectors, glossary, changelog — comes
  from `data/site-mirror.json`, generated from the website repo by
  `npm run sync`. The mirror is the data; this folder is the explanation.
- The website's page contract, brand facts and guardrails are in
  `site/spec-contract.md`.
- Implementation detail lives in the code and its comments, not restated here.
