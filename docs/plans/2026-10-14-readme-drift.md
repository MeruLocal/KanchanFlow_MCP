# Plan: stop hard-coding counts in the README and reference docs

- **Severity:** P2 (repo hygiene; skill D6)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

Counts in the docs have already drifted from the code:

| Where | Says | Measured on `3706839` |
|---|---|---|
| README.md:181 | "141 tests across six suites" | **162 tests in 8 files** (`npm test`) |
| README.md:13 | "24 read-only tools · 8 JSON resources · 30 reference documents · 5 prompts" | 24 tools, 30 reference files, 5 prompts today; the brand-isolation plan removes 8 reference docs, and the conversion plan adds a tool |
| reference/api/overview.md:14, reference/mcp/security.md:21 | "24 read-only tools" | 24 today, same exposure |

The homepage already generates its counts from the registries (src/homepage.ts), which is the right pattern.

**Not checked:** other prose counts in reference/ beyond a grep for these numbers.

## Proposed fix

1. Remove the numbers from README.md:13 and :181 and the two reference docs; say "every tool is read-only" and point to the homepage or `tools/list` for the live list.
2. If a count line is wanted, add `scripts/doc-counts.mjs` that rewrites a marked block (`<!-- counts -->…<!-- /counts -->`) from `allTools`, resources and prompts, and run it in `npm run verify`.
3. Remove the suite-by-suite test list or keep it without numbers.

## Tests to add

- Optional: a test that fails if README contains a digit-count next to "tools" outside the generated block.

## Risks

- None. Docs only, but it touches README lines that the brand-isolation and conversion plans also edit; merge this last.
