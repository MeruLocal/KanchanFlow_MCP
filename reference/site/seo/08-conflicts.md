<!-- SYNCED COPY. Source of truth: docs/seo/08-conflicts.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 08 — Conflict register

Everything this strategy could not resolve on its own. Three kinds:

- **§C** — conflicts with `SPEC-CONTRACT.md`, which outranks this document.
  Each needs a founder decision before the affected page ships.
- **§D** — claims in the research document that the Ahrefs data contradicts.
  Flagged, not overwritten, per the source rule.
- **§E** — pages the master prompt asks for that cannot be written truthfully
  today, with the evidence for each.

---

## C. Conflicts with `SPEC-CONTRACT.md`

### C1 — `cpq software` is on the reject list, but three qualified CPQ keywords are viable

**The lock.** `content/brand.js`:

```js
rejected: ["cpq software", "quoting software", "configure price quote", "dealer management software"],
```

**The data.**

| Keyword | Vol | KD | CPC | Parent topic |
|---|---:|---:|---:|---|
| cpq software | 2,400 | **35** | $10 | cpq software |
| cpq software for manufacturing | 350 | 7 | **$18** | cpq software **for manufacturing** |
| manufacturing cpq software | 300 | 5 | $0.80 | cpq software for manufacturing |
| cpq for manufacturing | 150 | 1 | $15 | cpq software for manufacturing |

The rejected term and the three viable ones have **different parent topics** —
Ahrefs is saying they are different queries served by different pages. The
reject is correct for `cpq software` (KD 35, wrong buyer, and the anti-position
disclaims advanced CPQ). It reads as also rejecting the manufacturing-qualified
terms, which `/features/manufacturing-cpq` already targets in
`content/features.js` (`primaryKeyword: "manufacturing cpq software"`).

**So the repo already contradicts itself**: the reject list and the feature
catalogue disagree.

**Recommendation.** Make the reject precise:

```js
rejected: [
  "cpq software",            // KD 35, enterprise configurator buyer — never
  "quoting software",        // KD n/a, too broad
  "configure price quote",
  "dealer management software",
],
// Permitted, manufacturing-qualified only, and only on /features/manufacturing-cpq:
//   manufacturing cpq software · cpq software for manufacturing · cpq for manufacturing
```

The same question applies to `dealer management software`: the rejected term
itself has no US data, while `channel management software` (800/mo, **KD 0**) is
served by a **live** feature. Brief 10 targets the latter, which the reject list
does not cover — but the boundary should be written down.

**Decision needed:** founder sign-off to amend `content/brand.js`. Briefs 9 and
10 are blocked until then.

---

### C2 — `/indiamart-crm` and the USA-only lock

**The lock.** `SPEC-CONTRACT.md` §1: *"Market: USA-only Wave 1, single .com
root, USD default."*

**The data.** `indiamart crm` — **0 US searches/month** (50 global). The page is
in the sitemap at priority 0.6.

**The wider issue.** **12 of the 26** connectors in `content/integrations.js`
carry `market: "India"` — IndiaMART, JustDial, TradeIndia, Sulekha, Razorpay,
ClearTax GSP, Karza, Aadhaar eSign, Delhivery, Shiprocket, Tally and Zoho Books.
**Zero are US ERPs.** A US shop owner landing on `/integrations` sees a product built for
someone else's market — which is a conversion problem before it is an SEO
problem.

**Options.**
1. `noindex` `/indiamart-crm` and drop it from the sitemap. Keeps it reachable
   for India-based prospects, removes it from the US index. *(Recommended.)*
2. Retire it entirely with a 301 to `/integrations`.
3. Keep it and accept that the site's most India-specific page is indexed in a
   USA-only Wave 1.

Either way, **reorder `/integrations`** so QuickBooks, Stripe, Gmail, Outlook,
Google Calendar, Zoom, Shopify and FedEx lead, and the India connectors sit
under a clearly labelled section.

`/whatsapp-crm-for-manufacturers` is a softer version of the same tension:
`whatsapp crm` has 500 US searches, so the term is not purely India — but the
buyer persona skews heavily. Keep it, deprioritise it, and do not put WhatsApp
in the site's primary US messaging.

**Decision needed:** which option for `/indiamart-crm`.

---

### C3 — The homepage currently owns the head keyword the pillar needs

**The lock.** The H1 and sub in `content/brand.js` are locked. The **title** is
not — it lives in `app/page.js` as a local constant.

