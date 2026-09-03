<!-- SYNCED COPY. Source of truth: docs/seo/07-page-briefs.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 07 — The 20 highest-priority page briefs

Section V. Each brief is buildable as-is against the components in
`SPEC-CONTRACT.md` §4. Every page follows the locked page contract: `PageHero`
→ `AnswerBlock` (40–60 words, in the first 100 after the H1) → body `Section`s →
`FaqAccordion` (5–7 visible questions, **never** `FAQPage` schema) →
`RelatedLinks` (≥3) → `CtaBand` → `JsonLd`.

Word counts are the minimum useful depth for the SERP, not a target. Where a
page can satisfy the query in 900 words, it should.

---

## Brief 1 — `/manufacturing-crm` · **NEW · P0 · score 79**

| | |
|---|---|
| **Primary keyword** | `manufacturing crm` — 1,100/mo, KD 6, TP 900 |
| **Secondary** | crm for manufacturing (700) · sales management software for manufacturers (500) · manufacturing crm software (350) · crm for manufacturing industry (300) · crm for manufacturing companies (200) · crm software for manufacturing (100) |
| **Absorbed, no own URL** | crm for manufacturers · crm manufacturing software · industrial crm · production crm · crm manufacturing |
| **Supporting entities** | RFQ · request for quote · quote revision · cost buildup · order handoff · estimator · job shop · contract manufacturer · QuickBooks · ERP · MRP · shop floor |
| **Intent** | Solution-aware, commercial investigation |
| **Funnel** | MOFU |
| **Word count** | 1,400–1,600 |
| **Conversion goal** | See a Live Quote Draft (`/demo`); secondary Start Free Trial |

**SEO title** (55) — `Manufacturing CRM for job shops and small manufacturers`

**Meta description** (160) — `A manufacturing CRM built around the RFQ, not the lead. Capture every request for quote, price it, revise it and hand the won order to the floor. From $39/user.`

**H1** — `Manufacturing CRM built around the RFQ, not the lead`

**H2 structure**
1. What a manufacturing CRM has to do that a generalist CRM does not
2. The RFQ-to-Order workflow, end to end
3. What KanchanFlow does today, and what is still building
4. Manufacturing CRM vs manufacturing ERP: which one you need first
5. Who this is for — and who it is not for
6. What it costs, and what is not gated
7. How long it takes to get running
8. FAQ

**Content requirements**
- The `AnswerBlock` must name KanchanFlow, the category ("RFQ-to-Order CRM") and
  one distinguishing fact — the strongest available is unlimited revision
  history and unlimited RFQ line items on every tier including Starter.
- Section 1 is the page's reason to exist: a generalist CRM models a *lead* that
  becomes an *opportunity*. A shop's unit of work is an **RFQ with parts on it**
  — often forty a week, each with a drawing, a revision letter, a quantity break
  and a customer who will re-quote it twice. Name that mismatch concretely.
- Section 3 must use the real status split from `content/features.js`: 18 live,
  20 building, 9 planned. Link to `/whats-shipping`. This is the E-E-A-T asset;
  do not soften it.
- Section 4 states the anti-position in full: not an ERP, MRP, CAD, BOM or
  advanced CPQ system.
- Section 5 must include a genuine "not for you if" list — over ~500 employees,
  needs shop-floor scheduling, needs a constraint-solving configurator.
- **Do not** claim ERP integration anywhere on this page. `content/integrations.js`
  has none.

**Internal links in** — `/` (first section, anchor: *manufacturing CRM*) ·
`/best-crm-for-manufacturing` · all five shop-type pages · `/features` ·
`/blog/erp-vs-crm-manufacturing`

**Internal links out** — `/job-shop-crm` (*if you run a job shop*) ·
`/machine-shop-crm` · `/fabrication-crm` · `/manufacturing-quoting-software`
(*how quoting actually works*) · `/quote-to-cash` (*the full workflow, stage by
stage*) · `/pricing` · `/whats-shipping` (*what is shipping today*)

**Schema** — `BreadcrumbList` + `SoftwareApplication` (with `offers` from
`content/pricing.js`). No `FAQPage`.

---

## Brief 2 — `/` · **RETARGET · P0 · score 84**

| | |
|---|---|
| **Primary keyword** | *(brand)* `kanchanflow` + positioning term `rfq to order crm` |
| **Secondary** | Hands `manufacturing crm` to Brief 1 |
| **Intent** | Navigational + transactional |
| **Funnel** | All stages |
| **Word count** | No change to length; changes are to the title and first section |
| **Conversion goal** | See a Live Quote Draft |

**SEO title** (48) — `KanchanFlow — the RFQ-to-Order CRM for job shops`

*(Current title, "Manufacturing CRM for RFQ-to-Order Quoting · KanchanFlow", is
competing with the new pillar for the head term.)*

**Meta description** (157) — `The RFQ-to-Order CRM for US job shops and contract manufacturers. Every RFQ captured, priced and revised in one record, then handed to the floor as an order.`

**H1** — unchanged: `The RFQ-to-Order CRM built for job shops and contract manufacturers` (locked in `content/brand.js`)

**What changes**
- Title only. The H1 and sub are locked.
- Add a link to `/manufacturing-crm` in the first body section with the anchor
  *manufacturing CRM*, so the pillar inherits homepage equity from day one.
- Keep "manufacturing CRM" in body prose; remove it from the title so the two
  pages stop competing.

**Schema** — unchanged: `SoftwareApplication` here, `Organization` and
`WebSite` from the layout.

---

## Brief 3 — `/manufacturing-quoting-software` · **EXPAND · P0 · score 87**

