<!-- SYNCED COPY. Source of truth: README.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# KanchanFlow — Manufacturing CRM marketing site

The Wave 1 brand website for **KanchanFlow**, the RFQ-to-Order manufacturing CRM,
owned and operated by **Soor LLC** (Delaware). Built with **Next.js 16**,
**React 19**, **Tailwind CSS** and **Framer Motion**.

> "The RFQ-to-Order CRM built for job shops and contract manufacturers."

This repo implements the *Manufacturing Vertical Brand Website — Implementation
Spec v1.1* and its raw research appendices. **`SPEC-CONTRACT.md` is the working
contract** — read it before changing any page. It carries the locked decisions,
the guardrails and the shared component API.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build, 131 prerendered pages
npm start
```

`next/font/google` fetches Sora, Inter and IBM Plex Mono at build time, so the
build needs outbound access to `fonts.googleapis.com`.

## What is in here

**131 prerendered routes**, all statically generated:

| Group | Count | Routes |
|---|---:|---|
| Core | 8 | `/` `/product` `/pricing` `/demo` `/free-tool/rfq-analyzer` `/about` `/trust` `/contact` |
| Product spokes | 5 | `/rfq-management-software` `/manufacturing-quoting-software` `/whatsapp-crm-for-manufacturers` `/indiamart-crm` `/mobile-crm-for-shop-floor` |
| Quote-to-cash | 5 | `/quote-to-cash` `/quote-to-order` `/quote-management-software` `/engineer-to-order-software` `/distributor-management-software` |
| ICP | 5 | `/job-shop-crm` `/machine-shop-crm` `/contract-manufacturing-crm` `/fabrication-crm` `/custom-manufacturing-crm` |
| Comparison | 4 | `/best-crm-for-manufacturing` `/vs/mrpeasy` `/vs/jobboss` `/vs/zoho-crm-for-manufacturing` |
| Integrations | 27 | `/integrations` + 26 connector pages |
| Features | 45 | `/features` + 44 feature pages (18 live · 18 building · 8 planned) |
| Transparency | 3 | `/whats-shipping` `/changelog` `/roadmap` |
| Pricing cluster | 4 | `/tier-comparison` `/add-ons` `/ai-credits` `/whatsapp-billing` |
| Partners | 5 | `/partners` `/partners/directory` `/partners/certification` + 2 noindex |
| Resources | 5 | `/blog` + 2 posts + 2 glossary terms |
| Legal | 5 | `/legal/terms` `/legal/privacy` `/legal/dpa` `/legal/cookies` `/legal/accessibility` |
| Utility | 1 | `/signup` (noindex) |

Plus `/robots.txt`, `/sitemap.xml` and `/llms.txt`, all generated from the same data.

## Content architecture

Page copy is data, not markup. Everything a page asserts comes from `content/`:

| File | Owns |
|---|---|
| `content/brand.js` | Soor LLC canonical facts, positioning, palette rules, navigation, footer, hreflang policy, keyword architecture |
| `content/pricing.js` | The three tiers, the full feature-gate matrix, add-on catalog, AI credit weights, WhatsApp billing |
| `content/countries.js` | The seven display markets, their currencies and the dated reference rates |
| `content/integrations.js` | 26 connectors: what syncs each way, setup, limitations, troubleshooting |
| `content/features.js` | 44 features with truthful status, target dates and per-tier availability |
| `content/changelog.js` | Release history and the four roadmap buckets |
| `content/blog.js`, `content/glossary.js`, `content/partners.js` | Editorial and partner-program content |

`lib/seo.js` builds every page's canonical and hreflang. `lib/schema.js` builds
the JSON-LD. `components/site/` holds the shared chrome and page primitives.

## Guardrails enforced in this codebase

- **No `FAQPage` schema, ever.** FAQs render visibly through
  `components/site/FaqAccordion`; `lib/schema.js` has no `faqSchema` export.
- **No `Review` or `AggregateRating`** until real third-party review data exists.
- **No fabricated customers.** There are zero named customers at launch, and the
  site says so. The trust ladder (Delaware entity, SOC 2 Type II, open changelog,
  public roadmap, feature-truth audit, dated integration re-tests) stands in.
- **No parent-company reference.** Soor LLC is the only company named.
- **hreflang is `en-US` + `x-default` only.** Wave 1 is a single `.com` root.
- **Honest status badges.** Live means in production; building carries a visible
  target; planned promises nothing.
- **Never gated:** RFQ line items, quote revision history, and the India
  compliance suite — on every tier including Starter.
- **The market selector is display-only.** It switches the currency prices are
  shown in (USD, INR, GBP, AUD, AED, SGD, NZD) and nothing else — no country
  routes, no extra hreflang, no change of canonical or copy. USD and INR are
  contracted prices; the rest are indicative conversions at a fixed dated rate,
  labelled as such wherever they appear.

`scripts/seo-lengths.mjs` re-checks every title and meta description against the
SERP budget.

## Design system

- **Palette** — brand navy `#0B1F3B`, shop-floor safety orange `#E85B1B` for
  primary actions, steel blue for structure and data, on a light grey base.
  Full light and dark themes via CSS variables in `app/globals.css`.
- **Type** — Sora (display), Inter (body), IBM Plex Mono (technical labels).
- **Motion** — `Reveal` / `Stagger` / `Counter` helpers in
  `components/lib/motion.js`, all honoring `prefers-reduced-motion`.
- **Charts** — hand-built animated SVG primitives in `components/lib/charts.js`.

## Notes

- Product screenshots are placeholders with a visible capture-date requirement —
  no stock imagery and no faked UI.
- Form endpoints (`/api/demo`, `/api/contact`, `/api/partners/apply`,
  `/api/newsletter`) are Phase 4 backend work; field names are already settled.
- Illustrative arithmetic is labelled as such wherever it appears.
