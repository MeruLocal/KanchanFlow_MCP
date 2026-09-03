<!-- SYNCED COPY. Source of truth: docs/seo/06-roadmap.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 06 — Prioritisation, roadmap and KPIs

Content prioritisation scoring, sections S (90-day publishing roadmap) and
T (SEO KPI dashboard).

---

## Scoring model

Each page scored 1–100 on six factors, weighted per the master prompt:

| Factor | Weight | How it was scored |
|---|---:|---|
| Search demand | 20% | Combined volume and traffic potential of the keywords the page would own |
| Business intent | 25% | Funnel stage and CPC. A $50 CPC keyword scores near 100; an informational term near 30 |
| Product relevance | 20% | Feature status in `content/features.js`. `live` scores 85–100, `building` 55–70, absent 10 |
| Ranking feasibility | 15% | Ahrefs KD plus the observed DR/UR of pages actually ranking |
| Competitive weakness | 10% | Whether incumbents are weak, stale, or absent from the SERP |
| Strategic importance | 10% | Position in the cluster architecture and in the positioning |

**Note on informational pages.** The 25% business-intent weight structurally
penalises editorial. That is correct for deciding which *commercial* page to
build next, and wrong for deciding which *article* to write next. Editorial
priority is set separately in `04-editorial.md` §M.3 and should not be compared
against these scores.

## Scores and classification

| Page | Demand | Intent | Product | Feasibility | Comp. weak | Strategic | **Score** | Tier |
|---|---:|---:|---:|---:|---:|---:|---:|:--|
| `/manufacturing-quoting-software` | 80 | 92 | 80 | 90 | 85 | 95 | **87** | P0 |
| `/` | 60 | 95 | 95 | 95 | 50 | 100 | **84** | P0 |
| `/integrations/quickbooks` | 75 | 90 | 95 | 90 | 55 | 75 | **83** | P0 |
| `/job-shop-crm` | 70 | 88 | 85 | 88 | 75 | 90 | **83** | P0 |
| `/manufacturing-crm` **(new)** | 85 | 70 | 85 | 75 | 60 | 100 | **79** | P0 |
| `/fabrication-crm` | 58 | 85 | 82 | 90 | 80 | 72 | **78** | P0 |
| `/rfq-management-software` | 62 | 90 | 70 | 88 | 70 | 88 | **78** | P0 |
| `/machine-shop-crm` | 55 | 85 | 85 | 88 | 75 | 75 | **77** | P1 |
| `/pricing` | 30 | 98 | 95 | 90 | 40 | 90 | **76** | P1 |
| `/features/dealer-channel-partners` | 72 | 70 | 90 | 92 | 60 | 55 | **75** | P1 |
| `/features/manufacturing-cpq` | 65 | 92 | 60 | 80 | 60 | 70 | **73** | P1 |
| `/vs/paperless-parts` **(new)** | 25 | 95 | 80 | 85 | 65 | 80 | **72** | P1 |
| `/engineer-to-order-software` | 40 | 88 | 70 | 92 | 65 | 60 | **70** | P1 |
| `/vs/jobboss` | 22 | 92 | 80 | 85 | 70 | 62 | **69** | P1 |
| `/best-crm-for-manufacturing` | 50 | 78 | 70 | 78 | 55 | 80 | **69** | P1 |
| `/contract-manufacturing-crm` | 28 | 85 | 82 | 85 | 60 | 55 | **68** | P1 |
| `/vs/mrpeasy` | 22 | 92 | 78 | 85 | 55 | 60 | **67** | P2 |
| `/features/territory-management` | 55 | 88 | 55 | 78 | 55 | 45 | **66** | P2 |
| `/quote-to-cash` | 78 | 45 | 75 | 70 | 50 | 78 | **65** | P2 |
| `/features/drawing-revision-management` | 40 | 88 | 55 | 90 | 60 | 45 | **65** | P2 |
| `/free-tool/rfq-analyzer` | 20 | 60 | 85 | 85 | 70 | 95 | **65** | P2 |
| `/distributor-management-software` | 35 | 72 | 75 | 80 | 55 | 50 | **63** | P2 |
| `/quote-management-software` | 40 | 85 | 78 | 55 | 45 | 45 | **62** | P2 |
| `/whatsapp-crm-for-manufacturers` | 45 | 70 | 90 | 60 | 45 | 25 | **61** | P2 |
| `/glossary/rfq` | 75 | 30 | 55 | 65 | 50 | 55 | **54** | P3 |
| `/blog/erp-vs-crm-manufacturing` **(new)** | 82 | 35 | 40 | 60 | 45 | 60 | **53** | P3 |
| `/mobile-crm-for-shop-floor` | 15 | 60 | 85 | 60 | 40 | 30 | **51** | P3 |
| `/indiamart-crm` | 3 | 50 | 90 | 90 | 40 | 10 | **50** | P3 |
| Remaining 34 `/features/*` | — | — | — | — | — | — | **35–55** | P3 |
| Remaining 25 `/integrations/*` | — | — | — | — | — | — | **30–50** | P3 |

