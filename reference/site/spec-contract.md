<!-- SYNCED COPY. Source of truth: SPEC-CONTRACT.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# KanchanFlow — build contract (read this before writing any page)

> **Wave 2 amendment, 2026-10-09.** Three locked items below changed when the
> country-based URL architecture shipped: §0 #6 (hreflang), §1 (single
> USA-market root) and §5 (the URL set). Each is marked AMENDED in place with
> what replaced it. The decision record, the test results and the open
> questions are in `INTERNATIONAL-SEO-2026-10-09.md`; the architecture and the
> procedures are in `docs/international-seo.md`.
>
> **This amendment needs founder sign-off** (§12 change control). Everything
> else in this file is unchanged and still locked.
>
> **Wave 2.1 amendment, 2026-10-10 — every country is selectable, and the
> pricing MODEL changed.** Three locked clauses are affected, and each is
> marked AMENDED in place where it stands:
>
> * **§1 (market, and the navbar controls)** — three amendments: the seven
>   prefixes become the **core tier** of a registry that now carries every ISO
>   country; "nothing is converted at an exchange rate" becomes "nothing is
>   *contracted* at an exchange rate"; and the two navbar currency/country
>   controls collapse into **one**.
> * **§2 (the price LOCK)** — the locked figures are unchanged and are still
>   what is charged; a market whose own currency is not contracted now also
>   DISPLAYS an indicative, dated conversion of them.
> * **§2 again, 2026-10-12** — the Enterprise **$2,000/month platform fee is
>   withdrawn**, on the founder's direct instruction. The per-user figures are
>   untouched, and the indicative-display rule above is unchanged. The fee had
>   already gone from `content/pricing.js`; §2 was the last place on the site
>   that still published it.
>
>   *Considered and NOT done, 2026-10-12:* contracting each market in its own
>   currency. It was started and reverted. The published markets span 154
>   distinct currencies and `lib/fx.js` holds 7 real rates, so it would have
>   meant authoring ~147 exchange rates by hand and publishing them as prices
>   the business commits to invoice — unreviewable, and unlike a figure
>   labelled indicative, a contracted price is one a buyer can act on. §2
>   needs no further amendment: "nothing retyped, nothing converted" stands.
> * **§1 and §6 again, 2026-10-12** — the product is **software, not a CRM**.
>   §1's locked H1 changes; §6's house style gains the rule.
> * **§5 (the URL set)** — three amendments: the country enumeration is no
>   longer closed (249 markets × 5 paths, of which the indexed 35 are
>   unchanged); `/countries` is withdrawn; and the "every route is indexable"
>   rule gains a long-tail `noindex, follow` exception. §5 also records the
>   navbar's fixed five items and two CTAs.
> * **§6 (the "never convert a price" rule)** — follows §2: conversion is
>   allowed in `lib/fx.js` and nowhere else.
>
> The founder approved both changes directly: every country selectable with
> the indexed surface held at seven, and an indicative display conversion on
> top of an unchanged contracted price. Rates live in `lib/fx.js` and nowhere
> else; a JSON-LD `Offer` still carries the contracted currency and the
> contracted amount; `tier` in `lib/markets.js` is the single switch between
> indexed and long-tail.

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
   *Exception (founder decision 2026-09-23):* the "Book a demo" buttons and
<!-- line omitted: names a company other than Soor LLC -->
   (`DEMO_URL` in content/brand.js). That one URL is allowed; the name is
   still never shown in copy. claims-guard CL-3 enforces both.
4. **NEVER fabricate customer logos, testimonials, counts or case studies.**
   At launch there are zero named customers on this brand. Use the trust
   ladder (Delaware LLC / SOC 2 Type II / USA data centers / open changelog /
   public roadmap / feature-truth audit) instead.
5. **NEVER claim a certification without an audit.** ISO 27001 is "Wave 3, not
   audited". AS9100 / CMMC certification is "never — we are the CRM, not the
   certifier; we ship an immutable audit log for compliance-driven
   manufacturers."
