# Resources

Resources are the "load the whole collection once" surface, for a client that
would rather hold context than call a tool per question. Two families.

## Site resources — `kanchanflow://site/<name>`

JSON slices of the content mirror. Each wraps its payload with the sync
provenance:

```json
{ "source": { "syncedAt": "...", "siteUrl": "https://kanchanflow.com" }, "data": { } }
```

| URI | Holds |
|---|---|
| `kanchanflow://site/company` | Brand positioning, Soor LLC entity facts, compliance with verified flags, trust badges, social profiles |
| `kanchanflow://site/features` | Every feature with status, target, category, lead and per-plan availability |
| `kanchanflow://site/pricing` | Plans, trial, add-ons, credit weights, WhatsApp billing, ceiling policy, the full gate matrix |
| `kanchanflow://site/integrations` | Every connector with category, market, status, last-tested date and plan availability |
| `kanchanflow://site/markets` | The seven display markets, currencies, dated rates, contracted flags |
| `kanchanflow://site/changelog` | Shipped releases newest first, plus the roadmap buckets |
| `kanchanflow://site/url-map` | Every route on kanchanflow.com |
| `kanchanflow://site/seo-contract` | Metadata budgets, emitted and forbidden schema types, hreflang policy, keyword architecture |

These are **named slices, not a key expression**. A URI selects one of eight
predefined readers over the mirror. There is no way to construct a URI that
reads something else, which is what keeps configuration and environment values
out of reach.

## Reference resources — `kanchanflow://reference/<path>`

Every document in `reference/` is advertised as its own resource, markdown for
`.md` and JSON for `.json`. The URI path is the document path exactly as
`kanchanflow_list_reference_documents` reports it, for example:

```
kanchanflow://reference/mcp/security.md
kanchanflow://reference/architecture/overview.md
kanchanflow://reference/site/spec-contract.md
```

Reads go through the same loader the tools use, so the traversal and size limits
apply identically.

## Resources or tools?

Use a **resource** when you want the whole collection as context — a client that
attaches `kanchanflow://site/features` at the start of a long conversation about
the product does not need to call a tool for each question afterwards.

Use a **tool** when you have a specific question. Tools filter, paginate,
resolve aliases, suggest close slugs on a miss, and return the derived answer
rather than the raw collection. `kanchanflow_convert_price` in particular does
arithmetic no resource can.