| | |
|---|---|
| **Primary keyword** | `quoting software for manufacturing` — 400/mo, KD 0, TP 1,100, CPC $14 |
| **Secondary** | manufacturing estimating software (300, KD 1, TP 1,200) · manufacturing quoting software (200, KD 0) · machine shop estimating (100) · part estimating software (100) · cnc quoting software (100) · job shop quoting software (90) · sheet metal quoting software (70) |
| **Supporting entities** | cost buildup · setup time · run time · material cost · outside processing · quantity break · margin · Rev letter · estimator · Paperless Parts · SecturaFAB · MTI Systems |
| **Intent** | Product-aware, commercial |
| **Funnel** | BOFU |
| **Word count** | 1,500–1,700 (up from current, to carry the estimating block) |
| **Conversion goal** | See a Live Quote Draft; secondary Start Free Trial |

**SEO title** (49) — `Quoting and estimating software for manufacturing`

**Meta description** (156) — `Quoting software for shops that estimate every job: four-column cost buildup, quantity breaks, margin guardrails and a revision chain that is never trimmed.`

**H1** — `Quoting software for shops that estimate every job`

**H2 structure**
1. Why quoting out of a spreadsheet stops working at about forty RFQs a week
2. Estimating: the four-column cost buildup *(**new block** — this is what wins `manufacturing estimating software`)*
3. Quantity breaks and alternates
4. Margin guardrails
5. Revisions: Rev 0 to Rev 12, never trimmed
6. What the customer sees — the share link
7. Live today vs in development
8. How this compares to a dedicated quoting tool
9. FAQ

**Content requirements**
- **Section 2 is the reason this brief is P0.** `manufacturing estimating
  software` and `quoting software for manufacturing` share the parent topic
  *paperless parts* — Ahrefs is saying one page serves both. Add a full
  estimating block: what goes in each of the four columns, how setup versus run
  time is handled, how material is priced, where outside processing sits.
- A worked example with real numbers: one part, one material, six operations,
  an outside plater, a sixty-day validity.
- Section 7 must repeat the honest split already in `content/features.js`: the
  quote editor, attachments, share links, multi-currency with locked FX,
  unlimited revisions and e-signed acceptance are **live**; the four-column
  buildup, quantity breaks, alternates, structured BOM roll-up, margin
  guardrails and the approval engine are **building**, about 30% complete,
  targeted at Wave 1 Milestone 4.
- Section 8 links to `/vs/paperless-parts` and is honest about what a dedicated
  quoting tool does better.
- **Do not** use "BOM-aware quoting" as a headline claim. The anti-position
  disclaims BOM systems and the roll-up is `building` and Professional-tier only.

**SERP evidence to design against** — SecturaFAB ranks #8 at **DR 7** with one
backlink; MTI Systems #6 at DR 17; worksbuddy.ai #10 at DR 12. Ranking pages
carry UR 4–10. This SERP is winnable on page quality alone.

**Internal links in** — `/manufacturing-crm` · `/job-shop-crm` ·
`/machine-shop-crm` · `/fabrication-crm` · `/free-tool/rfq-analyzer`