**Tier boundaries:** P0 ≥ 78 · P1 68–77 · P2 58–67 · P3 < 58.

---

## S. 90-day publishing roadmap

The master prompt's day-by-day sequence assumes a greenfield site. This one is
adjusted for the fact that 125 pages already exist: most of the work is
**retargeting and rebuilding**, not writing from scratch, and the technical
foundation is largely done.

### Days 1–14 — Instrument, then fix the plumbing

Nothing ranks until measurement exists. Two weeks, no new content.

| Task | Detail |
|---|---|
| GSC + Bing verified, sitemap submitted | Prerequisite for every KPI below |
| Conversion goals wired | Demo request, trial signup, RFQ Analyzer completion |
| Verify the proxy `Content-Type` fix in production | `curl -I /sitemap.xml` → `application/xml` |
| Add the two 301s | `/quote-to-order` → `/quote-to-cash`; `/custom-manufacturing-crm` → `/engineer-to-order-software` |
| Internal-link sweep | No internal link may point at a 301 source |
| Add the build-time SEO assertions | Checks 4, 6, 7, 8, 9, 13 from `05-technical.md` §P.3 |
| Update sitemap priorities | Per `05-technical.md` §P.2.1 |
| Resolve the two blocking decisions | The `cpq software` reject-list conflict and the `/indiamart-crm` positioning conflict — see `08-conflicts.md` |
| Baseline Lighthouse and CWV | On the six pages that will be P0 |

### Days 15–45 — The seven P0 pages

| Page | Work | Brief |
|---|---|---|
| `/manufacturing-crm` | **Write new.** The pillar. 1,400–1,600 words | #1 |
| `/` | **Retarget.** Title, first section, link to the new pillar | #2 |
| `/manufacturing-quoting-software` | **Expand.** Absorb `manufacturing estimating software`; add the estimating H2 block | #3 |
| `/integrations/quickbooks` | **Rebuild.** From connector reference to commercial page | #4 |
| `/job-shop-crm` | **Retarget.** Title, H1, `AnswerBlock`, H2s, anchors → `job shop software` | #5 |
| `/rfq-management-software` | **Tighten.** Already well matched; add `request for quote software` and the RFQ-process block | #6 |
| `/fabrication-crm` | **Retarget** → `metal fabrication software` + `fabrication estimating software` | #7 |

Ship them one at a time, not as a batch. Seven pages landing on the same day
gives you no signal about which change did what.

### Days 46–70 — The nine P1 pages

| Page | Work | Brief |
|---|---|---|
| `/machine-shop-crm` | Retarget → `machine shop software` | #8 |
| `/features/manufacturing-cpq` | Promote to commercial page; status badge in the meta description | #9 |
| `/features/dealer-channel-partners` | Promote → `channel management software`, KD 0, feature is live | #10 |
| `/vs/paperless-parts` | **Write new**, with the evidence rule from `03-architecture.md` §L.3 | #11 |
| `/pricing` | Add `offers` schema; add the implementation-time section | #12 |
| `/engineer-to-order-software` | Absorb the merged `/custom-manufacturing-crm` content | #13 |
| `/best-crm-for-manufacturing` | Add checked-on date and source list; re-verify all eight tools | #14 |
| `/vs/jobboss` | Same evidence treatment | #15 |
| `/contract-manufacturing-crm` | Retarget → `contract manufacturing software` | #16 |

### Days 71–90 — Depth, editorial and the first link asset

| Task | Detail | Brief |
|---|---|---|
| `/quote-to-cash` | Absorb `/quote-to-order`; strengthen as the informational pillar | #17 |
| `/glossary/rfq` | Expand to own `rfq vs rfp` (1,300/mo) | #18 |
| `/blog/erp-vs-crm-manufacturing` | Write new. `crm vs erp`, TP 1,700 | #19 |
| `/free-tool/rfq-analyzer` | Remove any result gate; add embeddable output | #20 |
| RFQ Response Time Benchmark v2 | Scale the sample, publish the methodology, make it citable | — |
| First outreach wave | Integration partner listings, two directories, three trade newsletters | — |
| Reddit presence | Disclosed, useful participation in r/Machinists and r/manufacturing | — |
| Re-pull Ahrefs | Full universe refresh; compare against the 2026-09-03 baseline | — |

