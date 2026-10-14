# Plan: stop publishing internal SEO docs and other-brand names

- **Severity:** P0 (brand isolation and internal data leak)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **Internal planning docs are served and published.** `reference/site/seo/01..08-*.md` hold the internal SEO strategy, keyword volumes, CPCs, page briefs and a risk register.
   - They live under `reference/`, which is in npm `files` (package.json:17).
   - They are served to any MCP client by `kanchanflow_get_reference_document`, `kanchanflow_search_reference`, `kanchanflow_list_reference_documents` and as `kanchanflow://reference/site/seo/*` resources. All of these use `ReferenceLoader`, which walks the whole folder (src/reference/loader.ts).
2. **Other brands are named in served content:**
   - `reference/site/spec-contract.md:17-18` (guardrail §0.3 lists the forbidden company/brand names in order to forbid them)
   - `reference/site/seo/01-strategy.md:208`
   - `kanchanflow_search_reference` finds both.
3. **A re-sync would bring them back.** `scripts/sync-content.mjs:278-285` copies `docs/seo/*` verbatim, and nothing checks the copied text.
4. **Test coverage is partial.** The only existing guard, `src/__tests__/security.test.ts:224`, checks the mirror JSON only. It does not check reference docs, prompts or the homepage.

**Measured.** A prototype of the test below failed 5 of 12 cases against main: reference docs, resources, search, published files, and the SEO-docs presence check.

**Audit baseline.** `audit-live-mcp.mjs` against local HTTP on :3010, with the endpoint path set to `/mcp`: 3 fail · 3 warn · 11 pass. None of these results is about content.

**Not checked:**
- whether an npm version is already published
- the website repo's own copies of these docs
- the live site

## Proposed fix

1. Delete `reference/site/seo/` and remove its entries from `reference/site/MANIFEST.json`.
2. Rewrite guardrail §0.3 in `reference/site/spec-contract.md` to "never name any company other than Soor LLC". The rule stays the same; the names come out.
3. In `scripts/sync-content.mjs`:
   - Drop the 8 `docs/seo/*` rows from `SITE_DOCS`.
   - Add `redactBrandGuardrail(text)`, which applies the same §0.3 rewrite on copy.
   - Add `assertBrandClean(label, text)`, which aborts the sync if the mirror JSON or any copied doc matches the forbidden-brand pattern (the parent-company and sister-product names already listed in `security.test.ts:226`, plus the short forms).
   - Run the check before the mirror is written.
4. Update the docs that describe the synced set: README.md (lines 103 and 133), reference/README.md:22, reference/architecture/data-flow.md, and the `kanchanflow_list_reference_documents` description in src/tools/reference.ts:24.
5. Optional hardening: the loader could also skip any `site/seo/` path. Deleting the docs is enough on its own, so this is not required.

## Tests to add

`src/__tests__/brand-isolation.test.ts` fails on any banned-pattern match in:
- server title, description and instructions
- every tool's name, title and description, plus its output when called with `{}`
- the output for every feature, integration, blog post and glossary slug in the mirror
- every reference doc, read in full through the tool
- both search tools when queried for the banned names (expect 0 hits)
- every site and reference resource, including its listing metadata
- every prompt, rendered
- the HTTP homepage HTML
- every text file under package.json `files` except `dist/`, which is built from `src/` and covered by the cases above

The same file also asserts that no `site/seo/` document is indexed or present.

## Risks, rollout and founder decisions

- **Founder decision on git history.** History still contains the SEO docs and the old contract line. Removing them needs a history rewrite (filter-repo plus a force-push on main) or making the repo private.
- **Founder decision on npm.** Any npm version already published still ships the docs. If one exists, deprecate or unpublish it.
- **Website repo.** The website repo's README/contract may contain the same names. Fix them there, or the sync guard will stop the next sync, which is the intended behaviour.
- **Risk.** Low: content removal plus a test.
