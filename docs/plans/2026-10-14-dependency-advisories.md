# Plan: clear the npm audit advisories in production dependencies

- **Severity:** P2 (supply chain; skill D4/D5)
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

`npm audit --omit=dev` on a clean `npm ci` of `3706839` (measured 2026-10-14) reports **5 advisories: 1 critical, 1 high, 3 moderate**. All arrive through `@modelcontextprotocol/sdk@1.30.0` (range `^1.30.0`, lockfile 1.30.0):

| Package | Severity | Advisory (short) | Fix available |
|---|---|---|---|
| proxy-addr | critical | IP spoofing via IPv4-mapped IPv6 trust subnet | yes |
| @modelcontextprotocol/sdk 1.12.0–1.30.1 | high | OAuth **client** could send credentials to a server-chosen authorization server | yes |
| fast-uri | moderate | host case normalisation | yes |
| hono | moderate | jsx XSS | yes |
| ip-address | moderate | subnet compare across families; unbounded parse | yes |

**Reachability today is low:** this server uses `node:http` directly, not the SDK's express helpers, its OAuth client, hono or proxy-addr. They are installed and shipped anyway, and a registry scanner will report them against the package.

**Not checked:** the exact fixed SDK version (needs a registry query at implementation time).

## Proposed fix

1. Bump `@modelcontextprotocol/sdk` to the first release above 1.30.1 that clears the advisory, then `npm audit fix` (no `--force`) to refresh the transitive versions.
2. Run typecheck, build, the full suite and the audit script; record the result.
3. Add `npm audit --omit=dev --audit-level=high` to CI (see the CI plan).

## Tests to add

- None new; the existing 162 tests and the protocol test cover the SDK surface. CI gains the audit step.

## Risks

- An SDK minor bump can change validation behaviour (output-schema plan depends on it). Land this before the structured-output plan.