### What is deliberately absent from the 90 days

- Automotive, chemicals and textiles industry pages — no product, no demand
- The compliance cluster (PPAP, APQP, IATF, SDS, GHS, COA, REACH) — PPAP is
  `planned` with no date
- The aftermarket cluster — no installed-base, service-contract or warranty
  feature exists
- ERP integration pages — no packaged connector for any named ERP exists
- Any programmatic template
- Comparison pages against Salesforce, HubSpot, Zoho, NetSuite or Dynamics

Each of these is a real market opportunity in the research document and a
fabricated claim on the site today. They enter the roadmap the quarter their
feature reaches `live`, not before.

### What would change this schedule

If the first ERP connector ships inside 90 days, drop the last two P1 items and
build `/integrations/[erp]-crm-integration` immediately.
`quickbooks crm integration` at KD 2 with TP 1,800 is the proof that named
integration pages are the best-converting, easiest-ranking template available
to this product — and the ERP names carry the branded demand that the accounting
names do not.

---

## T. SEO KPI dashboard

### T.1 The framing

At a realistic ceiling of 1,500–3,000 non-brand visits a month, **session count
is a vanity metric**. Ten demo requests from `job shop manufacturing software` —
a $50 CPC keyword — matter more than a thousand sessions from
`bill of materials`. The dashboard is built accordingly.

### T.2 Tier 1 — the four numbers that decide whether this is working

| KPI | Definition | Baseline (2026-09-03) | Day 90 | Day 180 | Day 365 |
|---|---|---:|---:|---:|---:|
| **Qualified organic sessions** | Non-brand sessions on P0/P1 pages | 0 | 120/mo | 500/mo | 1,500/mo |
| **Organic conversions** | Demo + trial + Analyzer completions from organic | 0 | 6/mo | 25/mo | 80/mo |
| **P0 keywords in top 20** | Of the 30 Tier-1 keywords in `02-keywords.md` §E.2 | 0 | 8 | 18 | 25 |
| **Referring domains** | Unique linking domains, Ahrefs | 0 | 8 | 25 | 50 |

### T.3 Tier 2 — leading indicators, reviewed weekly

| KPI | Why it matters | Target |
|---|---|---|
| GSC impressions on the 30 Tier-1 keywords | The first sign of movement, weeks before clicks | Rising every week from week 4 |
| Average position, P0 pages | Position 30 → 15 is progress even at zero clicks | −3 positions/month |
| Pages with ≥1 impression | Index coverage in practice, not in theory | 100 by day 90 |
| AI Overview citation count | 80% of our SERPs carry one; being cited is the new position 1 | ≥3 of the 30 by day 180 |
| CTR vs expected for position | Below-curve CTR means the title or description is wrong, not the ranking | Within 20% of curve |
| Indexed / submitted ratio | Index bloat or crawl problems | > 0.95 |

### T.4 Tier 3 — health, reviewed monthly

| KPI | Threshold |
|---|---|
| Core Web Vitals — LCP / INP / CLS (mobile) | < 2.0s / < 200ms / < 0.05 |
| Pages with duplicate title or description | 0 |
| Internal links pointing at 301s or noindex pages | 0 |
| Schema validation errors | 0 |
| Comparison pages older than 90 days since last verification | 0 |
| `building` feature pages ranking without a visible status badge | 0 |

### T.5 Attribution honesty

Manufacturing sales cycles run months. An organic visitor in October may become
a demo in January, and last-click will credit direct or brand search. Three
things follow:

1. Track **assisted conversions**, not just last-click.
2. Add "How did you hear about us?" to the demo form as a free-text field, and
   read it monthly. It will be more accurate than the analytics.
3. Do not judge the programme before **day 180**. At DR 0 in a category where
   the ranking pages have single-digit backlink counts, nothing moves for the
   first 8–12 weeks, and then several things move at once.

### T.6 Review cadence

- **Weekly:** GSC impressions and average position on the 30 Tier-1 keywords.
- **Monthly:** Tier 1 and Tier 3 tables. Re-pull Ahrefs for the Tier-1 set.
  Re-run SERP Overview on the six P0 keywords — SERP composition is moving
  faster than volume.
- **Quarterly:** full keyword-universe re-pull, competitor re-audit, and a
  re-read of `08-conflicts.md` to see which blocked pages have become buildable.
