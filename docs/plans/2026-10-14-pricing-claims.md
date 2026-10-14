# Plan: derive hard-coded pricing and market claims from the mirror

- **Severity:** P1 (facts that rot silently; MCP Center C5)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval. **No price, plan name or trial term changes.**

## Finding

Most pricing data comes from `data/site-mirror.json`, which the sync script copies from the website. But several pricing and market **claims are typed into the code**, so a website change would not reach them and the server would contradict its own data:

1. `kanchanflow_get_pricing` returns a hard-coded `neverGated` list of three sentences (src/tools/pricing.ts, `neverGated: [...]`), and repeats it in the tool description.
2. `basisFor()` (src/tools/pricing.ts) hard-codes which currencies are contracted ("USD is the contract currency", "India pricing is contracted in INR", "Contracts and invoices are in USD"). The mirror already carries `country.locked` and `country.billedIn` per market.
3. The `kanchanflow_get_pricing` description hard-codes "the three KanchanFlow plans" and "the seven KanchanFlow display markets (US, IN, GB, AU, AE, SG, NZ)". The mirror has 3 tiers and 7 markets today (measured), but the list is not derived.
4. `SERVER_INSTRUCTIONS` (src/server-info.ts) states "USD and INR prices are contracted."
5. `kanchanflow_get_seo_rules` (src/tools/site.ts) hard-codes the content guardrails and hreflang policy that the synced `site/spec-contract.md` already states.

**Audit run** (2026-10-14 13:18 UTC, commit `3706839`, local HTTP build on :3937, path `/mcp`, `audit-live-mcp.mjs` with the forbidden-brand list and `--sample-tool kanchanflow_get_pricing`): 3 fail · 6 warn · 26 pass. The script cannot judge truth; this is from reading the code (skill §3/V3).

**Not checked:** whether any of these claims differ from the live pricing page (no egress). They match the mirror today.

## Proposed fix

1. **Sync script:** if the website exports a never-gated list and contracted-currency flags, copy them into the mirror (`pricing.neverGated`, existing `markets.countries[].locked`/`billedIn`). If it does not, record that and keep the text in one place (below).
2. **One source in code:** move the remaining fixed sentences into `src/data/claims.ts`, each with a comment naming the website file it mirrors, and have pricing.ts, server-info.ts and site.ts import from there.
3. **`basisFor()`:** build the sentence from `country.locked` and `country.billedIn` instead of branching on `US`/`IN`.
4. **Descriptions:** generate the plan count and market list from the mirror at module load (`m.pricing.tiers.length`, `m.markets.countries.map(c => c.code)`).

## Tests to add

- Every market's `basis` is consistent with its `locked` flag (a locked market never says "indicative").
- The pricing description lists exactly the mirror's market codes.
- If `pricing.neverGated` exists in the mirror, the tool output equals it.

## Risks and founder decisions

- **Canonical source.** Needs the founder to name the canonical pricing source (the live pricing page or `content/pricing.js`). Nothing here changes a figure.
- **Wording change.** Generated descriptions may read slightly differently; tool behaviour does not change.
