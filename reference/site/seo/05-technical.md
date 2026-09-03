<!-- SYNCED COPY. Source of truth: docs/seo/05-technical.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 05 — Technical SEO

Section P. This is an audit of what `kanchanflow.com` already does, not a
generic checklist. Most of the foundation is in place; the gaps are specific.

Verified against `next.config.mjs`, `lib/seo.js`, `lib/schema.js`,
`scripts/gen-seo-files.mjs` and `app/` on 2026-09-03.

---

## P.1 Already correct — do not change

| Item | Implementation | Note |
|---|---|---|
| Static rendering | `export const dynamic = "force-static"` on every route; 125 prerendered pages | No JS-rendering risk. This is the single biggest technical advantage the site has |
| Canonicals | `buildMetadata()` emits a self-referencing absolute canonical on every page | Enforced by contract, not by discipline |
| hreflang | `en-US` + `x-default` only, from `content/brand.js` `locales.hreflang` | Correct for a USA-only Wave 1. Guardrail 6 protects it |
| robots.txt + sitemap.xml | Generated at build by `scripts/gen-seo-files.mjs`, served from `public/` | Cannot drift from the route set. Noindex pages are excluded by design |
| Sitemap completeness | Static list + generated entries for integrations, non-noindex features, blog and glossary | Adding a feature or connector needs no sitemap edit |
| Noindex handling | `planned` features, `/signup`, `/partners/apply`, `/partners/portal` are noindex **and** absent from the sitemap | The correct pairing. A noindex URL in a sitemap is a contradiction |
| Redirects | 12 permanent redirects in `next.config.mjs`, including nine legacy feature slugs, served as real 308s | Correctly avoids prerendered redirect stubs with duplicate titles |
| Open Graph / Twitter | Full OG + `summary_large_image` on every page; PNG card, deliberately not SVG | The SVG note in `lib/seo.js` is right — LinkedIn and Slack refuse SVG |
| Meta description length | `clampDescription()` truncates at 158 chars on a word boundary | |
| Breadcrumbs | `breadcrumbSchema(trail)` plus a visible `Breadcrumbs` component on every page | Visible and structured agree |
| Schema discipline | No `faqSchema` export exists in `lib/schema.js`; no `Review`/`AggregateRating` | Guardrails 1 and 2 enforced in code, which is the only way they hold |
| llms.txt | Generated alongside robots and sitemap | Ahead of most B2B sites |

## P.2 Gaps to fix — in priority order

### 1. Sitemap priorities contradict the keyword data — **fix with the retarget**

`/custom-manufacturing-crm` carries priority 0.85 and `/quote-to-order` 0.8.
Both are being merged. `/indiamart-crm` sits at 0.6 with zero US demand. The new
pillar does not exist yet.

Update `STATIC` in `scripts/gen-seo-files.mjs`:

```
["/manufacturing-crm", 0.95, "weekly"],   // NEW — pillar
["/integrations/quickbooks", 0.85, "monthly"],  // promote out of the 0.6 bucket
["/vs/paperless-parts", 0.8, "monthly"],  // NEW
// remove: /quote-to-order, /custom-manufacturing-crm  (301'd)
// remove or drop to noindex: /indiamart-crm
```

`/integrations/quickbooks` is currently generated at a flat 0.6 with the other
25 connectors. It is a P0 commercial page and needs its own entry.

### 2. Redirects — deliberately none *(decided 2026-09-03)*

The original plan called for two 301s. It was overruled for a good reason: the
site has never been submitted to Search Console, has zero indexed URLs and DR 0,
so there is no equity for a redirect to preserve and no external link to
protect. `/custom-manufacturing-crm` was removed outright and every internal
link to it rewritten to `/engineer-to-order-software`. `/quote-to-order` was
kept — see `02-keywords.md` §G.1.

The rule still applies to anything removed **after** the sitemap is submitted:
from that point on, a removed URL needs a 301 and an internal-link sweep.

### 3. `Article` schema is exported but under-used

`lib/schema.js` exports `articleSchema` with `author`, `datePublished` and
`dateModified`. Editorial pages should all emit it, populated with a real named
author. This is the mechanical half of the E-E-A-T work in `04-editorial.md` §Q.

**Do not add `Person` schema for an author who does not exist.** Guardrail 4's
logic — no fabricated people — applies to schema as much as to copy.

### 4. `SoftwareApplication` schema needs `offers`

`softwareApplicationSchema()` takes `name`, `description`, `path` and
`featureList`. Pricing is public and locked in `content/pricing.js`
($39/$49/$99 per user per month), so an `offers` block is truthful and
eligible. Add it, sourced from `content/pricing.js` so it cannot drift.

Emit `SoftwareApplication` on: `/`, `/manufacturing-crm`, `/pricing`, and the
product spokes. Do **not** emit it on editorial, glossary or comparison pages —
a comparison page is not the product.

### 5. `ItemList` on the comparison pages

