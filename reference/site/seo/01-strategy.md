<!-- SYNCED COPY. Source of truth: docs/seo/01-strategy.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 01 — Strategy

Sections A (Executive SEO strategy), B (Ideal customer profile), C (SEO
positioning), U (Risks and guardrails).

---

## A. Executive SEO strategy

### A.1 Where we actually stand

`kanchanflow.com` on 2026-09-03: **Domain Rating 0, zero ranking organic
keywords, zero organic traffic** (Ahrefs Site Explorer). 125 routes are built
and prerendered — 113 of them indexable — but none of them rank yet. Everything below is a from-zero
plan, not an optimisation plan.

### A.2 The size of the prize, stated honestly

Adding up US monthly search volume across every commercially relevant keyword
in `data/keyword-universe.csv`, excluding competitor brand names and terms with
mismatched intent:

| Cluster | Combined US volume/mo | Realistic 12-month capture |
|---|---:|---:|
| Manufacturing CRM head | ~3,400 | 400–900 visits/mo |
| Quoting / estimating / CPQ | ~5,200 | 500–1,100 visits/mo |
| RFQ | ~2,500 | 200–450 visits/mo |
| Shop-type software (job shop, machine shop, fabrication) | ~2,800 | 300–700 visits/mo |
| ERP↔CRM and accounting integration | ~5,700 | 400–800 visits/mo |
| Compliance (PPAP, APQP, SDS, IATF) | ~1,000 | blocked by product truth |
| Aftermarket / channel / territory | ~2,300 | mostly blocked by product truth |

The honest ceiling for a well-executed first year is roughly **1,500–3,000
non-brand US organic visits a month**. That is not a disappointment — it is what
the category is. Paperless Parts, with DR 52, 2,243 homepage backlinks and
years of head start, pulls about 400 non-brand visits a month. MRPeasy pulls
24,000, but almost none of it from CRM terms: their traffic comes from
manufacturing-operations education (`bill of materials`, `discrete
manufacturing`, `ABC analysis`, `OTIF`) and from MRP/ERP head terms.

**The strategic consequence:** organic search is a *qualified-lead* channel
here, not a volume channel. Every page must be built to convert a small number
of highly-qualified visitors, not to harvest traffic. A page earning 40 visits
a month from `job shop manufacturing software` — a term with a **$50.00 CPC** —
is worth more than a blog post earning 400 from `manufacturing kpis`.

### A.3 The four moves

**Move 1 — Own the manufacturing-CRM head with one page, not eight.**
Today the homepage carries the `manufacturing crm` head term (title:
"Manufacturing CRM for RFQ-to-Order Quoting"). MRPeasy beats a homepage with a
dedicated URL. Build `/manufacturing-crm` as the pillar, absorb all nine head
variants into it, and free the homepage to do brand and conversion work.

**Move 2 — Move the ICP pages from CRM phrasing to software phrasing.**
Five ICP pages exist at `/job-shop-crm`, `/machine-shop-crm`,
`/contract-manufacturing-crm`, `/fabrication-crm`, `/custom-manufacturing-crm`.
Their titles already lean the right way — `/job-shop-crm` is titled "Job shop
software for one-off RFQ work" — but the URLs and internal anchors point at
keywords with no recorded demand. Retarget them on the software terms, keep the
URLs (a redirect at DR 0 costs more than it gains), and fix the anchors.

**Move 3 — Take the estimating and quoting SERPs, where DR does not protect the
incumbents.** `manufacturing estimating software` (300, KD 1, TP 1,200),
`quoting software for manufacturing` (400, KD 0, TP 1,100) and
`job shop manufacturing software` (150, KD 1, **$50 CPC**) all have DR 7–17
pages in the top ten. These are the fastest wins on the site.

**Move 4 — Cash the QuickBooks integration.** `quickbooks crm integration`:
450/mo, **KD 2**, traffic potential 1,800 — the highest traffic-potential
low-difficulty keyword in the entire pull, and QuickBooks Online & Enterprise is
a **live** integration in `content/integrations.js`. The page exists at
`/integrations/quickbooks` but is built as a connector page, not as a
destination for that search. Rebuild it as a full commercial page.

### A.4 What we deliberately are not doing

- Not publishing an industry page for automotive, chemicals or textiles. No
  demand under CRM phrasing, and no product capability behind the compliance
  claims those pages would need to make.
- Not building a comparison programme. `mrpeasy alternative`, `katana
  alternative`, `jobboss alternative` and `paperless parts alternative` are
  20–40 searches a month each. Four to six comparison pages, chosen on evidence,
  is the whole programme.
- Not chasing `mrp software` (3,200/mo, **KD 47**), `cpq software` (2,400/mo,
  KD 35) or `crm software` (544,000/mo). Wrong category, wrong difficulty, and
  in the CPQ case explicitly rejected in `content/brand.js`.
