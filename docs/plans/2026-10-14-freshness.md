# Plan: mirror freshness flag and a scheduled sync

- **Severity:** P2 (silent content rot)
- **Effort:** S for the flag; M for the scheduled sync, which depends on repo access
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **The mirror is 41 days old and nothing says so.** `data/site-mirror.json` `meta.syncedAt` is `2026-09-03T11:25:06Z`, which is 41 days old on 2026-10-14.
   - Every tool returns `source.syncedAt` (22 call sites in src/tools), but nothing marks the data as stale.
   - An AI client will quote 6-week-old prices, feature statuses and the roadmap as current.
2. **Nothing regenerates the mirror.** The only path is a manual `npm run sync` (scripts/sync-content.mjs). It needs the website repository checked out at `../KanchanFlow` (or `KANCHANFLOW_REPO`), and the script refuses to run without `content/brand.js` there (scripts/sync-content.mjs:41-55).

**Not checked:**
- whether the website repo (`meta.sourceRepo` = `kanchanflow-crm-web`) is on GitHub and readable from this repo's Actions. From the sandbox it could not be listed.
- whether the live site has changed since `a30153e`.

## Proposed fix

### A. Staleness flag (works with no CI access)

1. **New `src/data/freshness.ts`:**
   - `freshness(syncedAt, now = Date.now())` returns `{ syncedAt, ageDays, stale: ageDays > STALE_AFTER_DAYS, note? }`.
   - `STALE_AFTER_DAYS` is 14, overridable with `KANCHANFLOW_MCP_STALE_AFTER_DAYS`.
   - When the mirror is stale, `note` reads: "This content was synced N days ago and may be out of date. Confirm prices and feature status at https://kanchanflow.com before relying on them."
2. **Apply it centrally.** In the registry (src/server.ts `buildServer`), merge it into every success payload's `data.source`, so the 22 tool files do not change. Site resources get the same treatment in `readSiteResource` (src/resources/index.ts).
3. **Server instructions.** Add one line to `SERVER_INSTRUCTIONS`: "If source.stale is true, say the information may be out of date."

### B. Scheduled sync (only if access works)

1. **`.github/workflows/sync-content.yml`:**
   - `schedule: cron "0 6 * * 1"` (weekly) plus `workflow_dispatch`.
   - Check out this repo, then check out the website repo into `../KanchanFlow` with `actions/checkout` (`repository: <owner>/<website-repo>`, `token: ${{ secrets.WEBSITE_REPO_TOKEN }}`, a fine-grained read-only PAT or deploy key).
   - Run `npm ci`, `npm run sync`, and the tests (which include the brand-isolation test from the brand plan).
   - Then use `peter-evans/create-pull-request` (pinned) to open a **draft PR** with the regenerated `data/` and `reference/site/`. It never pushes to main.
2. **If no token is provisioned,** the workflow exits early with a clear message, so it never fails noisily.
3. **Fallback if access is not granted:** ship A only, plus a CI test that fails once the mirror is more than 30 days old. That turns rot into a visible red build.

## Tests to add

- Unit tests for `freshness()`: fresh at 13 days, stale at 15 days, the env override, and an invalid date reported as stale.
- Protocol test: with a fake clock, or by asserting on the real mirror (currently 41 days), `kanchanflow_get_pricing` returns `data.source.stale === true` and includes the `note`.
- The resource read includes `source.stale`.

## Risks and founder decisions

- **Founder decision: the token.** Part B needs a read token for the website repo stored as a repo secret. Without it, only A ships.
- **Brand guard on sync.** Synced content passes the brand guard (brand plan). A sync that brings in forbidden names fails, and no PR is opened.
- **Interaction with structured output.** If the structured-output plan lands, add `stale` and `ageDays` to the `source` schema.
