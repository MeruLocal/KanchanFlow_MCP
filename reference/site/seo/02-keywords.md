<!-- SYNCED COPY. Source of truth: docs/seo/02-keywords.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 02 — Keywords

Sections E (Keyword universe), F (Ahrefs research framework), G (Keyword→URL
map), H (Topic cluster map).

All figures: Ahrefs, United States, pulled **2026-09-03**. Raw data in
`data/keyword-universe.csv`.

---

## E. Keyword universe

### E.1 How to read the classification

Each keyword carries: search intent, funnel stage, parent topic, primary page,
industry, product feature, business value, volume, KD, traffic potential, CPC,
SERP features, current competitors, content type, recommended URL, priority.
The CSV holds the metrics; the tables below hold the judgement.

Intent uses the master prompt's eight categories. In practice this dataset
collapses to four, because Ahrefs marks almost every software term
`commercial + informational` simultaneously — the SERPs are mixed
listicle-and-product-page. Where that happens the funnel stage is the more
useful field.

### E.2 Tier 1 — build a page for these

| Keyword | Vol | KD | CPC | TP | Intent | Funnel | Target URL |
|---|---:|---:|---:|---:|---|---|---|
| manufacturing crm | 1,100 | 6 | $0.50 | 900 | Solution-aware / commercial | MOFU | `/manufacturing-crm` **(new)** |
| crm for manufacturing | 700 | 6 | $0.50 | 700 | Solution-aware | MOFU | `/manufacturing-crm` |
| sales management software for manufacturers | 500 | 2 | — | 450 | Solution-aware | MOFU | `/manufacturing-crm` |
| quoting software for manufacturing | 400 | 0 | $14.00 | 1,100 | Product-aware / commercial | BOFU | `/manufacturing-quoting-software` |
| quickbooks crm integration | 450 | 2 | $0.70 | 1,800 | Product-aware / commercial | BOFU | `/integrations/quickbooks` |
| manufacturing crm software | 350 | 3 | $13.00 | 700 | Commercial investigation | MOFU | `/manufacturing-crm` |
| cpq software for manufacturing | 350 | 7 | $18.00 | 450 | Product-aware | BOFU | `/features/manufacturing-cpq` |
| job shop software | 350 | n/a | $6.00 | n/a | Solution-aware | MOFU | `/job-shop-crm` |
| sales territory management software | 350 | 6 | $15.00 | 200 | Product-aware | BOFU | `/features/territory-management` |
| manufacturing estimating software | 300 | 1 | $4.50 | 1,200 | Product-aware | BOFU | `/manufacturing-quoting-software` |
| crm for manufacturing industry | 300 | 2 | $0.50 | 1,100 | Solution-aware | MOFU | `/manufacturing-crm` |
| manufacturing cpq software | 300 | 5 | $0.80 | 450 | Product-aware | BOFU | `/features/manufacturing-cpq` |
| rfq software | 300 | 3 | $20.00 | 250 | Product-aware | BOFU | `/rfq-management-software` |
| metal fabrication software | 250 | 1 | $8.00 | 300 | Solution-aware | MOFU | `/fabrication-crm` |
| rfq management software | 250 | 2 | $19.00 | 150 | Product-aware | BOFU | `/rfq-management-software` |
| best crm for manufacturing | 250 | 3 | $8.00 | 800 | Comparison | MOFU | `/best-crm-for-manufacturing` |
| engineer to order software | 200 | 0 | $20.00 | 40 | Solution-aware | MOFU | `/engineer-to-order-software` |
| manufacturing quoting software | 200 | 0 | $10.00 | 250 | Product-aware | BOFU | `/manufacturing-quoting-software` |
| fabrication estimating software | 200 | 0 | $12.00 | 200 | Product-aware | BOFU | `/fabrication-crm` |
| manufacturing document management | 200 | 1 | $18.00 | 300 | Solution-aware | MOFU | `/features/drawing-revision-management` |
| distributor management software | 150 | n/a | $0.70 | n/a | Solution-aware | MOFU | `/distributor-management-software` |
| job shop manufacturing software | 150 | 1 | **$50.00** | 600 | Solution-aware | MOFU | `/job-shop-crm` |
| machine shop software | 150 | 1 | $14.00 | 600 | Solution-aware | MOFU | `/machine-shop-crm` |
| cpq for manufacturing | 150 | 1 | $15.00 | 250 | Product-aware | BOFU | `/features/manufacturing-cpq` |
| quote to cash | 1,100 | 8 | $9.00 | 1,200 | Informational | TOFU | `/quote-to-cash` |
| quote to cash software | 450 | n/a | $0.30 | n/a | Commercial | MOFU | `/quote-to-cash` |
| erp vs crm | 2,600 | 13 | $1.30 | 250 | Informational | TOFU | `/blog/erp-vs-crm-manufacturing` **(new)** |
| crm vs erp | 900 | 12 | $1.30 | 1,700 | Informational | TOFU | `/blog/erp-vs-crm-manufacturing` |
| channel management software | 800 | 0 | $0.60 | 400 | Solution-aware | MOFU | `/features/dealer-channel-partners` |
| rfq vs rfp | 1,300 | n/a | $0.07 | n/a | Informational | TOFU | `/glossary/rfq` |

