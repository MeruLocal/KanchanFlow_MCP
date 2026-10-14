<!-- SYNCED COPY. Source of truth: SPEC-CONTRACT.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# KanchanFlow — Wave 1 build contract (read this before writing any page)

This repo implements the **Manufacturing Vertical Brand Website — Implementation
Spec v1.1** and its raw research doc. Everything below is LOCKED. Do not
invent alternatives.

## 0. Non-negotiables (spec §2.5 guardrails)

1. **NEVER emit `FAQPage` schema.** FAQs are visible-only, via
   `components/site/FaqAccordion`. `lib/schema.js` deliberately has no
   `faqSchema` export. Do not add one.
2. **NEVER emit `Review` or `AggregateRating`** — no third-party review data
   exists yet.
3. **NEVER name any company other than Soor LLC** anywhere in shipped copy.
   The only company named on this site is **Soor LLC**.
4. **NEVER fabricate customer logos, testimonials, counts or case studies.**
   At launch there are zero named customers on this brand. Use the trust
   ladder (Delaware LLC / SOC 2 Type II / USA data centers / open changelog /
   public roadmap / feature-truth audit) instead.
5. **NEVER claim a certification without an audit.** ISO 27001 is "Wave 3, not
   audited". AS9100 / CMMC certification is "never — we are the CRM, not the
   certifier; we ship an immutable audit log for compliance-driven
   manufacturers."
6. **hreflang is `en-US` + `x-default` only.** Never add en-GB/en-CA/en-AU/
   en-IN/de/ja/nl. `buildMetadata()` already handles this — always use it.
7. **Never cap revision history or RFQ line items** in any pricing copy.
8. **Never gate the India regulatory features** (GST / IRN / 43B(h)) by tier.
9. Status badges must be truthful: LIVE = production today, BETA = customer
   tested, BUILDING = in dev with a visible target, PLANNED = no date.
10. Every screenshot/figure reference must be described, not faked. No stock
    "smiling worker" imagery language.

## 1. Brand + entity

- Brand name: **KanchanFlow**, domain `kanchanflow.com`
- Legal entity: **Soor LLC**, 16192 Coastal Hwy, Lewes, DE 19958, USA,
  +1-607-318-2126, founded 2026
- H1 (homepage): "The RFQ-to-Order CRM built for job shops and contract
  manufacturers"
- Sub: "Built in the USA for USA manufacturers. Delaware-registered. SOC 2
  Type II. USA data centers. Same-day support."
- Anti-position (must appear on /pricing and /about): "This is not an ERP,
  MRP, CAD, BOM, or advanced CPQ system — it manages customer RFQs, quotes,
  follow-ups, and order handoff."
- Palette: navy `#0B1F3B` (`navy-900`), safety orange `#E85B1B`
  (`forge-500`), steel blue (`steel-*`). Never the parent purple `#6344E7`.
- Market: **USA-only Wave 1**, single `.com` root, USD default. India
  regulatory features ship but are framed as "for USA manufacturers with
  India operations, India-based contract customers, or exporting to India."

All of this lives in `content/brand.js` — import it, never retype it.

**Market selector.** The navbar carries a currency selector (US, India, UK,
Australia, UAE, Singapore, New Zealand) defined in `content/countries.js`. It
changes only the currency prices are *displayed* in. It must never create a
country route, add an hreflang alternate, change the canonical, or change the
copy — Wave 1 stays a single USA-market `.com` root. USD and INR are contracted
prices; every other currency is an indicative conversion at a fixed dated
reference rate and every surface that shows one says so.

## 2. Pricing (locked, `content/pricing.js`)

| Tier | Monthly USD | Annual USD | Min users | Max users |
|---|---:|---:|:---:|:---:|
| Starter | $39/user | $32/user | 3 | 10 |
| Professional | $49/user | $41/user | 3 | 100 |
| Enterprise | $99/user | $82/user | 5 | unlimited + $2,000/mo platform fee |

14-day trial, no credit card, sample data. Annual = 17% off.

## 3. Page contract (raw spec §5.6 + §5.7, Appendix S.2.2)

Every route file must:

```js
export const dynamic = "force-static";
export const metadata = buildMetadata({ title, description, path, keywords });
```

and render, in order:

1. `<PageHero trail={...} eyebrow title lead />` — the H1
2. `<AnswerBlock>` — a **40–60 word**, self-contained, quotable prose answer
   inside the first 100 words after the H1. No lists inside it. It must name
   the entity ("KanchanFlow"), the category ("RFQ-to-Order CRM") and one
   distinguishing fact. Every claim in it must be supported later on the page.
