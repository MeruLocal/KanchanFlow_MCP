# Plan: surface the trial CTA, add `kanchanflow_get_started`, tag own-site URLs with UTM

- **Severity:** P2 (growth, not a defect)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **The trial CTA is never served.** The mirror already holds `brand.trialCta` = { label "Start Free Trial (No Credit Card)", href "/signup" } (data/site-mirror.json:26-29), `brand.primaryCta` → `/demo`, and the routes `/signup`, `/demo`, `/contact` and `/pricing`. No tool returns `trialCta`.
   - `kanchanflow_get_pricing` returns `trial` terms but no signup link (src/tools/pricing.ts:126 has only pricing and tier-comparison URLs).
   - An agent asked "how do I try it" has no URL to give.
2. **No next-step tool.** There is no single tool an agent can call for the next step: trial, demo, contact or pricing.
3. **No UTM attribution.** Own-site URLs carry no UTM, so traffic from AI agents cannot be told apart in analytics. Absolute URLs are built in src/tools/{pricing,content,features,integrations,partners}.ts. Relative `url` fields appear in list and search results.

**Not checked:** that `/signup` and `/demo` resolve on the live site (the sandbox cannot reach it). Both are in the mirror's own route map.

## Proposed fix

1. **New `src/utils/utm.ts`** with `withUtm(url, toolName)`:
   - Only for absolute URLs on `https://kanchanflow.com` or `www.`.
   - Appends `utm_source=mcp&utm_medium=ai_agent&utm_campaign=<tool_name>`.
   - Keeps any existing query string and fragment.
   - Never touches external URLs, and never adds the parameters twice.
2. **Registry-level post-processing** in `buildServer()` (src/server.ts), so every tool is covered without editing each handler:
   - Walk the success payload and tag string values that are own-site absolute URLs.
   - Leave relative paths unchanged, so list payloads stay small.
   - Leave resources (`kanchanflow://site/*`) untouched. They are raw data, not agent-facing links.
3. **`kanchanflow_get_pricing`:** add `cta: { trial: { label, url }, demo: { label, url } }` built from `brand.trialCta` and `brand.primaryCta` plus `brand.url`. Also add `urls.signup`. No price changes.
4. **New tool `kanchanflow_get_started`** in src/tools/company.ts, or a new `src/tools/get-started.ts`:
   - Read-only, no inputs.
   - Returns:
     - trial: the label, the URL `${brand.url}/signup` and the trial terms from `pricing.trial`
     - demo (`/demo`)
     - contact (`/contact`)
     - pricing (`/pricing`)
     - a one-line call to action
   - All URLs carry UTM.
   - Every path must exist in `site.routes`. Drop any that does not (no invented paths).
   - Register it in src/tools/index.ts, and update the tool counts in the README and reference/mcp/tools.md, plus any test count.

## Tests to add

- `withUtm` handles:
  - a plain URL
  - an existing query string
  - a fragment
  - an already-tagged URL (no duplicate)
  - an external URL (unchanged)
  - a relative URL (unchanged)
- `kanchanflow_get_pricing` returns `cta.trial.url` beginning `https://kanchanflow.com/signup?` with `utm_campaign=kanchanflow_get_pricing`.
- `kanchanflow_get_started`:
  - every URL has UTM
  - every path is in `site.routes`
  - the tool has read-only annotations
  - its output passes the brand-isolation scan
- The protocol test's tool count rises by 1.

## Risks and rollout

- **Tagged links become the canonical form agents repeat.** Harmless, but analytics should treat `utm_medium=ai_agent` as a channel.
- **Changed output strings.** Snapshot-style assertions on `url` values may need updating.