6. **AMENDED 2026-10-09 — hreflang is generated from `lib/markets.js`.**
   *Was:* "hreflang is `en-US` + `x-default` only. Never add
   en-GB/en-CA/en-AU/en-IN/de/ja/nl."
   *Now:* a market-scoped page emits `en` (the international page), one
   `en-XX` per published indexable market, and `x-default`. Seven markets are
   published: US, IN, GB, AU, AE, SG, NZ. A page that exists once — the blog,
   the glossary, the feature, integration, comparison and legal pages — emits
   **no** alternates at all.
   The guardrail that survives, and is now enforced by a test: **never declare
   a locale whose content does not exist.** Every market is English-only, so
   the cluster is `en` + `en-XX` and there is no `de`, `ja` or `nl` until
   there is German, Japanese or Dutch copy and a local price. Those countries
   are registered as `planned` with the reason, and `/de` returns a real 404.
   `buildMetadata()` still handles it — always use it. It derives the cluster
   from `lib/market-routes.js`, so there is no second hreflang source.
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
- H1 (homepage): **AMENDED 2026-10-12.** *Was:* "The RFQ-to-Order CRM built
  for job shops and contract manufacturers" — a locked headline variant.
  *Now:* "The RFQ-to-Order **software** built for job shops and contract
  manufacturers". The sentence is otherwise identical, and `brand.h1` in
  `content/brand.js` is still the only place it is written.
  *Why:* founder decision — the product is described as software, not as a
  CRM, across the whole site: titles, meta descriptions, H1s, body copy, FAQ
  answers, JSON-LD (`applicationSubCategory` is now "Manufacturing Software")
  and `/llms.txt`. `brand.legalProduct` becomes "KanchanFlow Manufacturing
  Software". **No slug, URL or route changed** — `/manufacturing-crm`,
  `/job-shop-crm`, `/machine-shop-crm`, `/contract-manufacturing-crm`,
  `/fabrication-crm`, `/custom-manufacturing-crm`,
  `/whatsapp-crm-for-manufacturers`, `/indiamart-crm`,
  `/mobile-crm-for-shop-floor`, `/best-crm-for-manufacturing`,
  `/vs/zoho-crm-for-manufacturing` and `/glossary/cpq-vs-crm` all keep their
  paths, because changing one would break the indexed URL set in §5, the
  hreflang clusters and every internal link. A competitor that is a CRM is
  still called one, and so is the CRM product category where the point is what
  we are being compared against.
- Sub: "Made for USA job shops and contract manufacturers. Delaware-registered.
  Hosted on AWS. Same-day support in US business hours." (revised 2026-09-23,
  see §7)
- Anti-position (must appear on /pricing and /about): "This is not an ERP,
  MRP, CAD, BOM, or advanced CPQ system — it manages customer RFQs, quotes,
  follow-ups, and order handoff."
- Palette: navy `#0B1F3B` (`navy-900`), safety orange `#E85B1B`
  (`forge-500`), steel blue (`steel-*`). Never the parent purple `#6344E7`.