`/best-crm-for-manufacturing` already uses `itemListSchema`. `/vs/paperless-parts`
and the other `/vs/*` pages should not — a two-way comparison is not a list.
Use `Article` there instead, with the checked-on date as `dateModified`.

### 6. Image optimisation and alt text

Figures are generated by `scripts/gen-figures.mjs` and `gen-screenshots.mjs` as
SVG. SVG is the right call for diagrams — small, sharp, theme-aware — but two
rules follow:

- The OG image must stay PNG (already handled).
- Every figure needs `alt` describing **what the screen shows**, not the page's
  keyword. "The quote editor with three line items and a drawing attached, Rev C"
  is useful; "manufacturing quoting software" is keyword stuffing in an
  attribute.

Screenshots of `building` features need a visible caption naming the status.

### 7. Core Web Vitals

Static output plus `next/font/google` for Sora, Inter and IBM Plex Mono means
LCP and CLS should already be good. Two watch items:

- **Font loading.** `next/font` fetches at build time and self-hosts, which is
  correct. Confirm `display: swap` and that the three families are not all
  loaded on every route.
- **Framer Motion on first paint.** `Reveal`, `Stagger` and `Counter` are used
  widely. Any motion that delays text paint hurts LCP. Content inside the
  `AnswerBlock` — the first 100 words after the H1 — must render immediately,
  never behind an entrance animation. Verify with a throttled Lighthouse run on
  `/manufacturing-quoting-software`, which uses several.

Measure INP, not FID. Target: LCP < 2.0s, INP < 200ms, CLS < 0.05 on mobile 4G.

### 8. Faceted navigation and pagination

Neither exists yet. Two future traps worth naming now: if `/features` or
`/integrations` ever gains category filters, they must be links to real filtered
pages or client-side only with no crawlable URL variants — never crawlable query
parameters. If `/blog` ever paginates, `/blog/page/2` gets a self-referencing
canonical, not a canonical to `/blog`.

### 9. Search Console, analytics and conversion tracking

Not verifiable from the repo. Required before the first P0 page ships:

- GSC property verified on the `https://kanchanflow.com` prefix, sitemap
  submitted
- Bing Webmaster Tools — cheap, and it feeds Copilot
- Analytics with **goals wired to the three CTAs**: demo request, trial signup,
  RFQ Analyzer completion. Sessions are not a KPI here; the category is too
  small for session counts to mean anything
- A GSC → sheet export so `06-roadmap.md`'s KPI dashboard can be populated
  automatically

### 10. The proxy header issue

`scripts/gen-seo-files.mjs` documents a real production hazard: a proxy
rewriting `Content-Type` on `sitemap.xml` and `robots.txt`. Serving them from
`public/` so Apache can alias them directly is the right fix. **Verify in
production** with `curl -I https://kanchanflow.com/sitemap.xml` — the header
must be `application/xml`, not `text/html`. A sitemap served as HTML is silently
ignored.

## P.3 Pre-launch technical checklist

| # | Check | Owner |
|---:|---|---|
| 1 | `curl -I /sitemap.xml` returns `application/xml` | Infra |
| 2 | `curl -I /robots.txt` returns `text/plain` | Infra |
| 3 | GSC verified, sitemap submitted, no coverage errors | SEO |
| 4 | Every indexable route returns 200 and a self-referencing canonical | Build script |
| 5 | Every noindex route is absent from the sitemap | Already automated |
| 6 | No internal link points at a 301 source | Build script |
| 7 | No indexable page links to a noindex page from `RelatedLinks` | Build script |
| 8 | Every page has exactly one `<h1>` | Build script |
| 9 | No two indexable pages share a `<title>` or meta description | Build script |
| 10 | Mobile Lighthouse ≥ 90 performance on the six P0 pages | SEO |
| 11 | LCP < 2.0s, INP < 200ms, CLS < 0.05 on mobile | SEO |
| 12 | Every image has descriptive, non-keyword `alt` | Review |
| 13 | Schema validates in Rich Results Test; no `FAQPage`, no `Review` | Build script |
| 14 | hreflang is `en-US` + `x-default` only, on every page | Already automated |
| 15 | OG image resolves and unfurls correctly on LinkedIn and Slack | Review |
| 16 | 404 page returns a real 404 status, not 200 | Infra |
| 17 | HTTPS everywhere, HSTS set, no mixed content | Infra |
| 18 | `www` and apex resolve to one canonical host | Infra |
| 19 | Conversion goals firing for demo, trial and RFQ Analyzer | Analytics |
| 20 | `llms.txt` lists the pillar pages, not all 126 URLs | SEO |

Checks 4, 6, 7, 8, 9 and 13 are all assertable from the `app/` tree at build
time. They belong in one script next to `gen-seo-files.mjs`, run in `prebuild`,
failing the build on violation. That is worth more than any recurring manual
audit, because it makes the guardrails un-forgettable.