Brief 2 changes only the title, so no locked value moves. Flagging it because
the homepage title is a founder-visible decision even though it is not in the
locked file.

**Decision needed:** approval to change the homepage title from *"Manufacturing
CRM for RFQ-to-Order Quoting · KanchanFlow"* to *"KanchanFlow — the RFQ-to-Order
CRM for job shops"*.

---

### C4 — Five ICP page URLs say "CRM"; the demand says "software"

`/job-shop-crm`, `/machine-shop-crm`, `/fabrication-crm`,
`/contract-manufacturing-crm`, `/custom-manufacturing-crm` are the Wave 1 URL
set in `SPEC-CONTRACT.md` §5. All five slugs contain a word nobody searches for
in that position.

**This strategy does not recommend changing the URLs.** At DR 0 with no
rankings, a bulk slug change costs crawl equity and gains nothing Google reads
strongly. Titles, H1s, `AnswerBlock`s and anchors carry the retarget.

**No decision needed** — recorded so the reasoning is not relitigated later. If
the site is ever rebuilt or migrated, the slugs should become
`/job-shop-software` and so on at that point.

### C5 — Two stale facts in the repo itself

Found while verifying this strategy against the code. Neither is caused by the
strategy; both should be corrected in the repo.

**The route count in `README.md` is wrong.** It states "131 prerendered routes"
and its own table sums to 122. The real build surface is **125**: 48 static
`page.js` files, 47 features, 26 integrations, 2 blog posts, 2 glossary terms.
`public/sitemap.xml` carries 113 `<loc>` entries, which is 125 minus the 9
`planned` feature pages, `/signup`, `/partners/apply` and `/partners/portal` —
exactly right, so the sitemap generator is correct and only the README is stale.

**There is no `/glossary` index route.** `app/glossary/` contains only
`[slug]/page.js`, and `next.config.mjs` 302s `/glossary` to `/glossary/rfq`.
That is a reasonable interim, but a temporary redirect on a hub URL is worth
revisiting: with only two glossary terms it is fine; at six or more, build a
real index and make it the cluster hub. Brief 18's link plan assumes no index
route exists.

**Decision needed:** none urgent. Correct the README count in the next commit
that touches it.

---

## D. Where Ahrefs contradicts the research document

Flagged rather than overwritten, per the master prompt's source rule. In each
case the research document may still be right about the *market* while being
wrong about the *search behaviour*.

### D1 — "Industry targeting" assumes searchable industry demand. There is none.

**Research doc §5** sequences five industries and §6 specifies features for
each. **Ahrefs:** every "CRM for [industry]" phrasing returns **no data**.

**Reconciliation.** The research is about *sales targeting*, not *search
targeting*, and it is probably right that machinery and electronics are the
beachhead. But those buyers do not reach a website by searching their industry
plus "CRM". They search their shop type plus "software". The industry sequence
should drive outbound, product and positioning; the shop-type software terms
should drive the site. **Verify** by checking which industries the first fifty
trial signups come from.

### D2 — "ERP-agnostic native integration" is the #1 differentiator and has no search demand

**Research doc §8**, Gap 2: the top differentiator to build toward.
**Ahrefs:** `erp agnostic crm` — no data. `crm with erp integration` — no data.
`manufacturing erp crm` — no data. `crm erp integration` — 600/mo, KD 15.
`manufacturing erp integration` — 90/mo.

**Reconciliation.** Both can be true: a strong *product* differentiator that is
not a *keyword*. It is a positioning asset for sales conversations and
comparison pages, not a page cluster. Note separately that the product currently
has no packaged connector for a named ERP, so the claim cannot be made in
that form yet (§E1).

### D3 — Salesforce, HubSpot, Zoho and NetSuite comparisons have almost no demand

**Research doc §2** treats Tier A and Tier C as the primary competitive set.
**Ahrefs:** `hubspot manufacturing` 10/mo · `salesforce manufacturing cloud`
300/mo · no data for `zoho crm manufacturing`. Meanwhile `paperless parts`
(2,200), `mrpeasy` (1,500), `jobboss` (1,300) and `global shop solutions`
(1,600) carry real branded demand.

**Reconciliation.** The research set is the *budget* competitive set — who the
money is going to. The Ahrefs set is the *search* competitive set — who our
buyer is actively shortlisting. For SEO, the shop-floor and quoting incumbents
matter more than the enterprise CRM suites. **Verify** against win/loss notes
once there are any.