### E.3 Tier 2 — support a page, do not get their own

`crm for manufacturing companies` (200), `crm for manufacturers` (150),
`crm software for manufacturing` (100), `industrial crm` (60), `production crm`
(50), `crm manufacturing software` (150) — all parent topic `manufacturing crm`
or `crm for manufacturing`. **They belong on `/manufacturing-crm` as H2s and
body copy, never as their own URLs.**

`machine shop management software` (150), `machine shop estimating` (100),
`part estimating software` (100), `cnc quoting software` (100), `machining
quoting software` (50), `machine shop quoting software` (70) — support
`/machine-shop-crm` and `/manufacturing-quoting-software`.

`job shop management software` (150), `job shop quoting software` (90) —
support `/job-shop-crm`.

`sheet metal fabrication software` (100), `sheet metal quoting software` (70),
`fabrication quoting software` (30), `welding shop software` (90) — support
`/fabrication-crm`.

`request for quote software` (200), `rfq management` (100), `rfq process` (300)
— support `/rfq-management-software` and the glossary.

`territory management software` (150), `distributor crm` (30) — support the
existing feature and product pages.

`quickbooks crm` (900), `quickbooks manufacturing` (300) — support
`/integrations/quickbooks`. Note `quickbooks crm` is a strong secondary but its
SERP is dominated by QuickBooks' own ecosystem; treat it as upside, not target.

### E.4 Tier 3 — no page, ever

**Zero recorded search demand in Ahrefs US.** Twenty-three keywords the master
prompt asks for return no data at all:

`job shop crm` · `crm for job shops` · `machine shop crm` ·
`crm for machinery manufacturers` · `crm for industrial equipment manufacturers` ·
`crm for metal fabricators` · `crm for engineer to order manufacturers` ·
`crm for custom equipment manufacturers` · `crm for electronics manufacturers` ·
`crm for ems companies` · `electronics manufacturing crm` ·
`crm for automotive suppliers` · `crm for textile manufacturers` ·
`custom manufacturing crm` · `contract manufacturing crm` · `manufacturing erp crm` ·
`erp agnostic crm` · `crm with erp integration` · `manufacturing rfq software` ·
`what is a manufacturing crm` · `benefits of crm in manufacturing` ·
`manufacturing sales forecasting` · `estimating software for machine shops`

This is the finding that most changes the master prompt. The entire
"Industry Landing Page Cluster" (§5) and most of the "Core pages" list (§3) are
built on phrasings nobody searches. The pages themselves can be justified for
navigation and conversion — but not on keyword grounds, and their titles, H1s
and internal anchors must use the `[thing] software` phrasing that has demand.

**Wrong intent — do not target even though volume exists:**

| Keyword | Vol | Why not |
|---|---:|---|
| custom manufacturing software | 600 | Parent topic is *manufacturing software development services*. Searchers want a dev agency |
| automotive crm | 2,600 | Car dealership CRM, not Tier 1/2 suppliers |
| ems software | 600 | Ambiguous with emergency medical services dispatch |
| shop floor management software | 800 | Production tracking and scheduling — directly contradicts the anti-position |
| mrp software | 3,200 | KD 47, and we are explicitly not an MRP |
| cpq software | 2,400 | KD 35, and already on the `content/brand.js` reject list |
| crm software | 544,000 | Out of reach and wrong buyer |
| field service management software | 3,100 | No field-service product exists |
| warranty management software | 500 | No warranty feature exists |
| bill of materials | 6,900 | Editorial only — never as a product claim (see anti-position) |

**Blocked by product truth** — real demand, no capability. Listed in full in
`08-conflicts.md`: `ppap software` (150), `apqp software` (350),
`iatf 16949 software` (150), `sds management software` (300),
`reach compliance software` (200), `installed base management` (100),
`service contract management software` (100), `manufacturing customer portal`
(100), plus every ERP-integration term.

