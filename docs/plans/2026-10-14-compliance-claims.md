# Plan: confirm the compliance claims the server marks as verified

- **Severity:** P1 (claims assistants quote verbatim; skill §3)
- **Effort:** S (code) · depends on a founder answer
- **Status:** plan only. Implementation follows after approval. **No content is changed by this plan.**

## Finding

`kanchanflow_get_company_profile` returns `compliance.verified` from the mirror (src/tools/company.ts), and the tool description tells agents that a verified entry is an achieved audit. The mirror (data/site-mirror.json, `brand.compliance`) marks these as `verified: true`:

- SOC 2 Type II (also in the headline `brand.sub` and `trustBadges` with "Security controls independently audited")
- CCPA Compliant, GDPR Compliant
- USA Data Centers (AWS), 99.9% uptime target

At the same time `brand.entity.foundingDate` is `2026`. A SOC 2 **Type II** report covers an observation period of several months, so a 2026 founding date plus a Type II report by the 2026-09-03 sync is possible only if the audit window started very early. That is worth a founder confirmation before an AI agent repeats it to prospects as fact.

This repo copies the website verbatim, so the source of the claim is the website, not this server. The server's part is the `verified` wording and the instruction to treat it as an audit.

**Not checked:** the website, the auditor's report, or any trust page (no egress; no access to company records).

## Proposed fix

1. **Founder confirms** each `verified: true` entry against its evidence (auditor letter, DPA, hosting contract). Corrections happen in the website repo, then `npm run sync`.
2. **Server side, after confirmation:**
   - Add an optional `evidence` field per compliance entry in the mirror (for example "report available to Enterprise customers on request"), and return it.
   - Change the tool description from "verified means achieved audit" to "verified means the company states it holds this; ask sales for the report", unless the founder confirms every entry is audited.
3. Add a mirror test: every `verified: true` certification-type entry (SOC, ISO, AS) has an `evidence` note.

## Tests to add

- Mirror test above.
- Tool test: `compliance.verified` entries carry `evidence` when present.

## Risks and founder decisions

- **Founder decision:** is SOC 2 Type II held today (report date), and are the CCPA/GDPR and uptime entries claims or audited facts?
- Until answered, nothing changes; this PR only records the question.