**Internal links out** — `/features/manufacturing-cpq` (*the estimating engine*)
· `/features/quote-editor` · `/features/margin-guardrails` ·
`/rfq-management-software` · `/quote-to-cash` · `/vs/paperless-parts` · `/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 4 — `/integrations/quickbooks` · **REBUILD · P0 · score 83**

| | |
|---|---|
| **Primary keyword** | `quickbooks crm integration` — 450/mo, **KD 2**, **TP 1,800** |
| **Secondary** | quickbooks crm (900, KD 2) · quickbooks manufacturing (300) |
| **Supporting entities** | QuickBooks Online · QuickBooks Enterprise · Intuit · invoice · customer record · sales tax · estimate · two-way sync |
| **Intent** | Product-aware, commercial, branded |
| **Funnel** | BOFU |
| **Word count** | 1,200–1,400 (up from connector-reference length) |
| **Conversion goal** | Start Free Trial |

**Why this is P0.** Best traffic-potential-to-difficulty ratio in the entire
pull: TP 1,800 at KD 2. The integration is **live** in
`content/integrations.js`, so every claim is checkable. The page currently reads
as a connector reference; the search wants a decision page.

**SEO title** (44) — `QuickBooks CRM integration for manufacturers`

**Meta description** (156) — `Two-way QuickBooks Online and Enterprise sync for manufacturers: customers, quotes, invoices and sales tax. What syncs, what does not, and how to set it up.`

**H1** — `QuickBooks CRM integration for manufacturers`

**H2 structure**
1. What syncs, in which direction — a `DataTable`, field by field
2. What does not sync, and why
3. Setting it up — the actual steps and how long each takes
4. QuickBooks Online vs Enterprise: what differs
5. Sales tax handling
6. Known limitations
7. Troubleshooting the three failures people actually hit
8. FAQ

**Content requirements**
- Section 1 is the whole page. A field-level table beats prose here: *Customer →
  synced both ways · Quote → pushed to QuickBooks as an Estimate · Invoice →
  pulled · Payment status → pulled* — sourced verbatim from
  `content/integrations.js`, never invented.
- Section 2 must be real. A page that claims everything syncs is not credible to
  anyone who has done an accounting integration.
- Do not compare to Method CRM or any QuickBooks-native CRM without a dated,
  linked source.

**Internal links in** — `/integrations` (promote to the top of the hub) ·
`/quote-to-cash` · `/features/invoice-editor` · `/pricing`

**Internal links out** — `/features/invoice-editor` · `/quote-to-cash` ·
`/pricing` · `/integrations` (breadcrumb)

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 5 — `/job-shop-crm` · **RETARGET · P0 · score 83**

| | |
|---|---|
| **Primary keyword** | `job shop software` — 350/mo, CPC $6 |
| **Secondary** | job shop manufacturing software (150, KD 1, **CPC $50 — highest in the dataset**) · job shop management software (150) · job shop quoting software (90) |
| **Do not target** | `job shop crm` — no recorded search data |
| **Supporting entities** | one-off part · print · Rev letter · traveller · estimator · setup time · lot charge · repeat order · E2 Shop System · JobBOSS · Global Shop Solutions |
| **Intent** | Solution-aware, commercial |
| **Funnel** | MOFU |
| **Word count** | 1,200–1,500 |
| **Conversion goal** | Start Free Trial |

**SEO title** (42) — `Job shop software for quoting one-off work`

*(Close to the current title — this page is already the best-aimed of the five
shop-type pages. The work is in the body and the anchors.)*

**Meta description** (152) — `Job shop software for a shop quoting forty one-off RFQs a week with two estimators: triage, similar-part cost history and a response clock on every RFQ.`

**H1** — `Job shop software built around the RFQ queue`

**H2 structure**
1. Forty RFQs a week, two estimators, one inbox
2. Triage: which RFQs are worth quoting
3. Similar-part cost history
4. The response clock
5. Repeat work and the re-quote
6. Handing a won job to the floor — and where we stop
7. What a job shop ERP does that we do not
8. FAQ

**Content requirements**
- The URL stays `/job-shop-crm`. At DR 0 with no rankings, a slug change buys
  nothing and costs the crawl equity there is. The **title, H1, `AnswerBlock`,
  H2s and every internal anchor** move to "job shop software".
- Every internal link to this page must use a software-phrasing anchor. Search
  the tree for `job shop CRM` as anchor text and replace it.
- Section 7 names E2 Shop System, JobBOSS and Global Shop Solutions and says
  plainly what they do that we do not — scheduling, job costing, traveller
  printing, capacity. That honesty is the page's differentiator, and it is what
  the `job shop manufacturing software` searcher is actually weighing.
- Must pass the differentiation test in `03-architecture.md` §K.3: this page's
  facts must not be swappable with `/machine-shop-crm`.

**Internal links in** — `/manufacturing-crm` (*if you run a job shop*) ·
`/rfq-management-software` · `/manufacturing-quoting-software` ·
`/best-crm-for-manufacturing`

**Internal links out** — `/rfq-management-software` · `/manufacturing-quoting-software`
· `/features/rfq-management` · `/machine-shop-crm` · `/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 6 — `/rfq-management-software` · **TIGHTEN · P0 · score 78**

| | |
|---|---|
| **Primary keyword** | `rfq management software` — 250/mo, KD 2, CPC $19 |
| **Secondary** | rfq software (300, KD 3, **CPC $20**) · request for quote software (200, CPC $12) · rfq management (100) · rfq process (300) |
| **Supporting entities** | RFQ · RFP · RFI · bid · quote · buyer · email intake · web form · marketplace · response time |
| **Intent** | Product-aware, commercial |
| **Funnel** | BOFU |
| **Word count** | 1,200–1,400 |
| **Conversion goal** | Try the RFQ Analyzer; secondary Start Free Trial |

**SEO title** (41) — `RFQ management software for manufacturers`

**Meta description** (159) — `RFQ software that captures every request for quote from email, WhatsApp, your web form and marketplaces, routes it to the right estimator and clocks the reply.`

**H1** — `RFQ management software that catches every request`

**H2 structure**
1. Where RFQs get lost
2. Intake: email, web form, WhatsApp, marketplaces
3. Multi-part RFQs — one header, many line items
4. Routing to the right estimator
5. The response clock, and what the benchmark data says
6. From RFQ to quote
7. RFQ, RFP and RFI — which one you have *(short; links to `/glossary/rfq`)*
8. FAQ

**Content requirements**
- The RFQ management feature is `building` in `content/features.js`. The status
  badge is mandatory and belongs in the meta description too.
- Section 5 links the original benchmark at `/blog/rfq-response-time-benchmark`
  — first-party data is the strongest asset this page has.
- Section 7 is a summary only. The full `rfq vs rfp` treatment lives at
  `/glossary/rfq` (Brief 18); do not duplicate it here or the two will compete.

**Internal links in** — `/manufacturing-quoting-software` · `/job-shop-crm` ·
`/glossary/rfq` · `/free-tool/rfq-analyzer`

**Internal links out** — `/features/rfq-management` · `/features/multi-item-rfq`
· `/features/technical-pre-sales` · `/glossary/rfq` · `/free-tool/rfq-analyzer`
· `/manufacturing-quoting-software`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 7 — `/fabrication-crm` · **RETARGET · P0 · score 78**

| | |
|---|---|
| **Primary keyword** | `metal fabrication software` — 250/mo, KD 1, TP 300, CPC $8 |
| **Secondary** | fabrication estimating software (200, KD 0, CPC $12) · sheet metal fabrication software (100) · sheet metal quoting software (70) · welding shop software (90, CPC $20) · fabrication quoting software (30, CPC $19) |
| **Do not target** | `crm for metal fabricators` — no recorded search data |
| **Supporting entities** | cut list · nesting · laser · press brake · weldment · gauge · drop · secondary operation · powder coat · SecturaFAB |
| **Intent** | Solution-aware, commercial |
| **Funnel** | MOFU |
| **Word count** | 1,200–1,400 |
| **Conversion goal** | Start Free Trial |

**SEO title** (47) — `Metal fabrication software for quoting and RFQs`