---

## F. Ahrefs keyword research framework

Reusable method, so the next pull is comparable to this one.

### F.1 The pull

1. **Seed by job, not by category.** Seed lists that start with "CRM for X"
   returned nothing. Seed with what the shop calls the problem: *quote*,
   *estimate*, *RFQ*, *job shop*, *machine shop*, *fabrication*, *shop floor*.
2. **Keywords Explorer → Overview** in batches. Pull
   `keyword, volume, cpc, global_volume, intents, serp_features` first — these
   are reliable. Pull `difficulty, traffic_potential, parent_topic` in a
   **separate, smaller batch**: the Ahrefs API returns 500s on those columns for
   some keywords, and a poisoned column fails the whole request.
3. **Parent topic is the cannibalisation test.** Two keywords sharing a parent
   topic share a page. This single field settled most of the architecture in
   `03-architecture.md`.
4. **Traffic Potential over Volume.** `crm software for manufacturing` has 100
   searches but TP 1,300, because the page that wins it wins the whole cluster.
   `engineer to order software` has 200 searches and TP 40 — a dead end.
5. **SERP Overview on every keyword you plan a page for.** Read the **URL
   Rating and backlink count of the ranking pages**, not the Domain Rating of
   the ranking domains. That is where the DR 7 discovery came from.
6. **Competitor Site Explorer → Top Pages, then Organic Keywords on the single
   best page.** Pulling `mrpeasy.com/manufacturing-crm/`'s keyword list is what
   proved the head cluster is one page.

### F.2 Standing filters

- Country: US only (Wave 1 is USA-only by `SPEC-CONTRACT.md` §1).
- Minimum volume to consider a dedicated page: **90/mo**, unless CPC > $10 or
  the keyword is a competitor brand.
- Maximum KD for a P0 page at DR 0: **10**.
- Reject any keyword whose parent topic names a competitor brand *unless* the
  page is deliberately a comparison page.

### F.3 Re-pull cadence

Monthly for the 30 Tier-1 keywords; quarterly for the full universe. Re-run the
SERP Overviews on the six P0 keywords monthly — AI Overview presence and SERP
composition are moving faster than volume is.

---

## G. Keyword → URL map

The cannibalisation register. **One primary keyword, one canonical URL.** No
page ships without a row here.

### G.1 Existing routes — verdicts

