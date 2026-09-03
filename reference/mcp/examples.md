# Examples

Real calls against the tools that exist, with real response shapes. Values come
from the mirror and change when the website changes — the shapes do not.

## Is a capability available today?

```jsonc
// 1. find it
{ "name": "kanchanflow_search", "arguments": { "query": "drawing OCR", "types": ["feature"] } }
```
```jsonc
{ "success": true, "data": {
  "query": "drawing OCR", "total": 1, "returned": 1,
  "results": [{
    "type": "feature", "slug": "drawing-ocr", "title": "AI drawing OCR",
    "status": "planned", "snippet": "…", "url": "/features/drawing-ocr",
    "score": 100, "followUpTool": "kanchanflow_get_feature" }] } }
```
```jsonc
// 2. read the record
{ "name": "kanchanflow_get_feature", "arguments": { "slug": "drawing-ocr" } }
```

`status` is `planned`. The correct answer is that KanchanFlow does not do this
today and has published no date for it. Not "yes, with AI drawing OCR".

## Which plan does this shop need?

```jsonc
{ "name": "kanchanflow_compare_tiers", "arguments": { "capability": "dealer" } }
```

Returns only the matrix rows whose capability mentions dealers, across all three
plans, so the answer names the row that decided it rather than a vague "you'll
want Professional".

Then price it:

```jsonc
{ "name": "kanchanflow_convert_price",
  "arguments": { "countryCode": "US", "tierId": "professional", "users": 12 } }
```
```jsonc
{ "success": true, "data": {
  "input": { "tierId": "professional", "billing": "monthly", "users": 12, "assumedMinimumSeats": false },
  "countryCode": "US", "currency": "USD",
  "perUserPerMonth": { "value": 49, "exact": true, "display": "$49" },
  "platformFeePerMonth": null,
  "monthlyTotal": { "value": 588, "exact": true, "display": "$588",
                    "arithmetic": "$49 x 12 seats" },
  "note": "Monthly rate, billed monthly.",
  "basis": "USD is the contract currency." } }
```

`arithmetic` is there so the working can be shown rather than asserted.

## A converted currency

```jsonc
{ "name": "kanchanflow_get_pricing", "arguments": { "countryCode": "GB" } }
```

Every figure comes back `"exact": false`, and `currency.basis` reads:

> GBP figures are indicative, converted from the USD list price at a fixed
> reference rate set 2026-09-01. Contracts and invoices are in USD.

Quote the figure and that sentence together. A converted price presented as a
contracted one is the kind of small error that becomes a large conversation.

## Connector setup, limitations first

```jsonc
{ "name": "kanchanflow_get_integration",
  "arguments": { "slug": "tally", "sections": ["limitations", "setup"] } }
```

`limitations` carries the version floor and the fact that the bridge machine must
be on the same network as Tally and switched on. Those decide whether the setup
is possible at all, so they belong before step 1, not in a footnote.

## Troubleshooting a real error

```jsonc
{ "name": "kanchanflow_get_integration",
  "arguments": { "slug": "tally", "sections": ["troubleshooting"] } }
```
```jsonc
{ "success": true, "data": { "troubleshooting": [
  { "error": "Push rejected: Ledger does not exist",
    "cause": "The customer has no GSTIN, so no Sundry Debtors ledger could be matched…",
    "fix":   "Add the GSTIN to the customer record, or turn on Create missing ledgers…" } ] } }
```

Give the published cause and fix. Do not improvise a third step.

## A miss, handled well

```jsonc
{ "name": "kanchanflow_get_feature", "arguments": { "slug": "quote-buildr" } }
```
```jsonc
{ "success": false, "error": {
  "code": "NOT_FOUND",
  "message": "No KanchanFlow feature with slug \"quote-buildr\".",
  "details": { "didYouMean": ["quote-editor", "quote-revision-diff"] } } }
```

Retry with a suggestion, or search the user's original wording. Do not answer
from general knowledge as if it were a KanchanFlow fact.

## A term the product does not cover

```jsonc
{ "name": "kanchanflow_search", "arguments": { "query": "payroll" } }
```
```jsonc
{ "success": true, "data": { "query": "payroll", "total": 0, "returned": 0, "results": [],
  "note": "KanchanFlow publishes nothing matching \"payroll\". Do not answer from general knowledge as if it were a KanchanFlow fact." } }
```

That is an answer, not a failure. KanchanFlow is a CRM, not an ERP or a payroll
system, and the honest reply says so.

## Path traversal, refused

```jsonc
{ "name": "kanchanflow_get_reference_document", "arguments": { "path": "../../.env" } }
```
```jsonc
{ "success": false, "error": {
  "code": "VALIDATION_ERROR",
  "message": "Reference paths may not traverse outside the reference root." } }
```

## Before writing a page for the site

```jsonc
{ "name": "kanchanflow_list_pages", "arguments": { "prefix": "/features", "query": "quote" } }
{ "name": "kanchanflow_get_seo_rules", "arguments": {} }
{ "name": "kanchanflow_get_reference_document", "arguments": { "path": "site/spec-contract.md" } }
```

The first tells you whether the page already exists — if it does, stop, because a
duplicate splits ranking signals. The second gives the metadata budget and the
forbidden schema types. The third is the site's own contract, synced verbatim.
