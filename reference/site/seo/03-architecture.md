<!-- SYNCED COPY. Source of truth: docs/seo/03-architecture.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 03 — Architecture

Sections D (Sitemap), I (Product pages), J (Feature pages), K (Industry pages),
L (Comparison pages), N (Programmatic SEO), O (Internal linking).

---

## D. Complete website sitemap

The Wave 1 URL set in `SPEC-CONTRACT.md` §5, plus three additions, two merges
and one retirement. Changes are marked **NEW**, **MERGE**, **RETIRE**,
**RETARGET**.

```
/                                          RETARGET → brand + rfq-to-order crm
├── /manufacturing-crm                     NEW ★ pillar · manufacturing crm
├── /product
├── /pricing
│   ├── /tier-comparison
│   ├── /add-ons
│   ├── /ai-credits
│   └── /whatsapp-billing
├── /demo
├── /free-tool/rfq-analyzer                ★ link asset
│
├── Quoting cluster
│   ├── /manufacturing-quoting-software    RETARGET ★ + absorbs estimating
│   ├── /rfq-management-software           ★
│   ├── /quote-management-software
│   └── /features/manufacturing-cpq        ★
│
├── Quote-to-cash cluster
│   ├── /quote-to-cash                     ★
│   ├── /quote-to-order                    KEEP — own parent topic (corrected)
│   ├── /engineer-to-order-software
│   └── /distributor-management-software
│
├── Shop-type cluster
│   ├── /job-shop-crm                      RETARGET ★ job shop software
│   ├── /machine-shop-crm                  RETARGET   machine shop software
│   ├── /fabrication-crm                   RETARGET   metal fabrication software
│   ├── /contract-manufacturing-crm        RETARGET
│   └── /custom-manufacturing-crm          REMOVED — merged into /engineer-to-order-software
│
├── Channel cluster
│   ├── /features/dealer-channel-partners  ★ channel management software
│   ├── /features/dealer-360
│   ├── /features/dealer-exclusivity
│   └── /features/territory-management     ★
│
├── Comparison
│   ├── /best-crm-for-manufacturing        ★
│   ├── /vs/paperless-parts                NEW ★
│   ├── /vs/mrpeasy
│   ├── /vs/jobboss
│   └── /vs/zoho-crm-for-manufacturing     deprioritise
│
├── /integrations                          RETARGET → reorder by US relevance
│   ├── /integrations/quickbooks           RETARGET ★ quickbooks crm integration
│   └── ...25 more connector pages
│
├── /features                              48 pages · index + 47 features
│                                       18 live · 20 building · 9 planned(noindex)
│
├── Channels
│   ├── /whatsapp-crm-for-manufacturers    flag — positioning conflict
│   ├── /indiamart-crm                     RETIRE or noindex
│   └── /mobile-crm-for-shop-floor         deprioritise
│
├── Resources
│   ├── /blog
│   │   ├── /blog/rfq-response-time-benchmark   ★ original research
│   │   ├── /blog/section-43b-h-msme-payment-rule
│   │   └── /blog/erp-vs-crm-manufacturing      NEW ★
│   └── /glossary                        no index route — 302s to /glossary/rfq
│       ├── /glossary/rfq                  EXPAND ★ rfq vs rfp
│       └── /glossary/cpq-vs-crm
│
├── Transparency        /whats-shipping · /changelog · /roadmap
├── Trust               /about · /trust · /contact
├── Partners            /partners · /partners/directory · /partners/certification
│                       /partners/apply(noindex) · /partners/portal(noindex)
├── Legal               /legal/terms · privacy · dpa · cookies · accessibility
└── Utility             /signup (noindex)
```

★ = one of the 20 priority pages briefed in `07-page-briefs.md`.

**Route arithmetic.** The site has **125** routes today — 48 static `page.js`
files plus 47 features, 26 integrations, 2 blog posts and 2 glossary terms —
of which **113 are indexable**, matching the 113 `<loc>` entries in
`public/sitemap.xml`. Nine `planned` feature pages plus `/signup`,
`/partners/apply` and `/partners/portal` stay noindex and out of the sitemap,
which `scripts/gen-seo-files.mjs` already handles.