| URL | Status | Primary keyword | Vol | Verdict |
|---|---|---|---:|---|
| `/` | Live | *(brand)* + `rfq to order crm` | — | **Retarget.** Hand `manufacturing crm` to the new pillar; homepage does brand, positioning and conversion |
| `/manufacturing-crm` | **Missing** | `manufacturing crm` | 1,100 | **Build. P0.** Highest-value gap on the site |
| `/manufacturing-quoting-software` | Live | `quoting software for manufacturing` | 400 | **Keep, expand.** Absorb `manufacturing estimating software` (shared parent topic) |
| `/rfq-management-software` | Live | `rfq management software` | 250 | **Keep.** Well matched already |
| `/integrations/quickbooks` | Live | `quickbooks crm integration` | 450 | **Rebuild as a commercial page. P0.** Best TP/KD ratio in the dataset |
| `/job-shop-crm` | Live | `job shop software` | 350 | **Keep URL, retarget copy and anchors** |
| `/machine-shop-crm` | Live | `machine shop software` | 150 | **Keep URL, retarget** |
| `/fabrication-crm` | Live | `metal fabrication software` | 250 | **Keep URL, retarget** |
| `/contract-manufacturing-crm` | Live | `contract manufacturing software` | 90 | **Keep, deprioritise.** CPC $15 justifies it |
| `/custom-manufacturing-crm` | Live | — | 0 | **Merge → `/engineer-to-order-software`, 301.** Its only volume term has dev-agency intent |
| `/engineer-to-order-software` | Live | `engineer to order software` | 200 | **Keep.** Low ceiling (TP 40) but exact-match and KD 0 |
| `/quote-to-cash` | Live | `quote to cash` | 1,100 | **Keep.** Informational pillar |
| `/quote-to-order` | Live | `quote to order` | 100 | **Keep.** Corrected 2026-09-03: Ahrefs gives `quote to order` its own parent topic (`quote to order`), not `quote to cash software`. By the §F.1 rule that only shared parent topics share a page, this is not cannibalisation |
| `/quote-management-software` | Live | `quote management software` | 200 | **Keep, deprioritise.** Distinct parent topic; KD 14 |
| `/distributor-management-software` | Live | `distributor management software` | 150 | **Keep** |
| `/best-crm-for-manufacturing` | Live | `best crm for manufacturing` | 250 | **Keep — with a watch.** Shares parent topic with the pillar; if the pillar starts ranking for both, consolidate |
| `/vs/mrpeasy` | Live | `mrpeasy alternative` | 40 | **Keep** |
| `/vs/jobboss` | Live | `jobboss alternative` | 40 | **Keep** |
| `/vs/zoho-crm-for-manufacturing` | Live | — | 0 | **Deprioritise.** No recorded demand; keep only if sales asks for it |
| `/vs/paperless-parts` | **Missing** | `paperless parts alternative` | 20 | **Build. P1.** Paperless Parts is the actual SERP incumbent for our best keywords |
| `/features/manufacturing-cpq` | Live | `manufacturing cpq software` | 300 | **Keep, promote to P1.** Conflicts with the brand.js reject list — see `08-conflicts.md` |
| `/features/dealer-channel-partners` | Live | `channel management software` | 800 | **Promote.** KD 0, feature is LIVE |
| `/features/territory-management` | Live | `sales territory management software` | 350 | **Keep.** Feature is `building` — status badge mandatory |
| `/features/drawing-revision-management` | Live | `manufacturing document management` | 200 | **Keep.** CPC $18 |
| `/mobile-crm-for-shop-floor` | Live | — | 0 | **Deprioritise.** `mobile crm` (900) is too broad and wrong buyer |
| `/whatsapp-crm-for-manufacturers` | Live | `whatsapp crm` | 500 | **Keep, flag.** US volume exists but the term skews India — conflicts with USA-only positioning |
| `/indiamart-crm` | Live | `indiamart crm` | 0 | **Noindex or retire.** Zero US volume; direct conflict with the USA-only lock |
| `/blog/erp-vs-crm-manufacturing` | **Missing** | `crm vs erp` | 900 | **Build. P1.** TP 1,700, purely informational, no product claim needed |
| `/glossary/rfq` | Live | `rfq vs rfp` | 1,300 | **Expand.** Biggest informational term we can honestly own |
| `/free-tool/rfq-analyzer` | Live | *(linkable asset)* | — | **Keep, promote.** The only natural link magnet on the site |
| Remaining 34 `/features/*` | Live | long tail | <90 | **Keep indexable, exclude from priority.** Catalogue and conversion pages, not traffic pages |
| Remaining 25 `/integrations/*` | Live | long tail | <90 | **Keep.** Reorder the hub by US relevance |
| `/product` `/pricing` `/demo` `/about` `/trust` `/contact` `/changelog` `/roadmap` `/whats-shipping` `/tier-comparison` `/add-ons` `/ai-credits` `/whatsapp-billing` `/partners/*` `/legal/*` | Live | brand / none | — | **Keep.** Conversion, trust and entity pages. Do not keyword-target |
| 9 `planned` feature pages | Live, noindex | — | — | **Correct as-is.** Keep out of the sitemap until they ship |

### G.2 Net change

- **3 new pages**: `/manufacturing-crm`, `/vs/paperless-parts`,
  `/blog/erp-vs-crm-manufacturing`
- **1 merge**: `/custom-manufacturing-crm` → `/engineer-to-order-software`
  (its distinctive tiered-bidding content moved across; the rest duplicated the
  ETO page section for section). No redirect: nothing is indexed and the sitemap
  was never submitted, so the route was simply removed
- **1 noindex or retire**: `/indiamart-crm`
- **6 retargets**: homepage, the four shop-type ICP pages, `/integrations/quickbooks`
- **Net route count**: 125 → 127. Two static routes added
  (`/manufacturing-crm`, `/vs/paperless-parts`), one removed
  (`/custom-manufacturing-crm`), one blog post added. **Sitemap now emits 114
  indexable URLs**, up from 113: three added, one removed, one
  (`/indiamart-crm`) noindexed

That is the whole architectural change. The site does not need more pages; it
needs the right nine to be aimed correctly.

---

## H. Topic cluster map

Five clusters, not the six in the master prompt — the compliance cluster is
deleted because the product supports none of it.

### Cluster A — Manufacturing CRM *(the pillar cluster)*

**Pillar:** `/manufacturing-crm` — `manufacturing crm` (1,100, KD 6)