**Meta description** (158) — `Software for fab shops quoting cut lists, weldments and secondary operations: material and drop costing, outside finishing, and a quote the customer can open.`

**H1** — `Metal fabrication software for the quoting side of the shop`

**H2 structure**
1. What arrives with a fab RFQ — the cut list, the weldment print, the finish spec
2. Costing material when the price moved last week
3. Secondary operations and outside finishing
4. Quoting a weldment versus quoting a part
5. What we do not do — nesting and machine programming
6. Fabrication estimating, step by step
7. FAQ

**Content requirements**
- Section 5 is essential and must be prominent. Fab shops evaluating software
  expect nesting; we do not do it. Saying so early is what makes the rest
  credible.
- Section 3 is the differentiator against `/machine-shop-crm`: outside finishing
  is a fab-shop cost line in a way it is not for a machine shop.
- Every number is fab-specific. Gauge, not "material". Drop, not "waste".

**Internal links in** — `/manufacturing-crm` · `/manufacturing-quoting-software`
· `/machine-shop-crm`

**Internal links out** — `/manufacturing-quoting-software` ·
`/features/drawing-revision-management` · `/features/material-tracking` ·
`/machine-shop-crm` · `/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 8 — `/machine-shop-crm` · **RETARGET · P1 · score 77**

| | |
|---|---|
| **Primary keyword** | `machine shop software` — 150/mo, KD 1, TP 600, CPC $14 |
| **Secondary** | machine shop management software (150) · machine shop estimating (100) · machine shop quoting software (70) · cnc quoting software (100, CPC $10) · machining quoting software (50) |
| **Do not target** | `machine shop crm` — no recorded search data |
| **Supporting entities** | CNC · setup time · cycle time · tooling · fixture · tolerance · GD&T · first article · ProShop ERP · Paperless Parts |
| **Intent** | Solution-aware, commercial |
| **Funnel** | MOFU |
| **Word count** | 1,200–1,400 |
| **Conversion goal** | Start Free Trial |

**SEO title** (42) — `Machine shop software for quoting CNC work` 

**Meta description** (158) — `Machine shop software for the quoting side: setup versus cycle time, tooling and fixture cost, quantity breaks, and a revision trail on every print you price.`

**H1** — `Machine shop software for the quoting side of the shop`

**H2 structure**
1. Setup time versus cycle time, and why quoting gets it wrong
2. Tooling and fixture cost on a first-time part
3. Quantity breaks that reflect real setup amortisation
4. Pricing against a print revision
5. First-article and inspection as a quote line
6. What a machine shop ERP does that we do not
7. FAQ

**Content requirements**
- Parent topic for `machine shop software` is **ProShop ERP** — the searcher is
  shortlisting shop ERPs. Section 6 must therefore be substantial and honest,
  not a throwaway.
- Section 1 is the differentiator against `/job-shop-crm` and `/fabrication-crm`:
  the setup/cycle split is the machinist's specific quoting problem.

**Internal links in** — `/manufacturing-crm` · `/manufacturing-quoting-software`
· `/job-shop-crm` · `/fabrication-crm`

**Internal links out** — `/manufacturing-quoting-software` ·
`/features/manufacturing-cpq` · `/features/quote-editor` · `/job-shop-crm` ·
`/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 9 — `/features/manufacturing-cpq` · **PROMOTE · P1 · score 73**

| | |
|---|---|
| **Primary keyword** | `manufacturing cpq software` — 300/mo, KD 5 |
| **Secondary** | cpq software for manufacturing (350, KD 7, **CPC $18**) · cpq for manufacturing (150, KD 1, CPC $15) · manufacturing cpq (100, KD 1) |
| **Never target** | `cpq software` — 2,400/mo, KD 35, and on the `content/brand.js` reject list |
| **Blocking issue** | The reject list currently reads `["cpq software", ...]`. The four keywords above are different keywords with a different parent topic (`cpq software for manufacturing`). **Resolve before building** — see `08-conflicts.md` §C1 |
| **Intent** | Product-aware, commercial |
| **Funnel** | BOFU |
| **Word count** | 1,400–1,600 (current page is close) |
| **Conversion goal** | See a Live Quote Draft |

**SEO title** (56) — `Manufacturing CPQ Lite: cost buildup, not a configurator`

**Meta description** (155) — `CPQ Lite for shops pricing machined parts: four-column cost buildup, quantity breaks, alternates and margin guardrails. In development, about 30% complete.`

**H1** — `Manufacturing CPQ, deliberately scoped to five things`

**Content requirements**
- The existing page copy is the best on the site — it states plainly what is live
  and what is building, and why "CPQ Lite" is not marketing. Keep it.
- **Add the status to the meta description.** A `building` feature ranking for a
  commercial keyword must declare itself in the SERP snippet, not only on the
  page.
- Keep the explicit non-comparison to Salesforce CPQ, PROS and Conga. It is the
  most trust-building paragraph on the site.

**Internal links in** — `/manufacturing-quoting-software` ·
`/machine-shop-crm` · `/engineer-to-order-software` · `/features`

