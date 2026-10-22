<!-- SYNCED COPY. Source of truth: README.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# KanchanFlow — Manufacturing software marketing site

The Wave 1 brand website for **KanchanFlow**, the RFQ-to-Order manufacturing software,
owned and operated by **Soor LLC** (Delaware). Built with **Next.js 16**,
**React 19**, **Tailwind CSS** and **Framer Motion**.

> "The RFQ-to-Order software built for job shops and contract manufacturers."

This repo implements the *Manufacturing Vertical Brand Website — Implementation
Spec v1.1* and its raw research appendices. **`SPEC-CONTRACT.md` is the working
contract** — read it before changing any page. It carries the locked decisions,
the guardrails and the shared component API.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build, ~720 prerendered pages
npm start

# checks
npm run lint          # parses every plain-JS module, cross-checks the registries
npm run claims-guard  # the unsupported-claim guard
npm run seo:unit      # registry + geo unit tests (92)
npm run seo:check     # the prerendered HTML against the market registry
npm run seo:rendered  # integration tests over the built HTML (48)
npm run seo:lengths   # title and description budgets, 170 routes
npm run verify        # all of the above, in order

npm start &
SEO_BASE_URL=http://localhost:3000 npm run seo:http   # live HTTP tests (24)
BASE_URL=http://localhost:3000 npm run seo:gate       # full crawl, no JS
```

Sora, Inter and IBM Plex Mono are vendored in `app/fonts/` and loaded with
`next/font/local`, so the build makes no request to Google Fonts. (The admin
<!-- line omitted: names a company other than Soor LLC -->
`BLOG_REVALIDATE_SECRET` is set — see `lib/cms-blog.js`; `BLOG_FEED_ORIGIN` and
`BLOG_FEED_HOST` are optional overrides. Without the secret the build carries
on with the hand-written posts.)

## What is in here

**About 720 prerendered pages.** 147 routes at their bare paths, 35
indexable country copies of five of them, and 484 more country copies that are
deliberately `noindex` (the home and pricing pages of 242 long-tail markets).
A further 726 country pages render on first request — `dynamicParams = true`,
cached after the first hit — so the published country surface is 1,245 URLs of
which 35 are in the index. The exact counts come out of
`npm run seo:check`; the table below is the shape, not a hand-maintained
tally:

| Group | Count | Routes |
|---|---:|---|
| Core | 8 | `/` `/product` `/pricing` `/demo` `/free-tool/rfq-analyzer` `/about` `/trust` `/contact` |
| Product spokes | 5 | `/rfq-management-software` `/manufacturing-quoting-software` `/whatsapp-crm-for-manufacturers` `/indiamart-crm` `/mobile-crm-for-shop-floor` |
| Quote-to-cash | 5 | `/quote-to-cash` `/quote-to-order` `/quote-management-software` `/engineer-to-order-software` `/distributor-management-software` |
| ICP | 5 | `/job-shop-crm` `/machine-shop-crm` `/contract-manufacturing-crm` `/fabrication-crm` `/custom-manufacturing-crm` |
| Comparison | 4 | `/best-crm-for-manufacturing` `/vs/mrpeasy` `/vs/jobboss` `/vs/zoho-crm-for-manufacturing` |
| Integrations | 27 | `/integrations` + 26 connector pages |
| Features | 48 | `/features` + 47 feature pages (18 live · 20 building · 9 planned on 2026-10-08; counts come from `content/features.js`) |
| Transparency | 3 | `/whats-shipping` `/changelog` `/roadmap` |
| Pricing cluster | 4 | `/tier-comparison` `/add-ons` `/ai-credits` `/whatsapp-billing` |
| Partners | 5 | `/partners` `/partners/directory` `/partners/certification` `/partners/apply` `/partners/portal` |
| Resources | 5 | `/blog` + 2 posts + 2 glossary terms |
| Legal | 5 | `/legal/terms` `/legal/privacy` `/legal/dpa` `/legal/cookies` `/legal/accessibility` |
| Utility | 1 | `/signup` |
| Core country editions | 35 | `/us` `/in` `/gb` `/au` `/ae` `/sg` `/nz`, each with `/` `/pricing` `/product` `/job-shop-crm` `/contact` — indexable |
| Long-tail country editions | 1,210 | the same five paths under the other 242 ISO country prefixes — `noindex, follow`, out of every sitemap and cluster |

Plus `/robots.txt`, `/llms.txt`, and the sitemap **index** at `/sitemap.xml`
with three children (`/sitemaps/pages.xml`, `/sitemaps/markets.xml`,
`/sitemaps/resources.xml`), all generated from the same data by
`scripts/gen-seo-files.mjs`. `/sitemap-index.xml` serves the same index, for
the URL already submitted to Search Console, and `/blog-sitemap.xml` is a
dynamic route for admin-panel posts.

### Country architecture

**Every ISO 3166-1 country is published, and `tier` decides what that
means.** The seven **core** markets — the United States, India, the United
Kingdom, Australia, the UAE, Singapore and New Zealand — are the only
indexable country editions, the only members of the hreflang clusters, the
only countries in the market sitemap, and the only ones prerendered across all
five commercial routes. The other 242 are **long-tail**: `noindex, follow`,
self-canonical, in no cluster and in no sitemap, prerendered for `/` and
`/pricing` only. There is no "planned" state any more — `/de` and `/ca` are
real pages in euros and Canadian dollars. `/uk` is still a genuine 404,
because `uk` is not an ISO 3166-1 alpha-2 code — the United Kingdom is `gb`.

Three registries drive everything: `lib/iso-countries.js` (all 249 ISO
alpha-2 codes, reference data), `lib/iso-currencies.js` (which currency each
country uses) and `lib/markets.js` (the markets we serve, and their tier).
`lib/fx-rates.json` holds the dated reference rates and is the only place one
may live; `npm run rates:sync` regenerates it from one provider snapshot and
nothing fetches at runtime or at build.
`lib/market-routes.js` decides which paths get a prefix, and `marketPath()` is
the only function that adds one. `proxy.js` sends a reader whose CDN country
header names a market we publish to that market's copy, once, with a 307 —
never a crawler, never on browser language, and never over an explicit choice.

Full architecture and the procedures for adding, publishing and removing a
country: **`docs/international-seo.md`**. The implementation record and the
open questions: **`INTERNATIONAL-SEO-2026-10-09.md`**.

## Content architecture

Page copy is data, not markup. Everything a page asserts comes from `content/`:

| File | Owns |
|---|---|
| `content/brand.js` | Soor LLC canonical facts, positioning, palette rules, navigation, footer, hreflang policy, keyword architecture |
| `content/pricing.js` | The three tiers, the full feature-gate matrix, add-on catalog, AI credit weights, WhatsApp billing |
| `lib/fx-rates.json` | The dated reference rates — the only place an exchange rate lives. GENERATED by `npm run rates:sync` from one provider snapshot and read only by `lib/fx.js`; 153 currencies. A market whose currency the provider does not publish shows the contracted price and says so |
| `content/integrations.js` | 26 connectors: what syncs each way, setup, limitations, troubleshooting |
| `content/features.js` | 47 features with truthful status, target dates and per-tier availability |
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
- **hreflang is generated from `lib/markets.js`, never written by hand.** A
  market-scoped page emits `en` + one `en-XX` per published market +
  `x-default`; a page that exists once emits none. Never declare a locale whose
  content does not exist — every market is English-only, so there is no `de`,
  `ja` or `nl` until there is German, Japanese or Dutch copy and a local price.
- **Honest status badges.** Live means in production; building carries a visible
  target; planned promises nothing.
- **Never gated:** RFQ line items, quote revision history, and the India
  compliance suite — on every tier including Starter.
- **One country control, and the price follows it.** The header dropdown is
  the only country-or-currency control on the site; the separate
  display-currency selector, the footer country chips and the `/countries`
  directory page were removed on 2026-10-10. Choosing a country sets the
  market, and the market sets the currency. The dropdown lists all 249
  countries behind a search box that matches name, ISO code and currency, and
  only the eight indexable markets are in the server HTML — the rest mount when
  the panel opens, so a page does not ship 250 links.
- **Every market shows its own currency; two currencies are ever charged.**
  `content/pricing.js` carries a signed-off USD and INR figure per tier and is
  the single source; `marketMoney(market)` returns the figure a reader sees and
  `marketContractMoney(market)` the figure they are charged. 226 markets show
  their own currency as an **indicative** conversion of the contracted dollar
  price at a dated reference rate; 22 show a contracted figure because the
  currency they use is one we contract in (the USA, India and the dollarised
  territories, plus the four uninhabited ones); and one — North Korea — shows
  the contracted figure because no KPW rate is published, and says so. Every
  page that shows a price carries exactly **one** short line of fine print,
  below the figures, naming what the charge is raised in
  (`priceFootnote()`, `components/site/PriceFootnote.js`). A JSON-LD `Offer`
  only ever carries the contracted currency and amount. There is no currency
  toggle and no "prices are shown in US dollars" banner; a rendered-HTML test
  fails the build on either.
  > **Changed 2026-10-12.** This used to read "18 markets … the other 232 show
  > the contracted figure and say in plain words that we have no rate we would
  > stand behind for their currency", with a note that local pricing had been
  > rejected because 154 currencies against 7 hand-entered rates meant
  > inventing ~147. `scripts/sync-rates.mjs` (`npm run rates:sync`) answers
  > that: 153 of the 154 come from one dated provider snapshot, committed as
  > `lib/fx-rates.json`, reviewable as a diff and never hand-edited. What is
  > *contracted* did not change.
- **A real flag for every country.** `public/flags/*.svg` is one committed,
  verified SVG per published market (from `country-flag-icons`, copied in, not
  fetched at build time) and `components/lib/CountryFlag.js` renders them as
  lazy `<img>` — no bundle cost, and only the rows on screen load. A missing
  file shows a neutral globe, never a letter chip; a registry test asserts
  every market has one.
- **No market claims a local presence.** No local office, phone number, payment
  method, data residency, support window, certification or named customer, in
  any country edition. Soor LLC of Lewes, Delaware is the contracting company
  everywhere, and every country page says so in a visible note.
- **`tier` is the only switch between an indexed market and a long-tail
  one.** It drives indexability, sitemap membership, cluster membership and the
  prerender set from one field. Promoting a country to `core` means authored
  copy and founder sign-off, not a code change elsewhere.

`scripts/seo-lengths.mjs` re-checks every title and meta description against the
SERP budget, across all 169 indexable routes including the 35 core country
pages. The 1,210 long-tail country pages are not measured: they are `noindex`,
so they have no SERP snippet to budget.
`scripts/seo-check.mjs` runs after every build and validates each page's
hreflang cluster against the registry element by element.
`scripts/seo/` holds 238 automated tests over the registries, the country
routing rules, the built HTML and a running server.

Note: `npm run lint` runs `scripts/lint.mjs`, not ESLint. `next lint` was
removed in Next.js 16 and ESLint is not installed in this repo; adding it
(`npm i -D eslint eslint-config-next`) is a separate decision.

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