| Spoke | Keyword | Vol | Type |
|---|---|---:|---|
| `/best-crm-for-manufacturing` | best crm for manufacturing | 250 | Comparison listicle |
| `/job-shop-crm` | job shop software | 350 | Shop-type solution |
| `/machine-shop-crm` | machine shop software | 150 | Shop-type solution |
| `/fabrication-crm` | metal fabrication software | 250 | Shop-type solution |
| `/contract-manufacturing-crm` | contract manufacturing software | 90 | Shop-type solution |
| `/engineer-to-order-software` | engineer to order software | 200 | Motion solution |
| `/blog/erp-vs-crm-manufacturing` | crm vs erp | 900 | Editorial |
| `/pricing` | *(brand)* | — | Conversion |

**Absorbed into the pillar, no URL:** crm for manufacturing · crm for
manufacturing industry · crm for manufacturing companies · crm for manufacturers ·
crm software for manufacturing · manufacturing crm software · crm manufacturing
software · sales management software for manufacturers · industrial crm ·
production crm

### Cluster B — Quoting and estimating *(the revenue cluster)*

**Pillar:** `/manufacturing-quoting-software` — `quoting software for
manufacturing` (400, KD 0, TP 1,100)

| Spoke | Keyword | Vol | Type |
|---|---|---:|---|
| `/features/manufacturing-cpq` | manufacturing cpq software | 300 | Feature |
| `/rfq-management-software` | rfq management software | 250 | Product spoke |
| `/quote-management-software` | quote management software | 200 | Product spoke |
| `/features/quote-editor` | *(brand/long tail)* | — | Feature (LIVE) |
| `/features/margin-guardrails` | *(long tail)* | — | Feature (building) |
| `/free-tool/rfq-analyzer` | — | — | Tool / link asset |
| `/blog/rfq-response-time-benchmark` | — | — | Original research |
| `/glossary/rfq` | rfq vs rfp | 1,300 | Glossary |

**Absorbed into the pillar:** manufacturing estimating software · manufacturing
quoting software · cnc quoting software · machining quoting software · part
estimating software · machine shop estimating · sheet metal quoting software ·
job shop quoting software

### Cluster C — Quote-to-cash workflow *(the concept cluster)*

**Pillar:** `/quote-to-cash` — `quote to cash` (1,100, KD 8, TP 1,200)

Spokes: `/features/orders-v1` (LIVE) · `/features/po-ocr` (building) ·
`/features/invoice-editor` (LIVE) · `/features/approval-engine` (building) ·
`/product`. Absorbs `quote to order` and `quote to cash software`.

This cluster is informational at the top and product at the bottom — the
pillar earns the traffic, the feature pages earn the trial.

### Cluster D — Accounting and system integration

**Pillar:** `/integrations` — reordered by US relevance

| Spoke | Keyword | Vol | KD |
|---|---|---:|---:|
| `/integrations/quickbooks` | quickbooks crm integration | 450 | 2 |
| `/integrations/zoho-books` | *(long tail)* | — | — |
| `/integrations/myob` | *(long tail)* | — | — |
| `/blog/erp-vs-crm-manufacturing` | crm vs erp | 900 | 12 |

**This cluster is deliberately small and deliberately named "accounting", not
"ERP".** The master prompt's Cluster C (Manufacturing CRM ERP Integration) with
NetSuite, Epicor and ERP-agnostic pages cannot be built: there is no packaged
connector for any named ERP (only a bespoke Enterprise add-on and inbound
webhooks). When one ships, this cluster grows and
`/integrations/[erp]-crm-integration` becomes the highest-value programmatic
template on the site.

### Cluster E — Channel and field sales

**Pillar:** `/distributor-management-software` — `distributor management
software` (150)

Spokes: `/features/dealer-channel-partners` — `channel management software`
(800, **KD 0**, feature LIVE) · `/features/territory-management` —
`sales territory management software` (350, KD 6, building) ·
`/features/dealer-360` (building) · `/features/field-visits` (LIVE) ·
`/mobile-crm-for-shop-floor`.

`/features/dealer-channel-partners` is the sleeper here: 800 searches, KD 0, and
the feature is already live.

### Clusters deleted from the master prompt

- **Cluster E (Manufacturing Service / Aftermarket)** — installed base, service
  contracts, warranty, parts, aftermarket. No feature exists for any of it.
- **Cluster F (Manufacturing Compliance)** — APQP, PPAP, IATF 16949, SDS, GHS,
  COA, REACH. PPAP is `planned` with no date; the rest do not exist.

Both are correctly-identified market opportunities in the research document.
Both become content clusters the quarter *after* the features ship, not before.