3. Body sections using `<Section>`, `<DataTable>`, `<CheckList>`, `<FactGrid>`
4. `<FaqAccordion items={faqs} />` — 5–7 visible questions
5. `<RelatedLinks links={...} />` — at least 3 internal cross-links
6. `<CtaBand />`
7. `<JsonLd data={breadcrumbSchema(trail)} />` plus the page-appropriate
   schema (`softwareApplicationSchema`, `articleSchema`, `howToSchema`,
   `itemListSchema`). Never FAQPage.

Word count guideline: 900–1,600 words of real, specific, manufacturing-literate
copy per page. Write for a 55-year-old shop owner: direct, concrete, no SaaS
buzzwords, no "unlock", "supercharge", "seamless", "revolutionize".

## 4. Shared API

```js
import { brand, entity, trustBadges, compliance } from "@/content/brand";
import { tiers, featureMatrix, addOns, creditWeights } from "@/content/pricing";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbSchema, softwareApplicationSchema,
         articleSchema, howToSchema, itemListSchema } from "@/lib/schema";
import { PageHero, AnswerBlock, Section, DataTable, CheckList, FactGrid,
         RelatedLinks, CtaBand, StatusBadge, TrustBadgeRow, Breadcrumbs,
         AntiPositionBanner } from "@/components/site/primitives";
import FaqAccordion from "@/components/site/FaqAccordion";
import { Icon } from "@/components/lib/Icons";   // Icon.ArrowRight, Icon.Check, Icon.Factory, ...
```

Available `Icon.*` keys: ArrowRight ArrowUpRight ChevronDown Check Plus Minus
Menu Close Lead Pipeline Customer Quote Bell Team Chart Bolt Gear Factory Car
Compass Flask Box Bricks Chip Mail Chat Phone Globe Mega Bars Calc Target
Trending Shield Sparkle Calendar Clock Layers Route Filter Play Pin Dollar
Grid Database User Weld Sun Moon.

Charts (`@/components/lib/charts`): AreaChart, Sparkline, Donut, Ring, Bars, Funnel.
Motion (`@/components/lib/motion`): Reveal, Stagger, StaggerItem, Counter, motion.

CSS helpers: `container-x`, `section-y`, `section-heading`, `lead`, `eyebrow`,
`btn-primary`, `btn-secondary`, `btn-ghost`, `btn-dark`, `chip`, `card-hover`,
`prose-site`, `data-table`, `table-scroll`, `answer-block`, `bp-grid`,
`bp-grid-dark`, `tnum`, `status-live/-beta/-building/-planned`.

The global `<SiteHeader>`, `<SiteFooter>` and `<main>` are already in
`app/layout.js` — page files render sections only, no `<main>` wrapper.

## 5. The Wave 1 URL set

Core: `/` `/product` `/pricing` `/demo` `/free-tool/rfq-analyzer` `/about`
`/trust` `/contact`
Product spokes: `/rfq-management-software` `/manufacturing-quoting-software`
`/whatsapp-crm-for-manufacturers` `/indiamart-crm` `/mobile-crm-for-shop-floor`
Quote-to-cash: `/quote-to-cash` `/quote-to-order` `/quote-management-software`
`/engineer-to-order-software` `/distributor-management-software`
ICP: `/job-shop-crm` `/machine-shop-crm` `/contract-manufacturing-crm`
`/fabrication-crm` `/custom-manufacturing-crm`
Comparison: `/best-crm-for-manufacturing` `/vs/mrpeasy` `/vs/jobboss`
`/vs/zoho-crm-for-manufacturing`
Resources: `/blog` `/blog/[slug]` `/glossary/[slug]`
Partners: `/partners` `/partners/apply`(noindex) `/partners/directory`
`/partners/certification` `/partners/portal`(noindex)
Pricing cluster: `/ai-credits` `/whatsapp-billing` `/add-ons` `/tier-comparison`
Integrations: `/integrations` + 26 `/integrations/[slug]`
Features: `/features` + 44 `/features/[slug]`
Transparency: `/whats-shipping` `/changelog` `/roadmap`
Legal: `/legal/terms` `/legal/privacy` `/legal/dpa` `/legal/cookies`
`/legal/accessibility`
Utility (noindex): `/signup`

## 6. House style

- Sentence case headings. No exclamation marks. No emoji in body copy.
- Numbers are specific and sourced from the spec, never invented.
- Prefer "we" over "the platform". Say what the software does, then say what
  it does not do.
- Dark sections use `bg-navy-900` + `bp-grid-dark`; light sections alternate
  `bg-surface` / `bg-surface-2`.
- Everything must build with `npm run build` (Next.js 16, React 19, JS not TS).