After this strategy, as built: **127 routes, 114 indexable** — two static
routes and one blog post added, `/custom-manufacturing-crm` removed, and
`/indiamart-crm` noindexed. No redirects were added: nothing is indexed and the
sitemap has never been submitted, so removed routes were simply removed.

*(The repo `README.md` states "131 prerendered pages". That figure is stale; the
build surface is 125. Worth correcting there too.)*

---

## I. Product page strategy

### I.1 The homepage handoff

The homepage title today is *"Manufacturing CRM for RFQ-to-Order Quoting ·
KanchanFlow"*. It is carrying the head term for the whole category.

The evidence says a dedicated URL beats a homepage here.
`mrpeasy.com/manufacturing-crm/` holds position 1 for nine head variants; its
homepage holds position 1 only for its own brand name. Salesforce's
`/manufacturing/` page — a dedicated URL at DR 92 — sits at position 9.

**Recommendation.** Build `/manufacturing-crm` as the pillar. Change the
homepage title to lead on the locked H1 positioning
(*"The RFQ-to-Order CRM for job shops · KanchanFlow"*), keep "manufacturing
CRM" in the body prose where it belongs, and link the homepage to the pillar
from the first section. The homepage then optimises for what a homepage is
actually good at: brand queries, direct traffic, and the demo conversion.

### I.2 The core-page list in the master prompt

The master prompt asks for nine near-identical core pages:
Manufacturing CRM · CRM Software for Manufacturing · Manufacturing Sales CRM ·
Manufacturing CRM Software · Manufacturing CRM Platform · Manufacturing CRM
Features · Manufacturing CRM Pricing · Manufacturing CRM Demo · Manufacturing
CRM Integrations.

Ahrefs parent-topic data collapses the first five into one page: they all
resolve to `manufacturing crm` or `crm for manufacturing`. Publishing five would
be textbook cannibalisation, and MRPeasy proves one page wins all of them.

| Master-prompt page | Verdict |
|---|---|
| Manufacturing CRM | **Build** → `/manufacturing-crm` |
| CRM Software for Manufacturing | Section on the pillar (H2) |
| Manufacturing Sales CRM | Section on the pillar — `manufacturing sales crm` returned no metrics |
| Manufacturing CRM Software | Section on the pillar |
| Manufacturing CRM Platform | **Reject** — no demand, no distinct intent |
| Manufacturing CRM Features | Already exists → `/features` |
| Manufacturing CRM Pricing | Already exists → `/pricing` |
| Manufacturing CRM Demo | Already exists → `/demo` |
| Manufacturing CRM Integrations | Already exists → `/integrations` |
| Manufacturing CRM Implementation | **Reject as a page.** `crm implementation` is 2,000/mo but generic and not manufacturing-specific. Make it a section on `/pricing` and a `/trust` sub-section covering onboarding time |
| Manufacturing CRM vs ERP | **Build as editorial** → `/blog/erp-vs-crm-manufacturing` |
| Manufacturing CRM vs General CRM | Section on `/best-crm-for-manufacturing` |
| vs Salesforce / HubSpot / Zoho / Dynamics / NetSuite / Odoo | See §L |
| Manufacturing CRM Alternatives | Section on `/best-crm-for-manufacturing` |

### I.3 Conversion goals by page type

| Page type | Primary CTA | Secondary |
|---|---|---|
| Pillar (`/manufacturing-crm`) | See a Live Quote Draft (`/demo`) | Try the RFQ Analyzer |
| Quoting / RFQ product spokes | See a Live Quote Draft | Start Free Trial |
| Shop-type pages | Start Free Trial | See a Live Quote Draft |
| Feature pages (live) | Start Free Trial | Pricing |
| Feature pages (building) | See the roadmap | Demo |
| Comparison pages | Pricing, then trial | Demo |
| Editorial / glossary | RFQ Analyzer | Pillar page |
| Integration pages | Start Free Trial | Integration docs |

---

## J. Feature page strategy

45 feature pages exist. Most target long-tail phrases with no recorded volume,
and that is acceptable: a feature catalogue is a conversion and evaluation
asset, not a traffic asset. Buyers who reach `/features/quote-editor` from
inside the site are further down the funnel than anyone arriving from search.

**But four feature pages sit on real keywords and should be treated as
commercial landing pages, not catalogue entries:**

