# Tool usage

One entry per tool, with a call worth copying. Response shapes are in
`mcp/examples.md`; this is the quick index.

## Company

```jsonc
{ "name": "kanchanflow_get_company_profile", "arguments": {} }
```
Read `compliance.notVerified` before repeating any certification claim.

## Features

```jsonc
{ "name": "kanchanflow_list_features", "arguments": { "status": "live" } }
{ "name": "kanchanflow_list_features", "arguments": { "category": "Quoting" } }
{ "name": "kanchanflow_list_features", "arguments": { "tier": "starter" } }
{ "name": "kanchanflow_list_features", "arguments": { "query": "revision", "limit": 5 } }
{ "name": "kanchanflow_get_feature",   "arguments": { "slug": "quote-editor" } }
{ "name": "kanchanflow_get_feature",   "arguments": { "slug": "quote-revisions" } }  // alias → quote-revision-diff
```

## Pricing

```jsonc
{ "name": "kanchanflow_get_pricing",    "arguments": {} }
{ "name": "kanchanflow_get_pricing",    "arguments": { "countryCode": "IN" } }
{ "name": "kanchanflow_compare_tiers",  "arguments": { "group": "Seats & limits" } }
{ "name": "kanchanflow_compare_tiers",  "arguments": { "capability": "WhatsApp" } }
{ "name": "kanchanflow_get_addons",     "arguments": {} }
{ "name": "kanchanflow_get_ai_credits", "arguments": {} }
```

## Integrations

```jsonc
{ "name": "kanchanflow_list_integrations", "arguments": { "category": "Accounting" } }
{ "name": "kanchanflow_list_integrations", "arguments": { "status": "live", "market": "India" } }
{ "name": "kanchanflow_get_integration",   "arguments": { "slug": "tally" } }
{ "name": "kanchanflow_get_integration",   "arguments": { "slug": "tally", "sections": ["setup"] } }
```

## Markets

```jsonc
{ "name": "kanchanflow_list_markets",  "arguments": {} }
{ "name": "kanchanflow_convert_price", "arguments": { "countryCode": "AE", "amountUsd": 49 } }
{ "name": "kanchanflow_convert_price", "arguments": { "countryCode": "US", "tierId": "enterprise", "billing": "annual", "users": 40 } }
```

## Editorial

```jsonc
{ "name": "kanchanflow_list_blog_posts",     "arguments": {} }
{ "name": "kanchanflow_get_blog_post",       "arguments": { "slug": "rfq-response-time-benchmark" } }
{ "name": "kanchanflow_list_glossary_terms", "arguments": {} }
{ "name": "kanchanflow_get_glossary_term",   "arguments": { "slug": "rfq" } }
{ "name": "kanchanflow_get_changelog",       "arguments": { "since": "2026-08-01" } }
{ "name": "kanchanflow_get_changelog",       "arguments": { "tag": "Integration" } }
{ "name": "kanchanflow_get_roadmap",         "arguments": {} }
```

## Partners

```jsonc
{ "name": "kanchanflow_get_partner_program", "arguments": {} }
{ "name": "kanchanflow_get_partner_program", "arguments": { "section": "tiers" } }
```

## Website

```jsonc
{ "name": "kanchanflow_list_pages",   "arguments": { "prefix": "/integrations" } }
{ "name": "kanchanflow_get_seo_rules","arguments": {} }
```

## Discovery

```jsonc
{ "name": "kanchanflow_search", "arguments": { "query": "GST" } }
{ "name": "kanchanflow_search", "arguments": { "query": "revision", "types": ["feature", "glossary"], "limit": 5 } }
```

## Reference

```jsonc
{ "name": "kanchanflow_list_reference_documents", "arguments": {} }
{ "name": "kanchanflow_list_reference_documents", "arguments": { "section": "mcp" } }
{ "name": "kanchanflow_get_reference_document",   "arguments": { "path": "mcp/security.md" } }
{ "name": "kanchanflow_search_reference",         "arguments": { "query": "rate limit" } }
```

## Habits worth keeping

1. **Search first** when the collection is not obvious. Every result names its
   `followUpTool`.
2. **Check status** before calling anything available.
3. **Read `basis`** before quoting a converted price.
4. **Use `didYouMean`** on a miss instead of guessing again.
5. **Watch `source.syncedAt`.** If it is old, say the answer reflects a snapshot
   of that date.
