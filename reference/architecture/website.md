# The KanchanFlow website

The source of every fact this MCP server serves.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router |
| UI | React 19, JavaScript (not TypeScript) |
| Styling | Tailwind CSS 3.4 with CSS-variable light and dark themes |
| Motion | Framer Motion, all helpers honour `prefers-reduced-motion` |
| Fonts | Sora (display), Inter (body), IBM Plex Mono (technical labels) |
| Output | `output: "standalone"` — a self-contained Node server bundle |
| Node | >= 22 |

## Content is data

Page copy lives in `content/`, not in JSX. Each collection is a plain ES module
exporting arrays and lookup helpers:

| File | Owns |
|---|---|
| `content/brand.js` | Soor LLC canonical facts, positioning, compliance list, navigation, footer, hreflang policy, keyword architecture |
| `content/pricing.js` | Three plans, the full feature-gate matrix, add-on catalog, AI credit weights, WhatsApp billing, ceiling policy |
| `content/features.js` | The feature catalog, each with a truthful status, target milestone and per-plan availability |
| `content/integrations.js` | Connectors: what syncs each way, setup steps, limitations, troubleshooting, last end-to-end test date |
| `content/countries.js` | The display markets, their currencies and the dated reference rates |
| `content/changelog.js` | Release history and the roadmap buckets |
| `content/blog.js`, `content/glossary.js`, `content/partners.js` | Editorial and partner-program content |

This is what makes an honest MCP server possible. The server does not scrape
rendered HTML or re-describe the product in its own words; it reads the same
modules the pages read.

## Shared machinery

- `lib/seo.js` — `buildMetadata()` produces every page's canonical URL, the
  hreflang set and the social card. The set is generated from `lib/markets.js`: `en`, one `en-XX` per published indexable market, and `x-default`.
- `lib/schema.js` — JSON-LD builders: Organization, WebSite,
  SoftwareApplication, BreadcrumbList, Article, HowTo, ItemList. There is
  deliberately no `faqSchema` export.
- `components/site/primitives.js` — the page primitives every route composes:
  `PageHero`, `AnswerBlock`, `Section`, `DataTable`, `CheckList`, `FactGrid`,
  `RelatedLinks`, `CtaBand`, `StatusBadge`, `TrustBadgeRow`, `Breadcrumbs`.
- `components/site/FaqAccordion.js` — visible FAQs, emitting no structured data.
- `scripts/gen-seo-files.mjs` — writes `sitemap.xml` and `robots.txt` at build
  time from the same content collections.
- `scripts/seo-lengths.mjs` — re-checks every title and meta description against
  the SERP budget.

## The page contract

Every marketing route declares `export const dynamic = "force-static"` and
renders, in order: hero with breadcrumb and H1, a 40-to-60-word quotable answer
block inside the first 100 words, body sections, five to seven visible FAQs,
at least three internal cross-links, a closing CTA, and JSON-LD comprising a
breadcrumb plus the page-appropriate type.

`site/spec-contract.md` carries the contract in full, including the guardrails.
`kanchanflow_get_seo_rules` returns the machine-readable summary.

## What the website does not have

Worth stating plainly, because it explains the shape of this MCP server:

- No application database.
- No user accounts, sessions or authentication.
- No customer, workspace, project, task or workflow records.
- No API beyond `/api/health`, a trivial container liveness probe.

The form endpoints named in the README (`/api/demo`, `/api/contact`,
`/api/partners/apply`, `/api/newsletter`) are a later phase. The field names are
settled; the handlers are not built. No MCP tool claims to submit to them.