### D4 — Paperless Parts is absent from the research document entirely

Not a contradiction so much as a gap. Paperless Parts is the **parent topic** of
both `quoting software for manufacturing` and `manufacturing estimating
software` — Ahrefs' way of saying it defines the category — with 2,200 monthly
brand searches and 2,243 backlinks to its homepage. It does not appear in the
research document's Tier A–E competitor set.

**Recommendation.** Add it to the competitive research and run a hands-on trial,
per the research document's own "commission hands-on trials" next step. It is
the single most relevant competitor to this site's best keywords.

### D5 — Competitor pricing in the research document must not reach the website

The methodology section says prices are "directional, not contractual" and
"should be reconfirmed directly with the vendor". Several figures cited —
JobBOSS² at ~$3,000/yr, Fulcrum Pro at $20,000+ upfront, Insightly onboarding
at $1,500–$15,000 — are marketing-page estimates.

**Binding rule:** no price appears on any KanchanFlow page unless it is a
published list price with the source URL and the date it was checked. This
applies to `/best-crm-for-manufacturing` and every `/vs/*` page.

---

## E. Pages blocked by product truth

Master-prompt pages that cannot be written truthfully today, with the evidence
from `content/features.js` and `content/integrations.js`.

### E1 — The entire ERP integration cluster

**Requested:** Manufacturing ERP Integration · ERP-Agnostic CRM · CRM with ERP
Integration · NetSuite CRM Integration · Epicor CRM Integration · `/[erp]-crm-integration/`
programmatic template · topic Cluster C.

**Correction, 2026-09-03.** An earlier draft of this strategy said the product
has "zero ERP integrations". That was wrong, and it contradicted five shipped
pages. The accurate position, from `content/pricing.js`: there is **no packaged
connector for a named ERP** (no NetSuite or Epicor switch), but Enterprise
workspaces can commission a **custom ERP connector for SAP, Oracle and similar
at $500/month**, a **PLM connector at $250/month**, and **production milestone
updates arrive over an ERP webhook on Professional and Enterprise**. The SEO
conclusion is unchanged — you still cannot build `/integrations/netsuite`-style
pages for connectors that do not exist by name — but the framing everywhere in
these documents is "no named ERP connector", never "no ERP integration".

**Evidence:** `content/integrations.js` contains 26 connectors across
Accounting, Compliance, Signature, Payments, Messaging, Lead source, Email,
Scheduling, Commerce, Logistics and Other. **None is a named ERP.** No NetSuite,
no Epicor, no Odoo, no SAP, no Dynamics, no Fulcrum, no JobBOSS, no MRPeasy, no
Global Shop, no E2. What does exist, from `content/pricing.js`: a custom ERP
connector add-on at $500/month (Enterprise only), a PLM connector at $250/month
(Enterprise only), and production milestone updates over an ERP webhook on
Professional and Enterprise.

**Verdict:** blocked entirely. What can be said truthfully is that KanchanFlow
syncs with **QuickBooks, Zoho Books, Tally and MyOB** — accounting, not ERP.
Brief 4 monetises exactly that.

**Unblocks when:** the first ERP connector reaches `live`. At that point
`/integrations/[erp]-crm-integration` becomes the best programmatic template
available to this product — `quickbooks crm integration` at KD 2 with TP 1,800
is the proof.

### E2 — The compliance cluster

**Requested:** Manufacturing Compliance CRM · PPAP CRM · APQP CRM · IATF 16949
CRM · SDS Management CRM · GHS Compliance CRM · COA Management Software ·
Automotive APQP Software · topic Cluster F.

**Evidence:** `content/features.js` contains one relevant feature —
`ppap-automotive`, status **`planned`**, no target date, noindex until it
exists. There is no APQP, IATF 16949, SDS, GHS, COA or REACH feature at all.
The `Compliance` category holds GST invoicing, e-Invoice IRN, GSTIN validation,
US tax rates, the immutable audit log and the MSMED 43B(h) tracker — India and
US tax, not manufacturing quality compliance.

**Real demand exists:** `apqp software` 350 (KD 0) · `sds management software`
300 (KD 3, CPC $17) · `reach compliance software` 200 · `ppap software` 150
(KD 0) · `iatf 16949 software` 150 (KD 0). Low difficulty across the board —
these are genuinely winnable SERPs, which makes the block frustrating rather
than academic.