- Market: **AMENDED 2026-10-09.** *Was:* "USA-only Wave 1, single `.com`
  root, USD default." *Now:* one `.com` root with seven country prefixes —
  `/us` `/in` `/gb` `/au` `/ae` `/sg` `/nz` — on five commercial routes only.
  USD remains the default contract currency and the currency of the unprefixed
  international site; India is contracted in INR. No other currency is
  contracted.
  **AMENDED 2026-10-10.** *Was:* "and nothing is converted at an exchange
  rate." *Now:* nothing is **contracted** at an exchange rate, and no
  converted figure ever reaches an invoice, a contracted price in
  `content/pricing.js` or a JSON-LD `Offer`. A market whose own currency is
  not contracted DISPLAYS that currency, converted from the contracted USD
  price at the fixed, dated reference rate in `lib/fx.js`, labelled
  indicative, beside a visible statement of the dollar amount charged.
  *Why:* a USD-only price on a UK or UAE page made a reader leave the page to
  size the cost, and the old wording also contradicted the display-currency
  selector the navbar already shipped. Founder-approved pricing-model change;
  see §2.
  **AMENDED 2026-10-12 — the display currency is EVERY market's own, not
  seven markets'.** *Was:* in practice, the clause above applied to the five
  converted core markets and the handful of territories sharing their
  currencies. The other 230-odd countries each had a page that showed US
  dollars under a paragraph explaining that we had no reference rate for the
  local currency we would stand behind. *Now:* **every published market
  displays its prices in its own currency.** No country page shows US dollars
  unless the dollar is genuinely that country's own currency. There are
  exactly five exceptions and they are named in code, in
  `lib/markets.js resolveDisplayCurrency()` and in the test suite: North
  Korea, whose KPW the rate provider does not publish, and Antarctica, Bouvet
  Island, South Georgia and Heard Island, which have no currency because
  nobody lives there.
  *Why:* the previous position rested on one objection — that 154 currencies
  could not be covered without hand-authoring ~147 exchange rates, which
  nobody could review. `scripts/sync-rates.mjs` answers it: 153 of the 154
  currencies the registry uses come from one dated provider snapshot
  (open.er-api.com, USD base), filtered to the codes in use, committed to the
  repository as `lib/fx-rates.json` and refetched by `npm run rates:sync`.
  Nothing is hand-authored, nothing is fetched at runtime or at build, and the
  diff is reviewable. With the objection gone, a dollar price on a page
  written for a reader in Hanoi or Lima is just a worse page. Founder
  decision, asked for three times. What is CHARGED is unchanged — see §2.
  **AMENDED 2026-10-10 — every country is selectable; seven are *core*.**
  *Was:* "one `.com` root with seven country prefixes — `/us` `/in` `/gb`
  `/au` `/ae` `/sg` `/nz`", an enumeration that was also the whole set of
  countries a reader could choose. *Now:* the registry carries **every** ISO
  3166-1 country, each with a `tier` of `"core"` or `"long-tail"`, and the
  country dropdown offers all of them. The seven above are the **core**
  markets and nothing about them changed: they are the only indexable country
  editions, the only members of the hreflang clusters, the only countries in
  the market sitemap, and the only ones prerendered across all five
  market-scoped paths. Every other country is `long-tail`: `noindex, follow`,
  self-canonical, in no cluster, in no sitemap, and prerendered for `/` and
  `/pricing` only (the rest render on first request, `dynamicParams = true`).
  *Why:* a reader in a country we had not enumerated was shown a dollar price
  with no way to say where they were, and the fix — adding a country to a
  hardcoded list — was a code change every time. Making every country
  selectable while keeping the *indexed* surface at seven separates "a reader
  can choose this" from "we publish a market here", which is the thing §1
  actually signed off. Founder-approved. The seven-market founder decision
  survives as the core tier; see §5 for what this does to the URL set.
  The India regulatory features still ship, and are still framed as "for USA
  manufacturers with India operations, India-based contract customers, or
  exporting to India" on the international and US pages; the `/in` pages
  address an Indian buyer directly.
  Unchanged and still locked: no market claims a local office, a local phone
  number, a local payment method, local data residency, local support hours, a
  certification or a named local customer. Soor LLC of Lewes, Delaware is the
  contracting company in every market, and every country page says so.

All of this lives in `content/brand.js` — import it, never retype it.

**AMENDED 2026-10-10 — ONE control in the navbar, not two.**

*Was:* "Two separate controls in the navbar, and they are not the same thing.
(1) **Currency selector** — `content/countries.js`,
`components/site/CountrySelect.js` — changes only the currency prices are
*displayed* in, never a route, an hreflang alternate, the canonical or the
copy. (2) **Country selector** — `lib/markets.js`,
`components/site/CountryMenu.js` — changes which country edition you are
reading, and pins the displayed currency to that market's contracted
currency."

*Now:* there is exactly **one** country-and-currency control —
`components/site/CountryMenu.js`, driven by `lib/markets.js` and nothing else.
Choosing a country sets the market, and the price shown follows the market.
`content/countries.js`, `components/site/CountrySelect.js` and
`components/site/CountryProvider.js` are **deleted**; the market is derived
from the URL (`components/site/useMarketPrices.js`), so prices are already
correct in the server HTML and there is no client-side currency preference to
hydrate. Every market displays its own currency: USD for the USA, the
international site and the dollarised territories, contracted INR for India,
and an indicative conversion everywhere else.