**Internal links out** — `/manufacturing-quoting-software` ·
`/features/margin-guardrails` · `/features/contract-price-lists` ·
`/whats-shipping` · `/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 10 — `/features/dealer-channel-partners` · **PROMOTE · P1 · score 75**

| | |
|---|---|
| **Primary keyword** | `channel management software` — 800/mo, **KD 0**, TP 400 |
| **Secondary** | channel partner management software · distributor management software (150) · distributor crm (30, CPC $16) |
| **Feature status** | **LIVE** — the highest-demand, lowest-difficulty keyword backed by a shipped feature |
| **Intent** | Solution-aware, commercial |
| **Funnel** | MOFU |
| **Word count** | 1,100–1,300 |
| **Conversion goal** | Start Free Trial |

**SEO title** (44) — `Channel partner management for manufacturers`

**Meta description** (158) — `Manage dealers and distributors next to your direct accounts: partner records, agreed pricing, and a portal where dealers order and track dispatch themselves.`

**H1** — `Channel partner management for manufacturers who sell through dealers`

**H2 structure**
1. Selling direct and through channel at the same time
2. Who owns the customer — the conflict that costs deals
3. Partner records and agreed dealer pricing
4. What a dealer sees in the portal — orders, dispatch, invoices, balance
5. What is live now and what is building *(dealer 360 and exclusivity are `building`)*
6. FAQ

**Content requirements**
- Note the research finding honestly: channel management is standard in
  enterprise suites and largely absent in the mid-market. That is the market
  argument, and it is sourced from the research document rather than invented.
- Section 5 must separate the LIVE feature from `dealer-360` and
  `dealer-exclusivity`, both `building`.
- **Two capability limits are stated in `content/features.js` and must appear on
  the page.** There is no deal registration and no MDF workflow — the catalogue
  says so verbatim, and deal registration belongs to `dealer-exclusivity`
  (`building`, Wave 1 M5). The dealer portal shows **orders, dispatch status,
  invoices and outstanding balance — not quotes**.
- **The portal is not on every tier.** Starter gets 25 basic dealer records with
  no hierarchy and no portal; the portal is Professional and Enterprise. Do not
  write "live on every tier" on this page.

**Internal links in** — `/distributor-management-software` · `/features` ·
`/manufacturing-crm`

**Internal links out** — `/distributor-management-software` ·
`/features/dealer-360` · `/features/dealer-exclusivity` ·
`/features/territory-management` · `/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 11 — `/vs/paperless-parts` · **NEW · P1 · score 72**

| | |
|---|---|
| **Primary keyword** | `paperless parts alternative` — 20/mo |
| **Secondary** | paperless parts (2,200, KD 7, branded) · paperless parts pricing (90, CPC $8) |
| **Why build it despite 20/mo** | Paperless Parts is the page we are actually competing with. It ranks **#2** for `quoting software for manufacturing` and **#2** for `manufacturing estimating software`, and it is the **parent topic** of both — Ahrefs is saying it defines the category. Anyone shortlisting quoting software will search this |
| **Intent** | Comparison, commercial |
| **Funnel** | BOFU |
| **Word count** | 1,100–1,400 |
| **Conversion goal** | Pricing, then Start Free Trial |

**SEO title** (52) — `KanchanFlow vs Paperless Parts: an honest comparison`

**Meta description** (156) — `A dated, sourced comparison of KanchanFlow and Paperless Parts for job shops: what each does, where each is stronger, and which shops should pick which one.`

**H1** — `KanchanFlow vs Paperless Parts`

**H2 structure**
1. Checked on [date] — what this comparison is and is not
2. The short answer: which shops should pick which
3. Side-by-side, feature by feature
4. Where Paperless Parts is stronger
5. Where we are stronger
6. Pricing, as published
7. Sources
8. FAQ

**Content requirements — the evidence rule is binding here**
- Section 1 states plainly that this is desk research from public sources, not
  hands-on testing, and gives the check date.
- **Section 4 must be real and must come first among the two.** Paperless Parts
  is a mature, funded, category-defining quoting product with a large customer
  base and years of geometry-analysis work. A comparison page whose "where they
  are stronger" section is a token paragraph is not credible and will not
  convert an informed estimator.
- No pricing claim without the URL it came from and the date. The research
  document lists Paperless Parts pricing as custom; if no list price is
  published, say so rather than estimating.
- No adjective the source does not support.
- Never emit `Review` or `AggregateRating` (guardrail 2).
- Re-verify quarterly; the checked-on date is a maintained field, not a
  publication date.

**Internal links in** — `/best-crm-for-manufacturing` ·
`/manufacturing-quoting-software`

**Internal links out** — `/manufacturing-quoting-software` · `/pricing` ·
`/best-crm-for-manufacturing`

**Schema** — `BreadcrumbList` + `Article` with `dateModified` = the check date.
Not `ItemList` — a two-way comparison is not a list.

---

## Brief 12 — `/pricing` · **STRENGTHEN · P1 · score 76**

| | |
|---|---|
| **Primary keyword** | *(brand)* `kanchanflow pricing` |
| **Secondary** | manufacturing crm pricing *(no recorded volume — do not force it into the title)* |
| **Intent** | Transactional |
| **Funnel** | BOFU |
| **Word count** | No change |
| **Conversion goal** | Start Free Trial |

**SEO title** (46) — `Pricing — three tiers, per user, no seat traps` *(unchanged)*

**What changes**
1. **Add `offers` to the `SoftwareApplication` schema**, sourced from
   `content/pricing.js` so it cannot drift: $39 / $49 / $99 per user per month,
   USD, 3-user minimum, 14-day trial.
2. **Add an implementation-time section.** `crm implementation` is 2,000/mo and
   too generic to target as a page, but implementation time is the number-one
   objection in this category — the research document cites 6–18 months for
   enterprise suites repeatedly. State the real KanchanFlow number.
3. Keep the anti-position banner. Guardrail: never cap revision history or RFQ
   line items in pricing copy.

**Internal links in** — every commercial page

**Internal links out** — `/tier-comparison` · `/add-ons` · `/demo` · `/trust`

**Schema** — `BreadcrumbList` + `SoftwareApplication` **with `offers`**

---