**Verdict:** blocked. The research document sequences this work at Phase 2
(months 6–12) for automotive and Phase 3 (months 12–18) for chemicals. The
content follows the feature, not the other way round.

### E3 — The aftermarket and service cluster

**Requested:** Installed Base Management · Equipment Service Contract Management
· Manufacturing Aftermarket CRM · Warranty Management · topic Cluster E.

**Evidence:** no installed-base, serial-number, service-contract, warranty,
renewal-alert or parts-catalogue feature exists in `content/features.js`.

**Demand:** `warranty management software` 500 (KD 24) · `service contract
management software` 100 · `installed base management` 100 · `installed base
management software` 90 · `aftermarket parts software` 40. Modest, and KD 24 on
the largest one.

**Verdict:** blocked, and low priority even when unblocked.

### E4 — BOM quoting and AI quoting as page-level claims

**Requested:** BOM Quoting Software · AI Quoting Software for Manufacturing ·
BOM Quoting Software for Electronics.

**Evidence:** structured BOM roll-up is **`building`**, part of the CPQ
estimating engine that `content/features.js` puts at "roughly 30 percent
complete", and gated to Professional and Enterprise. The shipped anti-position
states: *"KanchanFlow is not an ERP, MRP, CAD, BOM or advanced CPQ system."*
`ai-agent-approval-mode` is live but is a CRM agent, not a quoting engine.

**Demand:** `bom quoting software` returned no US data. `ai quoting software` is
30/mo.

**Verdict:** blocked twice over — no demand, and the claim contradicts shipped
copy. BOM belongs in **editorial only** (`04-editorial.md` §M.3 post #5), never
as a product claim.

### E5 — Customer portal and document portal

**Requested:** Manufacturing Customer Portal · Chemical Customer Portal ·
Manufacturing Document Management.

**Evidence:** the quote **share link** is live — a buyer opens a quote in a
browser without a login. That is not a customer portal: no order history, no
document library, no invoice access, no login.

**Verdict:** `manufacturing customer portal` (100/mo) and `customer portal
software` (900/mo, KD 15) are **blocked**. `manufacturing document management`
(200/mo, KD 1, **CPC $18**) is **partially unblocked** by
`drawing-revision-management` (`building`) and is briefed as a P2 page — but the
page must be about drawing revisions, not about a portal.

### E6 — Territory management and dealer 360

**Requested:** Manufacturing Territory Management · Dealer Management CRM ·
Manufacturing Channel Management.

**Evidence:** `dealer-channel-partners` is **live** (Brief 10 targets it).
`territory-management`, `dealer-360` and `dealer-exclusivity` are all
**`building`**.

**Verdict:** partially unblocked. `/features/dealer-channel-partners` is P1 and
ready now. `/features/territory-management` (`sales territory management
software`, 350/mo, KD 6, CPC $15) is P2 and needs the status badge in both the
page and the meta description until the feature ships.

### E7 — Multi-currency and multi-entity

`multi-currency` is **live**. `multi-entity-support` (multi-company,
multi-plant) is **`planned`**. `multi entity crm manufacturing` has no
meaningful demand. No page needed either way; multi-currency belongs as a
feature line on `/features/quote-editor` and `/pricing`.

---

## F. The three product gaps that most constrain SEO

Ranked by what they cost in organic terms.

| # | Gap | SEO cost | Unblocks |
|---:|---|---|---|
| 1 | **No packaged connector for a named ERP** | The whole integration cluster, the one viable programmatic template, and the research document's #1 differentiator as a claim | `/integrations/[erp]-crm-integration` at the same KD 2 / TP 1,800 economics as QuickBooks, per ERP brand |
| 2 | **No compliance features** | ~1,000 monthly searches at KD 0–3 — the lowest-difficulty untapped demand in the entire pull | PPAP, APQP, IATF, SDS, REACH pages, and the automotive and chemicals industry pages behind them |
| 3 | **CPQ estimating engine at ~30%** | Weakens the site's single best page (Brief 3) — the estimating block has to be written in the future tense | Full-strength `/manufacturing-quoting-software` and `/features/manufacturing-cpq` |

None of these is an SEO problem to solve with content. They are product
sequencing decisions, and the research document already sequences them —
integration in Phase 0, compliance in Phases 2–3. The only SEO recommendation
here is: **when a feature reaches `live`, the corresponding page is the highest
priority content item in that sprint**, because the keyword research is already
done and sitting in `data/keyword-universe.csv`.
