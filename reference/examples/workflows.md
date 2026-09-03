# Workflows

End-to-end sequences an agent actually runs. Each is a chain of tools that exist.

## "Which KanchanFlow plan do we need?"

> "We're a 14-person machine shop. Two estimators, we quote quantity breaks, we
> sell through four regional reps, and we need our quotes in QuickBooks."

```
kanchanflow_get_pricing                              → the three plans, minimums, caps, trial
kanchanflow_compare_tiers { capability: "quantity" } → which plan has quantity breaks
kanchanflow_compare_tiers { capability: "dealer" }   → which plan has the rep channel
kanchanflow_list_integrations { query: "quickbooks" }→ status and plan availability
kanchanflow_convert_price { tierId, users: 14 }      → the monthly figure with its arithmetic
```

The answer names the matrix rows that decided it and states the seat minimum.
If only one ceiling were pushing them up a plan, `kanchanflow_get_addons` would
be the honest alternative to an upgrade.

## "Is the AI drawing reader shipping?"

```
kanchanflow_search { query: "drawing", types: ["feature"] }
kanchanflow_get_feature { slug: "drawing-ocr" }      → status
kanchanflow_get_changelog { }                        → confirm, if the status says live
```

If status is `planned`, the answer is that it is not built and no date is
published. If `building`, report the target milestone and nothing more precise
than that. This is the sequence `kanchanflow_feature_status_check` encodes.

## "Our Tally push is failing"

```
kanchanflow_get_integration { slug: "tally", sections: ["troubleshooting"] }
kanchanflow_get_integration { slug: "tally", sections: ["limitations"] }
```

Match the reported error to the troubleshooting table, give the published cause
and fix, and check the limitations for a version floor or an environment
constraint that makes the whole thing impossible rather than misconfigured.

## "Write a comparison page for /vs/some-competitor"

```
kanchanflow_list_pages { prefix: "/vs" }             → does it already exist?
kanchanflow_get_seo_rules                            → budgets, allowed and forbidden schema
kanchanflow_get_reference_document { path: "site/spec-contract.md" }
kanchanflow_list_features { status: "live" }         → only claim what is live
kanchanflow_get_pricing                              → real numbers
kanchanflow_search { query: "<the competitor>" }     → internal pages to link
```

Stop at step 1 if the page exists. Never emit FAQPage, Review or AggregateRating.
Never assert a capability that is not live. This is
`kanchanflow_page_content_brief`.

## "Draft a reply to an RFP question about compliance"

```
kanchanflow_get_company_profile                      → verified vs not-verified
kanchanflow_list_features { query: "audit" }         → what exists, and its status
kanchanflow_compare_tiers { capability: "audit" }    → which plan carries it
```

The `notVerified` list is the important one. ISO 27001 is not audited. AS9100 and
CMMC certification is never coming — KanchanFlow is the CRM, not the certifier,
and ships an immutable audit log for compliance-driven manufacturers instead.
Repeating that accurately is worth more in an RFP than a hedge.

## "Summarise what shipped last month"

```
kanchanflow_get_changelog { since: "2026-08-01" }
kanchanflow_get_roadmap                              → what is next, with no invented dates
```

Every changelog entry describes something that shipped, and none names a customer
or an adoption figure. Keep it that way in the summary.

## Onboarding a new agent to KanchanFlow

```
read  kanchanflow://reference/architecture/overview.md
read  kanchanflow://site/features
read  kanchanflow://site/pricing
call  kanchanflow_get_seo_rules
```

Two resources and one tool call give a model the product, its status mix, its
commercial shape and the rules it must not break — enough to answer most
questions without a further call.