## Brief 13 — `/engineer-to-order-software` · **ABSORB + KEEP · P1 · score 70**

| | |
|---|---|
| **Primary keyword** | `engineer to order software` — 200/mo, KD 0, CPC $20 |
| **Secondary** | configure to order software (50, KD 0) · contract manufacturing software (90) |
| **Do not target** | `custom manufacturing software` (600/mo) — parent topic is *manufacturing software development services*; the searcher wants a dev agency |
| **Merge in** | `/custom-manufacturing-crm` → 301 here |
| **Intent** | Solution-aware, commercial |
| **Funnel** | MOFU |
| **Word count** | 1,100–1,300 |
| **Conversion goal** | See a Live Quote Draft |

**SEO title** (47) — `Engineer-to-order software for custom equipment`

**Meta description** (154) — `Engineer-to-order software for work that must be designed before it can be priced: scoped estimates, revisions and engineering hours as a quote line item.`

**H1** — `Engineer-to-order software for work that gets designed before it gets priced`

**H2 structure**
1. Quoting something nobody has built yet
2. Engineering hours as a quote line
3. Scope changes and the revision chain
4. Configure-to-order versus engineer-to-order
5. Where a real configurator is the right answer instead
6. FAQ

**Content requirements**
- Traffic potential on the primary is only **40** — this page will never be a
  traffic driver. It earns its place on a $20 CPC and on being the honest home
  for ETO buyers arriving from elsewhere. Scope the effort accordingly.
- Section 5 is the anti-position applied to this buyer: if you need a constraint
  solver across thousands of valid option permutations, buy a real CPQ.
- Absorb the genuinely ETO-specific material from `/custom-manufacturing-crm`
  before the 301 goes in.

**Internal links in** — `/manufacturing-crm` · `/quote-to-cash` ·
`/contract-manufacturing-crm` · *(301 from `/custom-manufacturing-crm`)*