- Not producing generic CRM education. `what is a manufacturing crm` and
  `benefits of crm in manufacturing` both return **zero volume**.

---

## B. Ideal customer profile

### B.1 What the research document says

Mid-market discrete manufacturers, roughly **$5M–$250M revenue and 25–500
employees** — the "messy middle" that has outgrown Zoho/HubSpot/Pipedrive but
cannot staff or wait out a Salesforce or NetSuite rollout (research doc §8,
Gap 1).

### B.2 What the shipped site says

`SPEC-CONTRACT.md` locks a narrower ICP: **US job shops and contract
manufacturers**, priced at $39–$99 per user per month with a 3-user minimum and
a 10-user cap on Starter. At $49/user Professional, a 500-employee manufacturer
with 60 sales seats is a $35k/year account — plausible; a $250M manufacturer
running Salesforce is not a realistic prospect for a Delaware LLC founded in
2026 with no named customers.

### B.3 The ICP this strategy writes to

Both are true at different depths, and the SEO ICP has to be the narrower one,
because search intent is narrow.

| | Primary ICP (write every page for this reader) | Secondary ICP (accept, do not target) |
|---|---|---|
| Revenue | $2M–$40M | $40M–$250M |
| Employees | 10–150 | 150–500 |
| Type | Job shop, machine shop, metal fabricator, contract manufacturer, custom/ETO equipment builder | Electronics/EMS, industrial equipment OEM |
| Sales team | 1–6 people, often including the owner | 6–25, with a sales manager |
| Estimators | 1–4 | 4–12 |
| Current tooling | Excel, email, a whiteboard, sometimes a shop ERP (E2, JobBOSS, Global Shop) with a CRM tab nobody opens | A generalist CRM plus a separate ERP |
| Trigger to search | RFQs are getting lost; quotes take too long; nobody knows which quote the customer is holding | A CRM/ERP consolidation project |

**The reader.** The `SPEC-CONTRACT.md` house style already names them: a
55-year-old shop owner or an estimator, reading on a phone in a noisy building,
who has been sold software before and did not enjoy it. Concrete numbers, no
"unlock" or "seamless", say what it does and then say what it does not do.

**Search behaviour that follows from this ICP.** They do not search "CRM". The
Ahrefs data proves it: `job shop crm` has no record, `job shop software` has
350 searches a month. They search for the *job*, not the *category* — and when
they do search a category word it is "software", "estimating", "quoting" or
"ERP", never "CRM". Every page's primary keyword must respect that.

---

## C. SEO positioning

### C.1 The positioning we are stuck with, and why it is right

`SPEC-CONTRACT.md` locks the H1: *"The RFQ-to-Order CRM built for job shops and
contract manufacturers."* The research doc proposes a broader statement: *"The
manufacturing CRM built for the messy middle — deep enough for engineer-to-order
complexity and BOM-aware quoting, without the 12-month, consultant-dependent
rollout that enterprise suites require."*

Keep the locked one. The research statement promises BOM-aware quoting, which
`content/features.js` marks `building` and about 30% complete, and which the
shipped anti-position explicitly disclaims. Publishing it would violate the
no-fabricated-claims rule on the first line of the site.

### C.2 The three defensible claims

Only three differentiators from the research doc's list of twelve survive
contact with `content/features.js`. Every page should be built from these:

1. **RFQ-to-Order is one record, not four systems.** RFQ intake from email,
   WhatsApp, web form and marketplaces → technical routing → quote with cost
   buildup → revision chain → order handoff. Live or building end to end.
