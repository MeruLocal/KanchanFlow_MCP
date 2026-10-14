# Plan: `outputSchema` + `structuredContent` on the core tools

- **Severity:** P1 (the audit skill rates A1 outputSchema + structuredContent as P1. Was P2.)
- **Effort:** M
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **No tool declares an `outputSchema`.** Every result is a single `text` block of pretty-printed JSON (src/server.ts:85 and :100). Clients have to re-parse the text, and none can validate the shape.
   - **Measured:** `audit-live-mcp.mjs` (local :3010, path `/mcp`) reports `WARN tools no tool sets outputSchema`. The earlier baseline was 3 fail · 3 warn · 11 pass. **Re-audit (2026-10-14 13:18 UTC, new skill and script, local :3937, path `/mcp`):** 3 fail · 6 warn · 26 pass. The same `WARN C2.output_schema` is reported.
2. **Tool types have no output field.** `ToolDefinition` (src/tools/tool-types.ts) has no output field, and the registry ignores outputs.

## Proposed fix

1. **Extend the tool type.** Add an optional `outputSchema?: ZodRawShape` to `ToolDefinition`.
2. **Define schemas** for the `data` envelope (`{ success: true, data: {...} }`) of these four tools:
   - `kanchanflow_get_pricing`: `currency`, `annualDiscountPct`, `trial`, `tiers[]` (id, name, minUsers, maxUsers, monthlyPerUser, annualPerUser, platformFeePerMonth nullable, highlights), `neverGated`, `urls`, `source`.
   - `kanchanflow_compare_tiers`: `columns`, `groups[]` (group, rows: string[][]), `availableGroups`, `rowCount`, `legend`, `url`, `source`.
   - `kanchanflow_list_features`: the paging fields, `statusCounts`, `categories`, `features[]` (slug, name, category, status enum, target, wave, lead, url), `statusLegend`, `source`.
   - `kanchanflow_search`: `query`, `total`, `returned`, `typesSearched`, `results[]` (type, slug, title, snippet, status?, url, score, followUpTool), optional `note`, `source`.

   Fields that vary use `.passthrough()` or optional, so a mirror field addition does not break the schema. The top level is `{ success: literal(true), data: … }`.
3. **Registry** (src/server.ts `buildServer`):
   - Pass `outputSchema` to `registerTool` when it is defined.
   - On success, return `{ content: [text JSON as today], structuredContent: payload }`. Text content stays, for older clients.
   - On error, return only `isError` plus text. The SDK skips output validation when `isError` is set. This is SDK 1.30 behaviour; confirm it during implementation.
4. **Optional rollout to the other tools** once the pattern is proven. Not part of this change.

## Tests to add

- Protocol test (InMemoryTransport):
  - `tools/list` shows an `outputSchema` of type object for the 4 tools
  - calling each one returns `structuredContent` that deep-equals `JSON.parse(content[0].text)`
- Error-path test: `kanchanflow_compare_tiers` with an unknown group returns `isError` with no `structuredContent`, and does not raise an SDK validation error.
- Re-run the audit script: `C2.output_schema` should become a PASS (6 warn → 5 warn on the new script).

## Risks

- **Schema drift.** If a mirror field changes type, the SDK rejects the result.
  - Mitigation: loose (passthrough) object schemas for nested content.
  - A test runs every tool's default call through the schema.
- **Interaction with the conversion plan.** If UTM post-processing lands, it must run before `structuredContent` is set, so both representations match.