**There is no currency toggle, and there never has been on this site.** A
sibling site shipped a `USD $ | INR ₹` pair of buttons above its prices with a
banner reading "Prices on this site are shown in US dollars"; neither has an
equivalent here, and `scripts/seo/rendered.test.mjs` now fails the build on
either pattern appearing in the rendered HTML. A reader changes currency by
changing country, in the one control named above, and nowhere else.

*Why:* two currency controls side by side was flagged as unresolved — a reader
could not tell which one governed the price, and the second control kept a
hardcoded list of seven countries that had to be held in step with the
registry.

Rules that survive and are now enforced by tests: the control must never
create a country route, add an hreflang alternate or change the canonical; it
must be driven by the registry rather than a hardcoded list; it must work with
no JavaScript (real links in the server HTML); and the figures must be
labelled, as above.

The control does not redirect by IP on its own. A CDN country header moves a reader
who has made no choice, once, with a 307; an explicit choice is written to the
`kf-market` cookie and always wins; a crawler is never redirected; browser
language never causes a redirect. See `docs/international-seo.md` §12.

## 2. Pricing (locked, `content/pricing.js`)

| Tier | Monthly USD | Annual USD | Min users | Max users |
|---|---:|---:|:---:|:---:|
| Starter | $39/user | $32/user | 3 | 10 |
| Professional | $49/user | $41/user | 3 | 100 |
| Enterprise | $99/user | $82/user | 5 | unlimited |

14-day trial, no credit card, sample data. Annual = 17% off.

**AMENDED 2026-10-12 — the Enterprise platform fee is withdrawn.** *Was:* the
Enterprise row read "unlimited + $2,000/mo platform fee", and
`content/pricing.js` carried `platformFeeUsd: 2000` / `platformFeeInr: 150000`
with a `platformFee()` helper, a comparison-table row and a pricing FAQ built
on them. *Now:* there is **no platform fee on any tier**. The Enterprise row
is per-user pricing and a five-user minimum, and nothing else; the per-user
figures above are unchanged. No fee field, helper, table row, FAQ answer, meta
description, `llms.txt` line or JSON-LD `Offer` may reintroduce a fixed monthly
charge.

*Why:* founder decision — Enterprise sells capability per seat, and a $2,000
entry charge on top of it priced out exactly the multi-entity shops the tier
was built for. The fee was already removed from `content/pricing.js` in commit
`15d99e6`; `SEO-AUDIT-2026-10-08.md` item 4 recorded that this clause still
named it, and this amendment is that fix. This clause needed amending because
§2 is a price lock and a published fee is part of the locked price surface.

**AMENDED 2026-10-10 — the LOCK covers what is CHARGED, not what is
DISPLAYED.**

*Was:* an unqualified lock. Every figure on the site had to be one of the
numbers in the table above, or India's contracted INR counterpart in
`content/pricing.js`, and no other currency could appear anywhere.

*Now:* the numbers above are **unchanged and still locked**, and they remain
the only contracted prices along with India's INR figures. What is now
permitted — and required — is an **indicative display conversion**:

1. The figures above are what a customer is charged. They are the only figures
   that may appear in a JSON-LD `Offer`, in `content/pricing.js`, or in any
   statement of what is billed. `lib/market-schema.js` must not emit a
   converted number, and a test asserts that.
2. A market whose own currency is not contracted (today GB, AU, AE, SG, NZ)
   displays its own currency, converted from the contracted USD figure at the
   fixed, dated reference rate in `lib/fx.js`, rounded to a price point and
   formatted with `Intl.NumberFormat` for that market's locale.
3. Every page that shows a converted figure also shows, visibly, what is
   actually charged: the contracted dollar amounts, the word "indicative" and
   the date the rate was set. The USA and India show their contracted figures
   and carry no such line.
4. `content/pricing.js` stays the single source. Nothing is retyped and
   nothing is converted at build time into the contracted data.
5. `lib/fx.js` is the **only** place a rate may live. The rates there are
   approximate and must be refreshed from a real source before launch.

