# Entities

The entities here are **content entities**, not application records. KanchanFlow's
website has no database, so there is no User, no Workspace, no Project and no
Task to model. What exists is a published catalog, and this is its shape.

```
Brand (KanchanFlow, operated by Soor LLC)
 ├── Entity            legal name, jurisdiction, address, contacts, residency
 ├── Compliance[]      label + verified flag (+ note when not verified)
 ├── TrustBadge[]
 └── Keywords          head / wedge / explicitly rejected

Pricing
 ├── Trial             days, credit-card requirement, sample data
 ├── Tier[]            3 — Starter, Professional, Enterprise
 │    ├── per-user monthly and annual price, USD and INR
 │    ├── seat minimum and cap, platform fee
 │    └── highlights[]
 ├── AddOn[]           name, price, cadence, which plans may buy it
 ├── CreditWeight[]    AI operation -> credit cost
 ├── WhatsAppBilling   included volume and markup per plan
 ├── CeilingPolicy     warn at 80%, hard block at 100%
 └── FeatureMatrix[]   group -> rows of [capability, starter, pro, enterprise]

Feature[]              the catalog
 ├── slug, name, category
 ├── status            live | beta | building | planned
 ├── target            milestone, or null
 ├── answer            the quotable 40-60 word paragraph
 ├── capabilities[]    title + body
 ├── howItWorks[]      ordered steps
 ├── tierAvailability  what each plan gets
 └── faqs[]

Integration[]          the connector catalog
 ├── slug, name, category, market, priority
 ├── status, target, lastTested
 ├── syncTo[] / syncFrom[]   field-level, both directions
 ├── cadence, setup[], limitations[]
 ├── troubleshooting[]  error + cause + fix
 ├── related[]          sibling connector slugs
 └── faqs[]

Market[]               display currencies
 └── code, name, currency, symbol, rate, locked, billedIn

Content
 ├── BlogPost[]        published, with sections and FAQs
 ├── UpcomingPost[]    editorial calendar — titles only, no page exists
 ├── GlossaryTerm[]
 └── Release[]         changelog, newest first, with a tag

Roadmap
 └── buckets: released | beta | comingSoon | underConsideration

Partners
 ├── PartnerType[], PartnerTier[], CertificationTrack[]
 ├── PortalCapability[], ReviewCommitment
 └── DirectoryListing[]   currently empty

Site
 ├── routes[]          every URL on kanchanflow.com
 ├── schemaTypes[] / forbiddenSchemaTypes[]
 ├── metadataBudget
 └── hreflang[]
```

## Relationships that matter

- **Feature.tierAvailability must agree with Pricing.featureMatrix, row for row.**
  They are two views of one decision. When they disagree, the matrix is the one
  the developers build against.
- **A live Feature should have a Release behind it.** `kanchanflow_feature_status_check`
  uses exactly that to verify a status claim.
- **Integration.related** points at sibling connector slugs, so a connector
  answer can offer the adjacent one.
- **Feature.aliases** maps retired slugs onto current ones. `kanchanflow_get_feature`
  resolves through it and reports the redirect.
- **Site.routes** is the closed set of URLs. A URL absent from it does not exist.

## Cardinality at the current sync

Do not quote these from memory — they change. Call
`kanchanflow_list_features`, `kanchanflow_list_integrations` or read
`kanchanflow://site/features` for the live counts, each of which carries
`source.syncedAt`.