| Page | Keyword | Vol | KD | Feature status | Action |
|---|---|---:|---:|---|---|
| `/features/dealer-channel-partners` | channel management software | 800 | 0 | **live** | Promote to P1. Best demand-to-difficulty ratio of any live feature |
| `/features/manufacturing-cpq` | manufacturing cpq software | 300 | 5 | **building** | Promote to P1, status badge mandatory. Resolve the brand.js reject-list conflict first |
| `/features/territory-management` | sales territory management software | 350 | 6 | **building** | P2 until the feature ships |
| `/features/drawing-revision-management` | manufacturing document management | 200 | 1 | **building** | P2. CPC $18 makes it worth the effort |

**The status rule as an SEO rule.** A `building` feature page ranking for a
commercial keyword sends a buyer to a page for something they cannot use today.
The existing status badge handles the honesty problem. Add one SEO rule on top:
a `building` page's meta description must state the status, so the truth is in
the SERP snippet and not just on the page. `/features/manufacturing-cpq` already
does this well in body copy ("roughly 30 percent complete and targeted at Wave 1
Milestone 4") — put that in the description.

**Master-prompt feature pages that cannot be built.** Of the 31 feature pages
in §4 of the master prompt, 14 have no product behind them: BOM Quoting
Software, AI Quoting Software, Deal-to-Project Handoff, Manufacturing ERP
Integration, ERP-Agnostic CRM, CRM with ERP Integration, Manufacturing Customer
Portal, Manufacturing Compliance CRM, PPAP CRM, APQP CRM, IATF 16949 CRM, SDS
Management CRM, GHS Compliance CRM, Installed Base Management, Equipment Service
Contract Management, Manufacturing Aftermarket CRM. See `08-conflicts.md` for
the per-page evidence.

---

## K. Industry page strategy

### K.1 The finding that rewrites this section

Every "CRM for [manufacturing industry]" keyword returned **no data** from
Ahrefs US. Not low volume — no record. That covers machinery, industrial
equipment, metal fabricators, job shops, ETO, custom equipment, electronics,
EMS, automotive suppliers, chemicals and textiles.

The demand exists, but under a different word. Shops search for
**"[shop type] software"**, and they search by *what they do*, not *what
industry they are in*:

| Master-prompt phrasing | Vol | The phrasing with demand | Vol | KD |
|---|---:|---|---:|---:|
| CRM for Job Shops | 0 | job shop software | 350 | n/a |
| | | job shop manufacturing software | 150 | 1 |
| | | job shop management software | 150 | n/a |
| CRM for Metal Fabricators | 0 | metal fabrication software | 250 | 1 |
| | | fabrication estimating software | 200 | 0 |
| (machine shops) | 0 | machine shop software | 150 | 1 |
| | | machine shop management software | 150 | n/a |
| CRM for Electronics Manufacturers | 0 | electronics manufacturing software | 200 | 0 |
| CRM for Chemical Manufacturers | 0 | chemical manufacturing software | 350 | 0 |
| CRM for Textile Manufacturers | 0 | textile manufacturing software | 200 | n/a |
| CRM for Automotive Suppliers | 0 | automotive supplier software | 150 | n/a |

### K.2 What to build

**Build five shop-type pages — the ones that already exist.** Keep the URLs
(`/job-shop-crm` etc.); at DR 0 with no rankings, a bulk URL change buys nothing
and risks the little crawl equity there is. Change the **title, H1, AnswerBlock,
H2 structure and every internal anchor** to the software phrasing.

`/job-shop-crm` already gets this half-right — its title is "Job shop software
for one-off RFQ work". Copy that pattern to the other four.

**Do not build electronics, automotive, chemicals or textiles pages.** Two
independent reasons, either sufficient:

1. **No product.** Electronics needs BOM ingestion, distributor price feeds and
   RFQ SLA tracking; automotive needs APQP/PPAP/IATF; chemicals needs SDS, COA,
   GHS and REACH; textiles needs seasons and linesheets. `content/features.js`
   has none of these. The research document is right that these are real
   opportunities — it also sequences them at Phase 2, 3 and 4, months 6–24.
2. **A page with no product behind it is a doorway page.** It would restate the
   core pitch with an industry noun swapped in — exactly what §11 of the master
   prompt forbids.

**When to revisit.** The moment a Phase-2 or Phase-3 feature reaches `live`,
`chemical manufacturing software` (350, **KD 0**, TP 1,000) and
`electronics manufacturing software` (200, KD 0) become genuinely attractive
pages. Both are noted in the roadmap as post-90-day candidates.

### K.3 The differentiation test each shop-type page must pass

A shop-type page ships only if it contains at least four of these, specific to
that shop type and not reusable across the other four:

- The actual RFQ volume a shop of that type handles in a week, and how many
  estimators handle it (`/job-shop-crm` already does this: "forty one-off RFQs a
  week with two estimators")
- The specific document that arrives with the RFQ — a print with a revision
  letter, a cut list, a BOM, a spec sheet
- The specific pricing failure mode — material price movement, setup versus run
  time, outside processing, minimum lot charges
- The specific thing that goes wrong at handoff to the floor
- The systems that shop type already runs, named
- A worked cost example with real units

If two of the five pages could be swapped with a find-and-replace, one of them
should not exist.

---

## L. Comparison page strategy

### L.1 The demand is small — size the programme to it

| Keyword | Vol | Note |
|---|---:|---|
| jobboss | 1,300 | Brand term, mostly navigational |
| paperless parts | 2,200 | Brand term, KD 7 |
| mrpeasy | 1,500 | Brand term |
| katana pricing | 150 | Paid ads present |
| mrpeasy pricing | 100 | |
| mrpeasy reviews | 100 | |
| jobboss pricing | 90 | |
| paperless parts pricing | 90 | |
| mrpeasy vs katana | 50 | |
| jobboss alternative | 40 | |
| mrpeasy alternative | 40 | |
| katana alternative | 40 | |
| paperless parts alternative | 20 | |
| hubspot manufacturing | 10 | |

Total non-brand comparison demand: **under 500 searches a month**. A programme
of eighteen `/vs/*` pages, as the master prompt sketches, would be eighteen thin
pages chasing 20 searches each. **Four to six pages, chosen on evidence.**

### L.2 The pages, and the evidence for each

| Page | Build? | Evidence |
|---|---|---|
| `/vs/paperless-parts` | **Build — P1** | Paperless Parts is the incumbent that actually appears in our target SERPs: #2 for `quoting software for manufacturing`, #2 for `manufacturing estimating software`, and the parent topic of both. 2,200 brand searches. If a shop is comparing quoting tools, this is the comparison |
| `/vs/mrpeasy` | Keep | MRPeasy holds position 1 across the whole manufacturing-CRM head cluster. 1,500 brand searches |
| `/vs/jobboss` | Keep | 1,300 brand searches, and the research doc flags "CRM capability minimal-to-absent" and "dated UI" — the clearest honest contrast we have |
| `/vs/zoho-crm-for-manufacturing` | Deprioritise | No recorded demand for the comparison. Keep only if sales asks for a page to send prospects |
| vs Salesforce | **No** | `salesforce manufacturing cloud` is 300/mo and its buyer is a $50M+ manufacturer with a CRM admin team. Not our ICP |
| vs HubSpot | **No** | `hubspot manufacturing` is 10/mo |
| vs Katana / Fulcrum / E2 / Global Shop | **Not yet** | 40–150/mo each. Revisit when the site has authority to spend on low-yield pages |
| vs NetSuite / Dynamics / Odoo / Infor / SAP | **No** | ERP buyers, not CRM buyers, and we have no named ERP connector to discuss |

### L.3 The evidence rule for every comparison page

The research document states its competitor strengths, weaknesses and prices are
"secondhand", drawn from vendor marketing and third-party reviews, and that
"every price cited here should be reconfirmed directly with the vendor". That
caution is binding on this site.

Every `/vs/*` page and `/best-crm-for-manufacturing` must carry:

- A visible **"Checked on [date]"** line at the top
- A **source list** with live links for every competitor claim
- Prices marked as **published list prices** with the URL they came from and the
  date, never as "what you will pay"
- Feature comparisons stated as **what the vendor's own documentation says**,
  not as our assessment
- No adjective the source does not support. "JobBOSS² does not include a
  customer portal" is a fact if their docs say so. "JobBOSS² is outdated" is not
- A dated review cadence — quarterly at minimum, and re-checked before any
  quarter in which the page is linked from an ad

`/best-crm-for-manufacturing` already describes itself as "a self-published
ranking", which is the right disclosure. Extend it with the checked-on date and
source list.

---

## N. Programmatic SEO opportunities

### N.1 The honest answer: not yet, with one exception

The master prompt lists five templates. Against this dataset four of them fail
the demand test before they fail anything else.

| Template | Verdict |
|---|---|
| `/crm-for-[industry]/` | **Reject.** Every instance has zero recorded demand. This is the template most likely to produce a doorway-page penalty |
| `/[feature]-for-[industry]/` | **Reject.** Multiplies two low-demand axes into a grid of near-empty pages |
| `/manufacturing-crm-vs-[competitor]/` | **Reject as programmatic.** Total demand under 500/mo across all competitors, and every genuinely useful comparison needs hand-researched, dated evidence — the opposite of a template |
| `/[erp]-crm-integration/` | **Hold.** This is the one template that would work — `quickbooks crm integration` alone is 450/mo at KD 2 with TP 1,800, and each ERP name carries its own branded demand. **But there is no packaged connector for any named ERP** — only a bespoke Enterprise add-on. Build the template the quarter the first named ERP connector ships |
| `/manufacturing/[use-case]/` | **Reject.** No use-case keyword in the pull clears 90/mo |

### N.2 The one live opportunity: integration pages as commercial pages

26 connector pages already exist and are already generated from
`content/integrations.js` — this is programmatic SEO that is already built. The
opportunity is not more pages, it is **making the existing ones commercial**.

`/integrations/quickbooks` currently reads as a connector reference. The keyword
it should own, `quickbooks crm integration`, has KD 2 and traffic potential
1,800 — the best ratio in the entire pull. Rebuilt as a full commercial page it
is a top-three P0 item. `07-page-briefs.md` brief #4 specifies it.

Apply the same treatment, in order of demand, to `/integrations/zoho-books`,
`/integrations/myob` and `/integrations/tally`.

### N.3 Quality gates if a template is ever approved

No programmatic page ships unless it has, per page: a distinct primary keyword
with ≥90/mo recorded volume; a unique 40–60 word `AnswerBlock`; unique title and
meta description; at least three facts true only of that instance (what syncs
each way, what does not sync, the actual field mapping, the known limitation);
unique FAQs; and at least three contextual internal links. If a batch cannot
clear that bar, the batch does not ship — consolidate into one comparison table
on the hub instead.

---

## O. Internal linking strategy

### O.1 The shape

Hub and spoke, four levels, with the pillar pages as the only nodes that link
laterally.

```
Level 0   /  (homepage)
             │  brand, positioning, conversion — links down to all four pillars
             ▼
Level 1   PILLARS
          /manufacturing-crm ──────── /manufacturing-quoting-software
                  │                              │
                  │        /quote-to-cash ───────┤
                  │                              │
                  │        /integrations ────────┘
                  ▼
Level 2   SOLUTION SPOKES
          /job-shop-crm  /machine-shop-crm  /fabrication-crm
          /contract-manufacturing-crm  /engineer-to-order-software
          /rfq-management-software  /quote-management-software
          /distributor-management-software
                  ▼
Level 3   FEATURE + INTEGRATION PAGES
          /features/*   /integrations/*
                  ▼
Level 4   EDITORIAL
          /blog/*  /glossary/*  /free-tool/rfq-analyzer
          (links UP into pillars and spokes, never sideways into other posts)
```

`RelatedLinks` is already a required component on every page
(`SPEC-CONTRACT.md` §3, minimum three links), so the mechanism exists. What is
missing is a defined direction.

### O.2 Per-page link contract

| Page | Parent (links up to) | Children (links down to) | Related (lateral) |
|---|---|---|---|
| `/manufacturing-crm` | `/` | the 5 shop-type pages, `/features`, `/pricing` | `/manufacturing-quoting-software`, `/quote-to-cash`, `/best-crm-for-manufacturing` |
| `/manufacturing-quoting-software` | `/manufacturing-crm` | `/features/manufacturing-cpq`, `/features/quote-editor`, `/features/margin-guardrails` | `/rfq-management-software`, `/quote-to-cash`, `/free-tool/rfq-analyzer` |
| `/rfq-management-software` | `/manufacturing-quoting-software` | `/features/rfq-management`, `/features/multi-item-rfq`, `/features/technical-pre-sales` | `/glossary/rfq`, `/free-tool/rfq-analyzer`, `/job-shop-crm` |
| `/quote-to-cash` | `/manufacturing-crm` | `/features/orders-v1`, `/features/invoice-editor`, `/features/po-ocr` | `/quote-management-software`, `/product` |
| `/job-shop-crm` | `/manufacturing-crm` | `/features/rfq-management`, `/features/quote-editor` | `/machine-shop-crm`, `/manufacturing-quoting-software`, `/pricing` |
| `/machine-shop-crm` | `/manufacturing-crm` | `/features/quote-editor`, `/features/manufacturing-cpq` | `/job-shop-crm`, `/fabrication-crm` |
| `/fabrication-crm` | `/manufacturing-crm` | `/features/drawing-revision-management`, `/features/material-tracking` | `/machine-shop-crm`, `/manufacturing-quoting-software` |
| `/engineer-to-order-software` | `/manufacturing-crm` | `/features/manufacturing-cpq`, `/features/drawing-revision-management` | `/quote-to-cash`, `/contract-manufacturing-crm` |
| `/integrations/quickbooks` | `/integrations` | — | `/quote-to-cash`, `/features/invoice-editor`, `/pricing` |
| `/features/dealer-channel-partners` | `/distributor-management-software` | `/features/dealer-360`, `/features/dealer-exclusivity` | `/features/territory-management` |
| `/best-crm-for-manufacturing` | `/manufacturing-crm` | `/vs/paperless-parts`, `/vs/mrpeasy`, `/vs/jobboss` | `/pricing` |
| `/vs/paperless-parts` | `/best-crm-for-manufacturing` | — | `/manufacturing-quoting-software`, `/pricing` |
| `/blog/erp-vs-crm-manufacturing` | `/blog` | — | `/manufacturing-crm`, `/integrations`, `/quote-to-cash` |
| `/glossary/rfq` | `/blog` *(no `/glossary` index route exists — `/glossary` 302s to `/glossary/rfq`)* | — | `/rfq-management-software`, `/free-tool/rfq-analyzer` |

### O.3 Anchor text

Descriptive, varied, and never the exact primary keyword twice on the same page.
A workable rotation for the pillar:

- "manufacturing CRM" — once, in the first body section
- "how the RFQ-to-Order workflow runs end to end" → `/quote-to-cash`
- "quoting software built for shop estimating" → `/manufacturing-quoting-software`
- "if you run a job shop" → `/job-shop-crm`
- "what syncs with QuickBooks, and what does not" → `/integrations/quickbooks`
- "the eight tools we compared" → `/best-crm-for-manufacturing`

Approved contextual anchors, to be used naturally rather than stuffed:
manufacturing CRM · RFQ management · manufacturing quoting · cost buildup ·
quote revisions · order handoff · quote-to-cash · channel partner management ·
territory management · QuickBooks sync.

**Explicitly not approved as anchors:** "BOM-aware quoting", "manufacturing
CPQ" used as a claim rather than a feature name, "ERP integration",
"installed-base management" — the first two overstate a `building` feature and
the last two describe capabilities that do not exist.

### O.4 Orphan risk

Run this check before every deploy:

1. **Every indexable route reachable in ≤3 clicks from `/`.** The 45 feature
   pages and 26 integration pages are reachable only via `/features` and
   `/integrations`. That is two clicks — acceptable, but it means both hubs are
   critical link nodes and must not be paginated or JS-gated.
2. **Every indexable route has ≥1 inbound contextual link from outside its own
   hub.** The four promoted feature pages in §J must be linked from their
   cluster pillar, not only from `/features`.
3. **No indexable page links to a `planned` (noindex) feature page from a
   `RelatedLinks` block.** Passing link equity to a noindex page wastes it, and
   sends buyers to something that does not exist.
4. **The two merged URLs 301 cleanly** and no internal link still points at
   `/quote-to-order` or `/custom-manufacturing-crm` after the merge.

A short script over the `app/` tree can assert all four at build time; that
belongs alongside `scripts/gen-seo-files.mjs`.
