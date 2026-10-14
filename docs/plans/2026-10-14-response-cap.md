# Plan: keep tool responses under ~25k characters and add tool icons

- **Severity:** P2 (agent quality; MCP Center C2.titles / C15.tool_count, skill A4)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **Responses above the ~25k-character budget.** Measured against the local build (text length of `content[0].text`):
   - `kanchanflow_get_reference_document` defaults to `DEFAULT_MAX_CHARS = 40_000` (src/reference/loader.ts:40) and accepts up to `200_000` (src/tools/reference.ts:68). A 200k request for `site/seo/07-page-briefs.md` returned 46,562 characters.
   - `kanchanflow_get_partner_program` with no arguments returned 23,742; `kanchanflow_list_features` at `limit: 200` returned 20,903; `kanchanflow_search_reference` at `limit: 100` returned 20,645.
   Many clients truncate or reject tool results above roughly 25k characters, and a large result crowds out the conversation.
2. **Pagination gaps.** `kanchanflow_search` and `kanchanflow_search_reference` take `limit` but no `offset`/cursor, so results past the cap are unreachable. The list tools already page (`paginate()` in src/tools/tool-types.ts).
3. **No `icons`** on any tool (measured: none of 24 tools sets `icons`). The homepage already serves the brand icon at `/assets/brand/icon-192.png`.

**Audit run** (2026-10-14 13:18 UTC, commit `3706839`, local HTTP build on :3937, path `/mcp`, `audit-live-mcp.mjs` with the forbidden-brand list and `--sample-tool kanchanflow_get_pricing`): 3 fail · 6 warn · 26 pass. The script does not measure response size; numbers above are from a separate measurement on the same build.

## Proposed fix

1. **Central cap** in the registry (src/server.ts `buildServer`): if the serialised payload exceeds `MAX_RESPONSE_CHARS = 24_000`, return a truncated result instead: keep `success`, add `truncated: true` and a note naming the paging argument to use. Tools that page should never hit it; it is a safety net.
2. **Reference reads:** lower `DEFAULT_MAX_CHARS` to 20,000 and the `maxChars` maximum to 24,000; add `offset` (characters) so long documents can be read in parts, and return `nextOffset` when truncated.
3. **Search tools:** add `offset` and return `hasMore`/`nextOffset` like `paginate()`.
4. **Partner program:** add an optional `section` argument, or drop the largest field from the default view behind `includeDetails`.
5. **Icons:** set `icons: [{ src: <public URL>/assets/brand/icon-192.png, mimeType: "image/png", sizes: ["192x192"] }]` on the server info and tools once the public URL setting exists (see the well-known plan).

## Tests to add

- Every tool called with its defaults returns under 24,000 characters (loop over `allTools`).
- Reference read with `offset` returns the next slice; the joined slices equal the document.
- Search `offset` returns the next page; `hasMore` false on the last page.

## Risks

- Lower defaults mean more calls for long documents. The note tells the agent how to continue.
- Icons need an absolute URL; without the public URL setting, skip them.