*Why:* a buyer in Dubai or Auckland reading a dollar-only price had to leave
the page to size the cost. The founder approved the pricing-model change; the
lock on what is charged is untouched. This clause needed amending because
showing a converted figure is a change to what is displayed, and the previous
wording — read with §1 and §6 — forbade it.

**AMENDED 2026-10-12 — every market, one line of fine print, a stated
rounding rule.**

The per-user figures in the table above are **unchanged and still locked**,
and they remain the only contracted prices along with India's INR figures.
Clauses 1 and 4 above stand verbatim. Clauses 2, 3 and 5 are superseded:

2. **Every published market** displays its own currency — not just the five
   named above. Where that currency is one `content/pricing.js` contracts
   (the USA, India, the dollarised territories) the figure is the contracted
   one and nothing is computed; everywhere else it is the contracted USD
   figure converted at the dated rate in `lib/fx-rates.json`. The only
   markets that show a currency which is not their own are North Korea, for
   which no rate is published, and the four uninhabited territories, which
   have no currency; both are explicit in `resolveDisplayCurrency()` and
   pinned by a test that names all five.

3. Every page that shows a price carries **exactly one** short fine-print
   sentence, below the figures — never in the headline, never a banner, never
   beside a toggle. `lib/markets.js priceFootnote()` is the only place it is
   written and `components/site/PriceFootnote.js` the only thing that renders
   it. On a converted market it reads:

   > Indicative figure, converted from our contracted price at a reference
   > rate as of *{asOf}*; the charge is raised in *{contracted currency}*.

   It quotes **no figures**. The paragraph it replaces named all three
   contracted dollar amounts, which put a dollar price back on every page in
   the world — the exact thing this amendment removes. On a market whose
   figure IS the contracted one the sentence says so instead, because a
   reader is entitled to know nothing was converted; `priceFootnote()`
   therefore never returns null, and dropping the line on any surface is a
   misrepresentation of the transaction, not a tidy-up.

5. `lib/fx.js` is still the **only** place a rate may live, and it no longer
   holds any. The table is `lib/fx-rates.json`, GENERATED by
   `scripts/sync-rates.mjs` (`npm run rates:sync`) from one provider snapshot
   and committed. **A rate may never be typed by hand**: a hand-typed rate has
   no source behind it and does not survive the next sync. A currency the
   provider does not publish stays absent, and that market shows the
   contracted price and says why. Nothing fetches at runtime or at build.

6. **ROUNDING IS PART OF THE CONTRACT.** A converted figure is rounded to
   three significant figures, never finer than half a unit, and to a whole
   number in a currency with no sub-unit —
   `step = max(0.5, 10^(magnitude - 2))`, clamped to 1 for the zero-decimal
   currencies (JPY, KRW, VND, IDR, CLP, ISK, HUF, XAF, XOF, XPF, UGX, RWF,
   PYG, KMF, DJF, GNF, VUV, BIF and IQD, which `Intl` identifies rather than a
   list). The published price is therefore never more than half a step from
   the real conversion: under half a percent above 100 units. A coarser step
   would read better — AED 145 rather than AED 143 — and be nearly 2% wrong on
   a figure the page invites a reader to budget against. Every figure is
   formatted with `Intl.NumberFormat` in the market's own locale, so rupees
   group in lakhs (₹15,00,000) and a European decimal comma is a comma.

*Why:* the request was made three times — "make sure for all country shows
their local curreny and not anyone and remove dollar and inr" — and the
objection that blocked it (154 currencies, seven reviewable rates) was
answered by generating the table instead of authoring it. §2 is a price lock
and the displayed price surface is part of what it locks, so the change needs
an amendment here. What a customer is charged did not move.

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
   Since 2026-10-08 (SEO-AUDIT-2026-10-08.md): `breadcrumbSchema(trail, page?)`
   also emits the page's `WebPage` node (`<url>#webpage`; pass `page.type` for
   AboutPage / ContactPage); `softwareApplicationSchema` always describes the
   one product at `${site}/#software` and emits `Offer`s only with
   `offers: true`, which a page passes only when it visibly shows the tier
   prices; blog posts use `articleSchema({ type: "BlogPosting" })`.