**Internal links out** — `/features/manufacturing-cpq` ·
`/features/drawing-revision-management` · `/quote-to-cash` · `/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 14 — `/best-crm-for-manufacturing` · **RE-VERIFY · P1 · score 69**

| | |
|---|---|
| **Primary keyword** | `best crm for manufacturing` — 250/mo, KD 3, TP 800 |
| **Secondary** | best crm software for manufacturing (90) · manufacturing crm alternatives |
| **Cannibalisation watch** | Shares parent topic `crm for manufacturing` with `/manufacturing-crm`. Keep both only while the SERP stays mixed listicle-and-product-page. If the pillar starts ranking for `best crm for manufacturing`, consolidate |
| **Intent** | Comparison |
| **Funnel** | MOFU |
| **Word count** | 1,600–2,000 |
| **Conversion goal** | Pricing |

**SEO title** (44) — `Best CRM for manufacturing: 8 tools compared` *(unchanged)*

**What changes**
1. **Add a visible "Checked on [date]" line** at the top.
2. **Add a sources block** with a live link for every claim about every tool.
   The research document's own methodology note requires this: its competitor
   strengths, weaknesses and prices are secondhand and its prices are
   marketing-page estimates.
3. **Re-verify all eight tools** before republishing. Prices in the research
   document are directional only.
4. Keep the existing self-published-ranking disclosure — it is the right
   disclosure and most listicles do not make it.
5. Add a "how we chose" methodology section: what was compared, what was not,
   and that no tool was trialled hands-on unless it was.
6. Where a competitor's SERP-visible strength is real, say so. A comparison in
   which we win every row converts nobody.

**Internal links in** — `/manufacturing-crm` · `/`

**Internal links out** — `/vs/paperless-parts` · `/vs/mrpeasy` · `/vs/jobboss` ·
`/manufacturing-crm` · `/pricing`

**Schema** — `BreadcrumbList` + `ItemList` *(already implemented)*. No
`FAQPage`, no `Review`, no `AggregateRating`.

---

## Brief 15 — `/vs/jobboss` · **RE-VERIFY · P1 · score 69**

| | |
|---|---|
| **Primary keyword** | `jobboss alternative` — 40/mo |
| **Secondary** | jobboss (1,300, branded) · jobboss pricing (90, CPC $8) |
| **Intent** | Comparison, commercial, branded |
| **Funnel** | BOFU |
| **Word count** | 1,000–1,300 |
| **Conversion goal** | Pricing, then Start Free Trial |

**SEO title** (44) — `KanchanFlow vs JobBOSS: what each one covers`

**Meta description** (155) — `A dated, sourced comparison of KanchanFlow and JobBOSS² for job shops: JobBOSS² runs the shop floor, we run the quoting side. Which one you need, and when.`

**H1** — `KanchanFlow vs JobBOSS²`

**Content requirements**
- The honest frame is **complementary, not competing**: JobBOSS² is a shop ERP
  with job costing and scheduling; KanchanFlow is the quoting and customer side.
  A shop may reasonably run both. Saying that converts better than a false
  head-to-head, and it is what the anti-position already commits us to.
- The research document attributes "CRM capability minimal-to-absent" and a
  "dated UI" to JobBOSS² from third-party review synthesis. **Cite the source
  and date it, or do not say it.** An unsourced "dated" is exactly the
  unsupported competitor claim the guardrails forbid.
- Pricing: the research document lists ~$3,000/yr as an indicative figure and
  explicitly warns it should be reconfirmed. Either link a published source or
  omit the number.
- Checked-on date, sources block, quarterly re-verification.

**Internal links in** — `/best-crm-for-manufacturing` · `/job-shop-crm`

**Internal links out** — `/job-shop-crm` · `/manufacturing-quoting-software` ·
`/pricing`

**Schema** — `BreadcrumbList` + `Article` with `dateModified`

---

## Brief 16 — `/contract-manufacturing-crm` · **RETARGET · P1 · score 68**

| | |
|---|---|
| **Primary keyword** | `contract manufacturing software` — 90/mo, CPC $15 |
| **Do not target** | `contract manufacturing crm` — zero volume |
| **Intent** | Solution-aware, commercial |
| **Funnel** | MOFU |
| **Word count** | 1,000–1,200 |
| **Conversion goal** | Start Free Trial |

**SEO title** (49) — `Contract manufacturing software for customer work`

**Meta description** (154) — `Software for contract manufacturers on repeat customer programmes: quote and order history per part number. Contract price lists are still in development.`

**H1** — `Contract manufacturing software for repeat customer programmes`

**H2 structure**
1. The contract manufacturer's problem is repeat work, not one-off RFQs
2. Contract and customer price lists *(feature is `building` — badge it)*
3. Repeat and blanket business: raising an order with no quote behind it
4. Quote history per customer, per part number
5. Where the ERP takes over
6. FAQ

**Content requirements**
- The differentiation from `/job-shop-crm` is the whole page: a job shop quotes
  forty new things a week; a contract manufacturer runs the same forty part
  numbers for three customers for four years. If this page reads like the job
  shop page, it fails the doorway test.
- **Do not claim release orders against a blanket.** No blanket-order or
  release-order feature exists. What `orders-v1` (live) supports is creating an
  order manually for repeat or blanket business where no quote was raised — and
  its own FAQ notes you lose the link back to an accepted revision. Say that.
- The `contract-price-lists` status (`building`, Wave 1 M4, not available on
  Starter) goes in the meta description, not only in the body.
- Low volume, high CPC — write it once, write it well, then leave it alone.

**Internal links in** — `/manufacturing-crm` · `/engineer-to-order-software`

**Internal links out** — `/features/contract-price-lists` ·
`/features/customer-360` · `/quote-to-cash` · `/pricing`

**Schema** — `BreadcrumbList` + `SoftwareApplication`

---

## Brief 17 — `/quote-to-cash` · **ABSORB + STRENGTHEN · P2 · score 65**

| | |
|---|---|
| **Primary keyword** | `quote to cash` — 1,100/mo, KD 8, TP 1,200 |
| **Secondary** | quote to cash software (450) · quote to order (100, merged in) |
| **Merge in** | `/quote-to-order` → 301 here |
| **Intent** | Informational at the top, commercial at the bottom |
| **Funnel** | TOFU → MOFU |
| **Word count** | 1,500–1,800 |
| **Conversion goal** | See a Live Quote Draft |

**SEO title** (47) — `Quote to cash for manufacturers, stage by stage` *(unchanged)*

**What changes**
- Absorb `/quote-to-order` as an H2, "Quote to order: the handoff in the middle".
- 301 the old URL and sweep internal links.
- This is one of only two pages on the site with genuine informational volume.
  It should be the best explanation of the manufacturing quote-to-cash cycle on
  the web, and it should carry a diagram of the ten stages.
- Keep the product pitch below the fold. The searcher wants the concept; the
  conversion comes from being the page that explained it.

**Internal links in** — `/manufacturing-crm` · `/product` · `/integrations/quickbooks`
· *(301 from `/quote-to-order`)*

**Internal links out** — `/features/orders-v1` · `/features/invoice-editor` ·
`/features/po-ocr` · `/manufacturing-quoting-software` · `/integrations/quickbooks`

**Schema** — `BreadcrumbList` + `Article` *(informational intent — not
`SoftwareApplication`)*

---

## Brief 18 — `/glossary/rfq` · **EXPAND · P3 by score, P1 editorially · score 54**

| | |
|---|---|
| **Primary keyword** | `rfq vs rfp` — 1,300/mo |
| **Secondary** | rfq process (300) · rfq management (100) · rfq meaning |
| **Why the score understates it** | The 25% business-intent weight penalises informational pages. This is the highest-volume term the site can honestly own, and it feeds the RFQ cluster |
| **Intent** | Informational |
| **Funnel** | TOFU |
| **Word count** | 900–1,200 |
| **Conversion goal** | Try the RFQ Analyzer |

**SEO title** (41) — `RFQ vs RFP vs RFI: what each one asks for`

**Meta description** (158) — `An RFQ asks for a price on a defined scope. An RFP asks how you would solve it. An RFI asks who you are. What each contains, and what a shop should send back.`

**H1** — `RFQ vs RFP vs RFI`

**H2 structure**
1. The one-line difference
2. What an RFQ contains — and what a good one contains
3. What an RFP contains
4. What an RFI contains
5. A side-by-side table
6. What a manufacturer should send back to each
7. The RFQ process, step by step
8. When a buyer sends the wrong one

**Content requirements**
- The SERP is dominated by procurement and government-contracting content. The
  differentiator is writing it from the **supplier's** side — what a shop
  receives and what it should send back. Nobody in the top ten does that.
- A real example of each document's contents.
- Keep it tight. This query wants a clear answer and a table, not 2,000 words.
- Ends by linking to `/rfq-management-software` and `/free-tool/rfq-analyzer`.

**Internal links in** — `/rfq-management-software` · `/blog` · `/blog/rfq-response-time-benchmark`
*(there is no `/glossary` index route — `/glossary` 302s to `/glossary/rfq` in `next.config.mjs`)*

**Internal links out** — `/rfq-management-software` · `/free-tool/rfq-analyzer` ·
`/manufacturing-quoting-software`

**Schema** — `BreadcrumbList` + `Article`. **Not** `DefinedTerm` unless a real
glossary index exists to attach it to.

---

## Brief 19 — `/blog/erp-vs-crm-manufacturing` · **NEW · P3 by score, P1 editorially · score 53**

| | |
|---|---|
| **Primary keyword** | `crm vs erp` — 900/mo, KD 12, **TP 1,700** |
| **Secondary** | erp vs crm (2,600, KD 13) · difference between crm and erp (150, TP 1,500) · crm and erp (350) · crm erp (600) |
| **Intent** | Informational |
| **Funnel** | TOFU |
| **Word count** | 1,300–1,600 |
| **Conversion goal** | Read `/manufacturing-crm`; secondary Try the RFQ Analyzer |

**SEO title** (51) — `ERP vs CRM for manufacturers: which one comes first`

**Meta description** (158) — `An ERP runs the shop. A CRM runs the customer side. Which a manufacturer needs first depends on where work is being lost — here is how to tell, with examples.`

**H1** — `ERP vs CRM for manufacturers: which one do you need first?`

**H2 structure**
1. The one-line difference
2. What an ERP does in a manufacturing business
3. What a CRM does in a manufacturing business
4. Where they overlap, and where the overlap causes trouble
5. How to tell which one you need first
6. The case for buying neither yet
7. What "integrated" actually means, and what it usually means in practice
8. Why we are a CRM and not an ERP

**Content requirements**
- `erp vs crm` at 2,600/mo has TP 250 — a dead end. `crm vs erp` at 900/mo has
  **TP 1,700**. Target the second phrasing; both resolve to the same parent
  topic so one page serves both.
- Section 5 is the useful part and the reason to write it: a decision test based
  on where work is actually being lost. Quotes going out late and getting lost
  → CRM. Jobs late on the floor and inventory wrong → ERP.
- Section 6 must be genuine. Many 15-person shops should fix their quote
  template before buying anything.
- **Section 7 must not claim we integrate with ERPs.** We do not.
  `content/integrations.js` has 26 connectors and no named ERP among them. Say what we sync
  with — QuickBooks, Zoho Books, Tally, MyOB — and say it is accounting, not ERP.
- Section 8 restates the anti-position.

**Internal links in** — `/manufacturing-crm` · `/blog` · `/integrations`

**Internal links out** — `/manufacturing-crm` · `/integrations/quickbooks` ·
`/quote-to-cash`

**Schema** — `BreadcrumbList` + `Article` with a named author

---

## Brief 20 — `/free-tool/rfq-analyzer` · **PROMOTE · P2 · score 65**

| | |
|---|---|
| **Primary keyword** | *(none — this is a link asset, not a ranking page)* |
| **Strategic role** | The only natural link magnet on the site, and the source of the first-party data the E-E-A-T strategy depends on |
| **Intent** | Tool use |
| **Funnel** | TOFU → MOFU |
| **Conversion goal** | Tool completion, then Start Free Trial |

**SEO title** (35) — `Free RFQ Analyzer for manufacturers`

**Meta description** (156) — `Paste an RFQ and see what it is missing before you quote it: scope gaps, absent tolerances, no quantity break, no revision letter. Free, no signup required.`

**H1** — `Free RFQ Analyzer`

**What changes**
1. **Remove any gate on the result.** A gated free tool earns no links. Gate the
   *saved report* or the emailed PDF if a gate is needed at all.
2. **Add an embeddable output** — a small result card with an attribution link,
   so anyone writing about RFQ quality can embed it.
3. **Add a methodology section** — what the analyzer checks and why each check
   matters. This is what makes it citable rather than a gimmick.
4. **Feed the benchmark.** Anonymised, aggregated analyzer inputs become the
   sample for the annual RFQ Response Time Benchmark. Say so, plainly, with the
   opt-out — and only if the privacy policy already permits it.
5. Link it prominently from `/rfq-management-software`, `/job-shop-crm` and
   `/glossary/rfq`.

**Internal links in** — `/` (secondary CTA, already) · `/rfq-management-software`
· `/job-shop-crm` · `/glossary/rfq` · `/blog/rfq-response-time-benchmark`

**Internal links out** — `/rfq-management-software` ·
`/manufacturing-quoting-software` · `/blog/rfq-response-time-benchmark`

**Schema** — `BreadcrumbList` + `WebApplication` *(a subtype of
`SoftwareApplication`, and accurate here)*

---

## Cross-brief QA checklist

Run before any of the twenty ships. A page failing any row does not publish.

| # | Check |
|---:|---|
| 1 | **Search intent** — does the page answer the query the SERP shows people asking? |
| 2 | **One primary keyword**, and it appears in exactly one brief |
| 3 | **No cannibalisation** — no other indexable page shares this parent topic |
| 4 | **Originality** — at least one thing here that no competitor page contains |
| 5 | **Product relevance** — every capability named exists, with the right status badge |
| 6 | **Accuracy** — every claim traceable to `content/*.js` or a dated external source |
| 7 | **Manufacturing literacy** — real units, real documents, real failure modes; no generic SaaS example |
| 8 | **A "not for you if" section** exists and is honest |
| 9 | **Conversion** — one clear next action |
| 10 | **Internal links** — ≥3 contextual, parent + children + related per `03-architecture.md` §O.2 |
| 11 | **Technical** — canonical, title ≤ ~60 chars, description 150–160, one `<h1>`, correct schema |
| 12 | **No `FAQPage`, no `Review`, no `AggregateRating`** |
| 13 | **Reads like a person wrote it** — every paragraph carries a fact, a number, a mechanism or a limit |
| 14 | **`AnswerBlock`** is 40–60 words, names the entity and the category, and every claim in it is supported later on the page |
