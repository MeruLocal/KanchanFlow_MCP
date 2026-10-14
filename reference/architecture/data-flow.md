# Data flow

## The sync

```
KanchanFlow website repo
  content/brand.js        content/pricing.js     content/features.js
  content/integrations.js content/countries.js   content/blog.js
  content/glossary.js     content/changelog.js   content/partners.js
  app/**/page.js          SPEC-CONTRACT.md       README.md
        |
        |  npm run sync            (scripts/sync-content.mjs)
        v
  data/site-mirror.json           reference/site/*.md
```

`scripts/sync-content.mjs` does five things:

1. **Locates the website repo** — `--repo <path>`, else `KANCHANFLOW_REPO`, else
   `../KanchanFlow`. It refuses to run against a directory with no
   `content/brand.js`.
2. **Imports the content modules.** They are ESM that import each other through
   the `@/content/x` alias, so the script copies them to a temp directory,
   rewrites the alias to a relative import, and imports them — the same
   technique the website's own `scripts/gen-seo-files.mjs` uses. Nothing is
   parsed by regex and nothing is transcribed by hand.
3. **Derives the route map** by walking `app/` for `page.js` files and expanding
   each `[slug]` segment from the collection that supplies it, so the map holds
   real URLs rather than templates.
4. **Copies the website's own documents** into `reference/site/`, each with a
   header naming its source, and writes `reference/site/MANIFEST.json`. Only the
   build contract and the README are copied; the website's internal SEO planning
   documents are not served.
5. **Checks brand isolation before writing anything.** The mirror JSON and every
   copied document pass `assertBrandClean` from `scripts/brand-guard.mjs`. A
   match aborts the sync, so a forbidden company or brand name never reaches
   this repo. The contract's own guardrail 3 is rewritten on copy
   (`redactBrandGuardrail`) to state the rule without listing the names.

Provenance is recorded in `meta`: the sync timestamp and the website repo's
short commit hash. Every tool response carries `source.syncedAt`, so a client can
see how fresh the answer is.

## At request time

```
MCP client
   |  tools/call
   v
src/server.ts   assigns a request id, starts the timer
   |
   v
tool handler    reads the cached mirror or the reference loader
   |
   v
src/server.ts   { success, data } as JSON text, logs the outcome
   |
   v
MCP client
```

Nothing at request time touches the network, the website repo or the filesystem
beyond the packaged mirror and reference folder. A tool call is a lookup in
already-parsed memory, or a cached read of one markdown file.

## Freshness

The mirror is a snapshot committed to this repository, which is what lets the
package run standalone. It goes stale when the website changes.

The discipline: **run `npm run sync` and commit the result whenever the website's
content collections change.** Feature status, prices and connector test dates are
exactly the facts an AI client will state confidently, so a stale mirror is not a
cosmetic problem.

Two things make staleness visible rather than silent:

- Every tool response carries `source.syncedAt`.
- Connector responses carry `lastTested`, the date a human ran that sync end to
  end against a live sandbox, with the site's own re-test cadence beside it.
