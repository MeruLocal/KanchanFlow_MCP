# Content schema

The shape of `data/site-mirror.json`. Types are in `src/data/types.ts`.

## Top level

```jsonc
{
  "meta":         { "mirrorVersion", "syncedAt", "sourceRepo", "sourceCommit", "siteUrl", "note" },
  "brand":        { /* brand + entity + compliance + trustBadges + social + locales + keywords */ },
  "navigation":   { "primary": [...], "footer": [...], "legal": [...] },
  "pricing":      { "trial", "tiers", "annualDiscountPct", "addOns", "creditWeights",
                    "creditAllowance", "whatsappBilling", "ceilingPolicy", "featureMatrix", "faqs" },
  "features":     { "indiaFraming", "items", "categories", "statusCounts", "aliases" },
  "integrations": { "items", "categories", "testing" },
  "markets":      { "ratesAsOf", "defaultCountry", "countries" },
  "blog":         { "author", "cadence", "posts", "upcoming" },
  "glossary":     { "terms" },
  "changelog":    { "cadence", "tags", "releases", "roadmap" },
  "partners":     { "types", "tiers", "guardrails", "certificationTracks", "portalCapabilities",
                    "reviewCommitment", "directoryListings", "faqs" },
  "site":         { "routes", "routeCount", "schemaTypes", "forbiddenSchemaTypes",
                    "metadataBudget", "hreflang" }
}
```

## Feature

```jsonc
{
  "slug": "quote-editor",
  "name": "Quote editor",
  "h1": "...", "metaTitle": "...", "metaDescription": "...",
  "category": "Quoting",
  "status": "live",            // live | beta | building | planned
  "target": null,              // milestone string when status is building
  "wave": 1,
  "lead": "one sentence",
  "answer": "the quotable 40-60 word paragraph",
  "primaryKeyword": "...", "secondaryKeywords": ["..."],
  "summary": ["paragraph", "paragraph"],
  "capabilities": [{ "title": "...", "body": "..." }],
  "howItWorks":   [{ "name": "...", "text": "..." }],
  "tierAvailability": { "starter": "...", "professional": "...", "enterprise": "..." },
  "screenshots": [{ "caption": "...", "note": "..." }],
  "faqs": [{ "q": "...", "a": "..." }]
}
```

`status` is the field to read before describing a capability as available.

## Integration

```jsonc
{
  "slug": "tally",
  "name": "Tally & TallyPrime",
  "category": "Accounting",
  "market": "India",
  "priority": "P0",
  "status": "live",
  "lastTested": "2026-08-27",       // a human ran the sync end to end on this date
  "tagline": "...", "answer": "...",
  "syncTo":   [{ "field": "Sales order voucher", "detail": "..." }],
  "syncFrom": [{ "field": "Payment received",    "detail": "..." }],
  "cadence": "Every 15 minutes, or on demand",
  "setup": ["step", "step"],
  "limitations": ["the version floor", "the machine that must stay on"],
  "troubleshooting": [{ "error": "...", "cause": "...", "fix": "..." }],
  "related": ["zoho-books"],
  "tiers": "which plans include it"
}
```

`limitations` is not small print. It carries the constraints that decide whether
a connector will work at all, and belongs before the setup steps in any guidance.

## Tier and the feature matrix

```jsonc
{ "id": "professional", "name": "Professional",
  "monthlyUsd": 49, "annualUsd": 41, "monthlyInr": 4500, "annualInr": 3700,
  "minUsers": 3, "maxUsers": 100, "platformFeeUsd": 0,
  "popular": true, "tagline": "...", "bestFor": "...", "highlights": ["..."] }
```

```jsonc
{ "group": "Seats & limits",
  "rows": [ ["Users", "3–10", "3–100", "5+ unlimited"] ] }
```

Row order is `[capability, Starter, Professional, Enterprise]`. A dash means the
capability is not available on that plan — it does not mean "coming later".

## Market

```jsonc
{ "code": "IN", "name": "India", "currency": "INR", "symbol": "₹",
  "rate": 83.5, "locked": true, "billedIn": "INR" }
```

`locked: true` means the price is contracted in that currency. Everything else is
an indicative conversion at the fixed reference rate dated by `markets.ratesAsOf`
and billed in USD. `src/tools/pricing.ts` reproduces the website's own conversion
and rounding functions exactly, so a converted figure matches what a visitor sees.

## Release

```jsonc
{ "date": "2026-08-25", "title": "...", "tag": "New feature", "body": "what shipped" }
```

Tags come from a fixed vocabulary: New feature, Improvement, Bug fix,
Integration, Compliance. No entry names a customer or an adoption figure.