Word count guideline: 900–1,600 words of real, specific, manufacturing-literate
copy per page. Write for a 55-year-old shop owner: direct, concrete, no SaaS
buzzwords, no "unlock", "supercharge", "seamless", "revolutionize".

## 4. Shared API

```js
// Country targeting (2026-10-09). A page body takes `market` and threads it
// through; nothing else keeps a list of countries.
// Money (2026-10-12): marketMoney() is the DISPLAYED figure, in the market's
// own currency — every market, see §2; marketContractMoney() is the figure
// that is CHARGED and the only one that may reach structured data.
// priceFootnote() is the one fine-print sentence. Rates live in
// lib/fx-rates.json, read only by lib/fx.js, generated by npm run rates:sync.
import { GLOBAL_MARKET, getMarket, publishedMarkets, plannedMarkets,
         marketMoney, marketContractMoney, priceFootnote,
         localizeForMarket, marketHero } from "@/lib/markets";
import { PRICING_MODEL, RATES_AS_OF } from "@/lib/fx";
import { marketPath, buildCountryUrl, hreflangAlternates,
         switchMarketHref } from "@/lib/market-routes";
import { marketPageMetadata } from "@/lib/market-seo";
import { marketBreadcrumbSchema, marketSoftwareSchema,
         marketWebPageSchema } from "@/lib/market-schema";
import PriceFootnote from "@/components/site/PriceFootnote";   // was IndicativePriceNote
import Link from "@/components/site/MarketLink";   // not next/link, in the chrome

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
Comparison: `/best-crm-for-manufacturing` `/vs` `/vs/paperless-parts`
`/vs/mrpeasy` `/vs/salesforce-manufacturing-cloud` `/vs/jobboss`
`/vs/zoho-crm-for-manufacturing` `/vs/leadsquared` `/vs/xometry`
— one competitor per page, always (founder decision 2026-09-22). The roundup
ranks them and links each entry to its own `/vs` page; it never replaces
them. The list lives in `content/comparisons.js`.
Resources: `/blog` `/blog/[slug]` `/glossary/[slug]`
Partners: `/partners` `/partners/apply` `/partners/directory`
`/partners/certification` `/partners/portal`
Pricing cluster: `/ai-credits` `/whatsapp-billing` `/add-ons` `/tier-comparison`
Integrations: `/integrations` + 26 `/integrations/[slug]`
Features: `/features` + 44 `/features/[slug]`
Transparency: `/whats-shipping` `/changelog` `/roadmap`
Legal: `/legal/terms` `/legal/privacy` `/legal/dpa` `/legal/cookies`
`/legal/accessibility`
Utility: `/signup`

**AMENDED 2026-10-09 — country prefixes and the country directory.**

Five of the routes above are market-scoped and exist seven more times, once per
published market: `/` `/pricing` `/product` `/job-shop-crm` `/contact`, under
`/us` `/in` `/gb` `/au` `/ae` `/sg` `/nz`. That is 35 additional URLs. Three
new static files are served — `/sitemaps/pages.xml`, `/sitemaps/markets.xml`,
`/sitemaps/resources.xml` — and `/sitemap.xml` is now a sitemap **index**
rather than a flat urlset (`/sitemap-index.xml` serves the same index, so the
URL already submitted to Search Console keeps working).

**AMENDED 2026-10-10 — `/countries` is withdrawn.** *Was:* "One new global
route was added: `/countries`." *Now:* there is no `/countries` route. The
country selector is the navbar dropdown and nowhere else; it lists the
international site and every country in the registry, searchable, so there is
nothing left for a directory page to hold — and a page that linked all of them
would have shipped roughly 250 links into every crawl. `app/countries/page.js`,
`components/site/MarketPicker.js` and `marketListSchema()` are deleted, the
path is out of `GLOBAL_ONLY_PATHS`, out of the sitemap generator and out of
`/llms.txt`, and a request for `/countries` returns a genuine 404. The Wave 1
route count is therefore the list above plus 35 country copies and no new
global route. *Why:* founder decision — one country control, in one place.

**AMENDED 2026-10-10 — the navbar shape is fixed.** The top bar carries
**exactly five** primary items — `Features · Resources · Pricing · About ·
Contact` — and **exactly two** calls to action, `Log in · Sign up`. "Book a
demo" and "Start free trial" are not in the bar; their destinations are
unchanged and still reached from the hero, the CTA band, the final CTA block
and the footer. Everything that left the bar (the old Product, Solutions and
Company items) lives in the Features and Resources panels and in
`footerColumns`, so no route became an orphan — `scripts/seo-check.mjs` counts
inbound internal links per route and is what proves it. The nav lives in
`content/brand.js` `nav`; an item with no `columns` renders as a plain link.

**AMENDED 2026-10-10 — the URL set is no longer a closed enumeration of
countries.** *Was:* "Five of the routes above are market-scoped and exist
seven more times, once per published market … That is 35 additional URLs",
read as the complete country surface. *Now:* the five market-scoped paths
exist under **every** ISO 3166-1 country prefix, which is 249 markets ×
5 paths = **1,245** country URLs. The *indexed* set is unchanged and is still
exactly the 35 above: the seven core prefixes × five paths. The other 242
countries × five paths = 1,210 URLs are `noindex, follow`, self-canonical, in
no hreflang cluster and in no sitemap — they exist so a reader who chooses
their own country gets their own currency and a page that says where it
applies, not to be ranked. The sitemap totals therefore do not move: 35
country entries, as before.

*Footnote, 2026-10-12:* "gets their own currency" is only true as of today.
When this clause was written, 242 of those 249 pages showed the reader US
dollars, because `lib/fx.js` held seven rates. They now show the country's own
currency, with the five exceptions named in §1. Nothing about the URL set,
the tier split or the sitemap totals changed to make that true — only the rate
table (§2 clause 5), which is why this amendment needs no revision beyond
this note.

*Why:* §1 as amended makes every country selectable, and a selectable country
has to resolve to a URL. Locking the enumeration was meant to stop routes
being invented ad hoc; that intent is preserved by locking the **indexable**
enumeration and the **path** list instead — `MARKET_ROUTES` still names the
five scoped paths and nothing may be added to it without an amendment, and
`tier` in `lib/markets.js` is the only thing that promotes a country into the
indexed 35. Founder-approved alongside §1.

Every other route above keeps exactly one copy at its bare path, and every
pre-existing URL is served by its own file unchanged — static route segments
take precedence over `[country]`. Which routes are market-scoped and which are
global, and why, is `MARKET_ROUTES` and `GLOBAL_ONLY_PATHS` in
`lib/market-routes.js`, documented in `docs/international-seo.md` §4. Notably
the legal pages and the blog stay global: there is one contracting entity, and
the blog already has its own per-country mechanism in `lib/blog-hreflang.js`.

**Every route above is indexable** (founder decision 2026-09-07). No page on
this site carries a `noindex` robots tag, including `/indiamart-crm`, the
PLANNED feature pages and the utility pages, and every route is listed in the
sitemap. The only `noindex` allowed is the not-found fallback for an unknown
`[slug]` and the post-submit `/thanks/*` and `/form-error/*` pages, which also
carry an `X-Robots-Tag: noindex` header and are kept out of the sitemaps.

**AMENDED 2026-10-10 — one more `noindex` is allowed: a long-tail country
prefix.** *Was:* "The only `noindex` allowed is the not-found fallback for an
unknown `[slug]` and the post-submit `/thanks/*` and `/form-error/*` pages."
*Now:* that list gains a third entry — a market-scoped path under a
**long-tail** country prefix is `noindex, follow`. The clause is otherwise
untouched: every route in the enumeration above is still indexable at its bare
path, and every core country copy of it is still indexable. `follow`, not
`nofollow`, is deliberate: the links out of a long-tail page all point at
indexable pages and the equity should flow.

*Why:* 1,210 near-identical country copies of five pages, differing in a
currency figure and a country name, is exactly the thin-content pattern the
2026-09-07 decision was protecting the site from — the decision was "do not
hide real pages", not "index anything that resolves". Keeping them out of the
index is what makes publishing every country safe. Founder-approved alongside
§1. `tier` in `lib/markets.js` is the single switch, and
`scripts/seo/registry.test.mjs` asserts a long-tail page is `noindex, follow`,
self-canonical, unannotated and absent from every sitemap.

## 6. House style

- Sentence case headings. No exclamation marks. No emoji in body copy.
- Numbers are specific and sourced from the spec, never invented.
- Prefer "we" over "the platform". Say what the software does, then say what
  it does not do.
- **The product is "software", never "a CRM" (added 2026-10-12, founder
  decision; see §1).** Never write "a CRM" of our own product — "software" is
  a mass noun and takes no article. A competitor that is a CRM is still called
  one, and the CRM *category* may be named where the point is what we are
  being compared against. Slugs are exempt and must not change.
- Dark sections use `bg-navy-900` + `bp-grid-dark`; light sections alternate
  `bg-surface` / `bg-surface-2`.
- Everything must build with `npm run build` (Next.js 16, React 19, JS not TS).
- A page body lives in `components/pages/` when its route is market-scoped, and
  takes `{ market = GLOBAL_MARKET }`. One implementation, two routes. Pass every
  content object it renders through `localizeForMarket(value, market)`, and
  build every price from `content/pricing.js` through `marketMoney(market)` —
  never type a price.
  **AMENDED 2026-10-10.** *Was:* "— never type a price, and never convert
  one." *Now:* never type a price, and never convert one **anywhere except
  `lib/fx.js`**, which `marketMoney()` calls for a market whose own currency
  is not contracted. A page body still never does arithmetic on a price: it
  calls `marketMoney(market)` for the displayed figure and
  `marketContractMoney(market)` for the charged figure, and renders
  `<IndicativePriceNote market={market}/>` wherever it shows a converted one.
  *Why:* §2 as amended requires an indicative display price; keeping the rate
  in one module is what keeps that single-sourced.
  **AMENDED 2026-10-12.** The component is `<PriceFootnote market={market}/>`
  — `IndicativePriceNote` is gone — and a page body renders it **wherever it
  shows a price at all**, not only where the figure is converted. That
  includes a price quoted in prose and rewritten by `localizeForMarket`, which
  is why `/job-shop-crm` carries one under its tier-fit table. Never type a
  money string with a symbol in it either: `₹${n.toLocaleString("en-IN")}`
  looks harmless and skips the locale rules that make ₹15,00,000 group
  correctly, so every figure goes through `lib/fx.js formatMoney()`.
  *Why:* the footnote is the only statement of what is charged, and a surface
  that shows a price without it misrepresents the transaction (§2 clause 3).

## 7. Evidence gate (2026-09-23) — applies on top of §0

`docs/seo/13-usa-market-content-plan-2026-09-16.md` §15 (Astra review) found
that three rungs of the §0.4 trust ladder had no evidence behind them. Until
the evidence exists, the site does **not** claim:

| Ladder rung (§0.4) | Status | What unlocks it |
|---|---|---|
| SOC 2 Type II | No report on file. Listed as "not yet" on `/trust`. | A report: flip `compliance` in `content/brand.js`, name auditor + period on `/trust`, delete claims-guard CL-3 |
| USA data centers | False today (claims-guard CL-1: one AWS region outside the USA). | Production moves to a US region: delete CL-1 + CL-4 |
| USA-based team | Not evidenced. Removed from the verified list. | Founder confirmation |

The Enterprise compliance items carry their real `content/features.js` status
everywhere they are sold: immutable audit log **building**; SSO, multi-entity,
on-premise, PPAP, USMCA, Buy America **planned**. There is no ITAR feature, and
the site never maps its audit log to NIST control IDs or ITAR sections. Limits
for regulated work are stated once, on `/trust#regulated-work`.

`/trust` is the one security page (`/security` stays a 301 to it). No
`/security/*` compliance landing pages, regional `/for/*-<state>` pages or
`/events/*` pages are built until doc 13 §15.5 steps 1–3 are done.
`scripts/gates/claims-guard.mjs` CL-3/4/5 block regressions.