2. **Nothing important is gated.** Unlimited revision history and unlimited RFQ
   line items on every tier including Starter, and the India regulatory features
   are ungated by contract. Against Katana ("core CRM features gated behind
   add-ons") and HubSpot ("pricing escalates fast"), this is a real, checkable
   claim.
3. **We say what we are not.** The anti-position banner is a positioning asset,
   not a disclaimer. In a category where every ERP claims a CRM and every CRM
   claims quoting, "we are not an ERP, MRP, CAD, BOM or advanced CPQ system" is
   the most differentiated sentence on the site — and it is the one an
   experienced shop owner will believe.

### C.3 The claim we cannot yet make

The research doc's headline differentiator is **ERP-agnostic native
integration** (Gap 2). `content/integrations.js` contains 26 connectors and
**not one packaged ERP connector**. An Enterprise workspace can commission a
custom ERP connector as a $500/month add-on and production milestones can arrive
over an ERP webhook on Professional and above, but neither is a named,
switch-on integration. Until one ships, the site cannot claim named ERP
integration, cannot publish `/erp-agnostic-crm`, and cannot run the ERP
integration cluster the master prompt describes. It can honestly say it
integrates with QuickBooks, Zoho Books, Tally and MyOB — which is an accounting
claim, and should be sold as one.

### C.4 Entity and E-E-A-T positioning

Zero customers, zero reviews, zero certifications beyond the SOC 2 Type II
claim already in `content/brand.js`. The trust ladder the spec defines —
Delaware LLC, USA data centers, open changelog, public roadmap, feature-truth
audit — is the entire E-E-A-T story for Wave 1, and it is a better one than
fake logos. See `04-editorial.md` §Q.

---

## U. SEO risks and guardrails

### U.1 Guardrails inherited from `SPEC-CONTRACT.md` (non-negotiable)

These are already law in this repo. Restated so no page brief can accidentally
break one:

1. Never emit `FAQPage` schema. FAQs are visible-only via `FaqAccordion`.
2. Never emit `Review` or `AggregateRating`.
3. Never name Meru Technosoft, HelloGrowthCRM, HelloGrowth, HGC or hellocrm.
4. Never fabricate customer logos, testimonials, counts or case studies.
5. Never claim a certification without an audit.
6. hreflang stays `en-US` + `x-default`.
7. Never cap revision history or RFQ line items in pricing copy.
8. Never gate the India regulatory features by tier.
9. Status badges stay truthful: live / beta / building / planned.
10. Every figure is described, never faked.

### U.2 SEO-specific guardrails added by this strategy

**No keyword stuffing.** Every page gets one primary keyword and a maximum of
six secondaries that share its intent. The `AnswerBlock` must read as prose to
a shop owner, not as a keyword slot.

**No intent mismatch.** Two traps are live in this dataset and must be avoided
by name:
- `custom manufacturing software` (600/mo, KD 0) has parent topic *"manufacturing
  software development services"* — the searchers want a dev agency, not a CRM.
  `/custom-manufacturing-crm` must not target it.
- `automotive crm` (2,600/mo) means car dealerships, not Tier 1 suppliers.
- `ems software` (600/mo) is ambiguous with emergency medical services.

**No cannibalisation.** One primary keyword maps to exactly one canonical URL.
The map in `02-keywords.md` §G is the register; adding a page means adding a row
there first. Any two pages sharing a parent topic must be consolidated or one
must be demoted to a section.

**No doorway pages.** An industry or shop-type page must contain material that
could only have been written about that shop type — the actual RFQ volume, the
actual estimator count, the actual failure mode. If a page would read the same
with the shop type swapped out, it is a doorway page and must not ship.

**No thin content.** A keyword existing is not a reason to publish. Twenty-three
keywords in the pull have zero recorded demand; none of them earns a page.

**No unsupported competitor claims.** Every competitive statement carries a
dated, linked, public source. The research document's own methodology note
requires this, and its pricing figures in particular are marketing-page
estimates. `/best-crm-for-manufacturing` and every `/vs/*` page must carry a
visible "checked on" date and a source list.

**No fake expertise.** No invented author credentials, no claimed hands-on
testing that did not happen. If a comparison is desk research from public
sources, the page says so.

**No AI filler.** Every paragraph must carry a fact, a number, a mechanism or a
limit. The opening of a page is the most-skipped and most-generic part of most
SaaS sites; the `AnswerBlock` contract already fixes that if it is honoured.

### U.3 The five real risks

| Risk | Likelihood | What it costs | Mitigation |
|---|---|---|---|
| **AI Overviews absorb the clicks.** 80% of the commercial SERPs pulled carry an AI Overview | Certain — already happening | 30–60% of the modelled traffic | The `AnswerBlock` pattern is the right response: a 40–60 word quotable answer naming the entity and category. Measure impressions in GSC, not just clicks, and treat AI Overview citation as a KPI |
| **The category is too small to justify the page count.** 125 routes (113 indexable) against a 1,500–3,000 visit/mo ceiling | High | Crawl budget, index bloat, maintenance cost | Freeze new page creation until the 20 pages in `07-page-briefs.md` rank. Noindex `planned` feature pages (already policy) |
| **Feature pages outrun the product.** 20 `building` and 9 `planned` features have marketing pages | Medium | Trust, and a Google quality problem if pages promise what the trial does not deliver | The status-badge rule already covers this. Add: no `planned` feature page may be linked from a `RelatedLinks` block on an indexable page |
| **Zero backlinks, zero DR.** No page will rank on merit alone for 4–6 months | Certain | Slow start | The linkable-asset plan in `04-editorial.md` §R, built around the RFQ Analyzer and original benchmark data |
| **The India-weighted integration set contradicts the USA-only positioning.** 13 of 26 connectors are India-specific (IndiaMART, JustDial, TradeIndia, Sulekha, Razorpay, ClearTax, Karza, Aadhaar, Delhivery, Shiprocket); zero are US ERPs | High | A US shop owner landing on `/integrations` sees a product built for someone else | Reorder `/integrations` by market relevance, and treat the missing US ERP connectors as the top SEO-blocking product gap. See `08-conflicts.md` |
