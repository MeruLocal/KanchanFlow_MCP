# Tools

Every tool is read-only and named `kanchanflow_<action>_<resource>`. The
registry in `src/tools/index.ts` asserts both properties at startup.

The descriptions below are summaries. The authoritative text — what each tool
does, when to reach for it, every parameter and every error it can return — is
the `description` the server sends in `tools/list`, which is written for a model
rather than for a reader.

Every tool advertises the MCP annotations `readOnlyHint: true`,
`destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`.

## Company

### `kanchanflow_get_company_profile`
No parameters. Positioning, the Soor LLC entity facts, the compliance list split
into verified and not-verified with the reason, trust badges, social profiles,
market policy and keyword architecture.

Read the `notVerified` list before repeating a compliance claim. The `verified`
list is what the company states on its website, not proof of an audit:
`compliance.basis` says so, `compliance.evidence` carries an evidence note when
the website publishes one, and `compliance.evidencePending` lists certification
entries that have none yet.

## Get started

### `kanchanflow_get_started`
No parameters. Where to send someone who wants to try, see or buy KanchanFlow:
the free-trial signup link with the trial terms, the demo, contact and pricing
pages. Every link is a real route from the mirror's route map; a missing route is
dropped rather than invented.

## Features

### `kanchanflow_list_features`
`status?`, `category?`, `tier?`, `query?`, `limit?`, `offset?`

Summaries with the truthful status on every record, plus the status counts, the
category list and the status legend. The tool for "what can it do", "is X
available", "what is shipping".

### `kanchanflow_get_feature`
`slug`, `includeFaqs?`

One feature in full: status and target, the quotable answer, capabilities,
how-it-works steps, per-plan availability, keywords and FAQs. Resolves retired
slugs through the site's alias table and reports the redirect. `NOT_FOUND`
carries close slugs.

## Pricing

### `kanchanflow_get_pricing`
`countryCode?`

Three plans with per-user monthly and annual prices, seat minimums and caps,
platform fee, who each is for, highlights, the annual discount, trial terms and
the ceiling policy — plus what is never gated on any plan, and `cta` with the
free-trial and demo links. A converted currency comes with the `basis` sentence
explaining that it is indicative. Declares an `outputSchema`.

### `kanchanflow_compare_tiers`
`group?`, `capability?`

The published feature-gate matrix. `capability` filters to rows matching a
phrase, which is the fast path for "is the dealer portal in Starter".

### `kanchanflow_get_addons`
`countryCode?`

Add-on catalog with prices and which plans may buy each, plus the WhatsApp
billing model and the ceiling policy.

### `kanchanflow_get_ai_credits`
No parameters. Credit allowance per plan and the credit weight of every metered
AI operation.

## Integrations

### `kanchanflow_list_integrations`
`category?`, `status?`, `market?`, `query?`, `limit?`, `offset?`

Connector summaries with status, last end-to-end test date and plan
availability, plus the site's quarterly re-test promise.

### `kanchanflow_get_integration`
`slug`, `sections?`

One connector in full: field-level sync tables both directions, cadence, setup
steps, limitations, troubleshooting (error, cause, fix) and FAQs. `sections`
trims the response when only part is needed.

## Markets

### `kanchanflow_list_markets`
No parameters. The seven display markets, their currencies, the dated reference
rates and which prices are contracted rather than converted. Also states that
the selector is display-only — it creates no country routes and no extra
hreflang.

### `kanchanflow_convert_price`
`countryCode`, and either `amountUsd` or `tierId` with `billing?` and `users?`

Reproduces the website's own conversion and rounding, so a figure matches what a
visitor sees. Marks each figure `exact` when contracted. Validates seat counts
against the plan's minimum and cap.

## Editorial

### `kanchanflow_list_blog_posts` — `query?`, `limit?`, `offset?`
Published posts, and separately the editorial calendar of scheduled titles whose
pages do not exist.

### `kanchanflow_get_blog_post` — `slug`, `includeBody?`
### `kanchanflow_list_glossary_terms` — `query?`
### `kanchanflow_get_glossary_term` — `slug`, `includeBody?`

### `kanchanflow_get_changelog` — `tag?`, `since?`, `limit?`
Shipped releases newest first. Every entry describes something that shipped.

### `kanchanflow_get_roadmap`
No parameters. Roadmap buckets plus the building and planned feature lists.
Items under consideration carry no date of any kind — do not attach one.

## Partners

### `kanchanflow_get_partner_program` — `section?`
Partner types, tiers and commission rates, guardrails, certification tracks,
portal capabilities, the review commitment and the FAQs. Reports that the public
directory has no listings yet. Without `section`, certification tracks are
summarised; `section: 'certificationTracks'` returns them in full.

## Website

### `kanchanflow_list_pages` — `prefix?`, `query?`, `limit?`, `offset?`
The real URL set, derived from the site's own route files with dynamic segments
expanded. A URL absent from this list does not exist.

### `kanchanflow_get_seo_rules`
No parameters. Metadata budgets, the structured-data types the site emits, the
types it forbids outright, the hreflang policy and the content guardrails.

## Discovery

### `kanchanflow_search` — `query`, `types?`, `limit?`, `offset?`
Searches features, integrations, glossary, blog, changelog and routes at once.
Ranked, with a snippet and the `followUpTool` to call for the full record. Start
here when the right collection is not obvious. An empty result means the product
publishes nothing on that term. Pages with `offset`; returns `hasMore` and
`nextOffset`. Declares an `outputSchema`.

## Reference

### `kanchanflow_list_reference_documents` — `section?`
### `kanchanflow_get_reference_document` — `path`, `maxChars?`, `offset?`
### `kanchanflow_search_reference` — `query`, `limit?`, `offset?`

Read this folder. A document longer than `maxChars` (default 20,000, at most
22,000) comes back with `truncated: true` and `nextOffset`; read the rest with
`offset`. The search pages the same way with `hasMore` and `nextOffset`. Paths are confined to the reference root: an absolute path or
a `..` segment is a `VALIDATION_ERROR`, not a read.

## Conventions across all tools

- Every success carries `source.syncedAt`, plus `source.ageDays` and
  `source.stale` (older than 14 days, or `KANCHANFLOW_MCP_STALE_AFTER_DAYS`).
  When stale, `source.note` says to confirm prices and status on the website.
- Every absolute kanchanflow.com URL carries
  `utm_source=mcp&utm_medium=ai_agent&utm_campaign=<tool name>`. Relative paths
  (`/features/<slug>`) and other hosts are left as they are.
- No response is over 24,000 characters. A larger one is replaced with
  `truncated: true` and a note naming the arguments that narrow it.
- `kanchanflow_get_pricing`, `kanchanflow_compare_tiers`,
  `kanchanflow_list_features` and `kanchanflow_search` declare an `outputSchema`
  and return the same payload as `structuredContent` alongside the text.
- List tools take `limit` and `offset` and return `total`, `limit`, `offset` and
  `hasMore`.
- A slug miss returns `NOT_FOUND` with `details.didYouMean`.
- Nothing returns a stack trace, an environment value or a filesystem path.
