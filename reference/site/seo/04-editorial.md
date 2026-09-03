<!-- SYNCED COPY. Source of truth: docs/seo/04-editorial.md in the KanchanFlow website repository.
     Regenerate with `npm run sync`. Do not edit this copy by hand. -->

# 04 — Editorial, E-E-A-T and links

Sections M (Blog / editorial strategy), Q (E-E-A-T strategy), R (Backlink and
digital PR strategy).

---

## M. Blog and editorial strategy

### M.1 What the data says about educational content here

MRPeasy is the proof case and the warning. They pull ~24,000 US organic visits a
month — roughly 17× the category leader in quoting — and almost none of it comes
from CRM content. It comes from manufacturing-operations education:

| MRPeasy page | Visits/mo | Top keyword | Vol |
|---|---:|---|---:|
| `/blog/discrete-manufacturing-vs-process-manufacturing/` | 567 | discrete manufacturing | 1,000 |
| `/blog/mass-production/` | 325 | mass production | 21,000 |
| `/blog/on-time-in-full-otif/` | 279 | otif supply chain | 800 |
| `/blog/manufacturing-pmi/` | 257 | pmi meaning | 20,000 |
| `/blog/bill-of-materials/` | 211 | bill of materials example | 800 |
| `/free-master-production-schedule/` | 196 | production schedule template | 700 |
| `/blog/abc-analysis/` | 161 | abc analysis | 2,500 |
| `/blog/production-planning-excel/` | 186 | manufacturing production schedule template | 200 |

The pattern: **define a term the industry uses, or give away a template.** No
page on that list mentions CRM.

The warning: this traffic converts poorly. A student searching "mass production"
is not buying quoting software. MRPeasy can afford it because they sell a
broader product to a broader market. At our size, editorial should be aimed
narrowly at the estimator and the owner, and measured on assisted conversions,
not sessions.

### M.2 The editorial rule

**Every post must be something only a person who has watched shops quote could
write.** No "5 benefits of CRM" posts — `benefits of crm in manufacturing`
returns zero volume, which is Google telling us nobody wants it.

Three post types only:

1. **Definition posts** on terms our buyer actually looks up, written better and
   more concretely than the incumbents.
2. **Original data** from the RFQ Analyzer and, later, from anonymised product
   telemetry. This is the only content type that earns links.
3. **Templates and calculators** that a shop can use today without buying
   anything.

### M.3 The first twelve months, in priority order

| # | Post | Primary keyword | Vol | KD | Type | Priority |
|---:|---|---|---:|---:|---|---|
| 1 | ERP vs CRM for manufacturers: which one you actually need first | crm vs erp | 900 | 12 | Definition | P1 |
| 2 | RFQ vs RFP vs RFI: what each one asks a shop for *(expand `/glossary/rfq`)* | rfq vs rfp | 1,300 | n/a | Definition | P1 |
| 3 | The RFQ process, step by step, in a job shop | rfq process | 300 | n/a | Definition | P2 |
| 4 | ROM quotes: when a budgetary number wins the job | rom quote | 250 | n/a | Definition | P2 |
| 5 | Bill of materials for people who quote, not people who build | bill of materials | 6,900 | n/a | Definition | P2 |
| 6 | What a manufacturing quote should contain: a template | *(template)* | — | — | Template | P2 |
| 7 | RFQ response time: what the data says *(exists — refresh annually)* | — | — | Original data | P1 |
| 8 | Discrete vs process manufacturing, and why quoting differs | discrete manufacturing | 1,000 | n/a | Definition | P3 |
| 9 | Manufacturing KPIs a two-person sales team can actually track | manufacturing kpis | 350 | n/a | Definition | P3 |
| 10 | Quote follow-up: the cadence that recovers dead quotes | quote follow up | 30 | n/a | Definition | P3 |
| 11 | What CRM implementation actually takes at a 40-person shop | crm implementation | 2,000 | n/a | Definition | P3 |
| 12 | Cost buildup: the four columns and what belongs in each | *(long tail)* | — | — | Definition | P3 |

Posts 5, 8 and 11 target high-volume generic terms. Include them only if written
from the shop's point of view — "bill of materials for people who quote" is a
different article from MRPeasy's, and it links naturally to the quoting pillar.
If a draft reads like a definition anyone could have written, kill it.

### M.4 Content quality standard

`SPEC-CONTRACT.md` §3 already sets the house style. The nine questions from the
master prompt map onto the page template as follows, and every editorial piece
must answer all nine:

| Question | Where it lives |
|---|---|
| What problem is the reader solving? | `AnswerBlock`, first 100 words |
| What do they need to know? | First two `Section` blocks |
| What alternatives exist? | A `DataTable` comparing approaches, including "keep using Excel" |
| What mistakes should they avoid? | A dedicated H2 — this is where manufacturing literacy shows |
| What implementation considerations matter? | H2 with real timeframes |
| How does this relate to manufacturing? | Every example. No generic SaaS examples, ever |
| When is this appropriate? | H2 |
| When is it **not** appropriate? | H2 — mandatory, and the most trust-building section on any page |
| What next? | `RelatedLinks` + `CtaBand` |

Word count follows the existing 900–1,600 guideline, and only where the SERP
justifies it. `/glossary/rfq` answering `rfq vs rfp` does not need 1,600 words;
it needs a clear table and a worked example. Length is never a target.

---

## Q. E-E-A-T strategy

### Q.1 The starting position

Zero named customers. Zero third-party reviews. Zero case studies. One year old.
A Delaware LLC with a Lewes, DE registered address — a form that a sceptical
reader recognises. `SPEC-CONTRACT.md` forbids fabricating any of the missing
signals, which is correct and also removes the easy options.

So the E-E-A-T strategy is built on the four things that are actually true and
actually verifiable.

### Q.2 The four real signals

**1. Radical product honesty, as a ranking asset.**
The site already ships something almost no competitor does: 47 features with
public `live` / `beta` / `building` / `planned` status, a public changelog, a
public roadmap, and a `/whats-shipping` page. The `/features/manufacturing-cpq`
page says its estimating engine is "roughly 30 percent complete". That is a
stronger expertise signal than a testimonial, because it is checkable and
costly to fake.

**Action:** make it legible to a first-time reader and to a crawler. Add a
"What this page claims, and what is still building" summary block to every
`building` feature page, and surface the feature-truth count on `/trust`
("18 live, 20 building, 9 planned, updated [date]").

**2. Named authorship with real, checkable credentials.**
No invented personas. If the founder wrote it, the byline is the founder, with a
bio that says exactly what they have done and does not imply shop-floor
experience they do not have. If a shop owner reviewed a page, name them with
their permission and their company, and say what they reviewed.

`Person` schema on author pages, `Article` schema (already exported from
`lib/schema.js`) on editorial with `author` populated. Do not add `Person`
schema for a persona that does not exist.

**3. Original data nobody else has.**
`/free-tool/rfq-analyzer` and `/blog/rfq-response-time-benchmark` already exist.
This is the highest-leverage E-E-A-T asset on the site, because it produces
first-party evidence rather than restated research. Publish the methodology
alongside the numbers: sample size, date range, how the sample was collected,
what it excludes.

**4. Transparent sourcing on everything secondhand.**
The research document itself models this — it lists all 19 sources consulted so
"any specific claim can be independently re-verified". Copy that pattern:
`/best-crm-for-manufacturing` and every `/vs/*` page carries a sources block
with live links and a checked-on date.

### Q.3 Labelling: five kinds of claim, visually distinct

Readers and quality raters both need to see which is which. Use a consistent
visual treatment for each:

| Kind | Example | Treatment |
|---|---|---|
| **Original KanchanFlow research** | RFQ response-time benchmark | Full methodology block; sample size and dates stated |
| **Third-party research** | "CalcuQuote publishes a 2–4 hours → 5–10 minutes quoting benchmark" | Named source, linked, dated. Never restated as our own result |
| **Product claim** | "Unlimited revision history on every tier" | Must be checkable in the trial; carries a status badge if not `live` |
| **Expert opinion** | "Most shops lose more margin to setup time than to material" | Attributed to a named person |
| **Editorial interpretation** | "Which suggests the mid-market is under-served" | Written in the first person plural, clearly marked as our reading |

### Q.4 Last-reviewed dates

Required on: every comparison page, every pricing page, `/whats-shipping`,
`/roadmap`, every feature page with a non-`live` status, and every editorial
post making a market claim. Emit `dateModified` in `Article` schema and show it
in the page. A stale competitor price is a factual error, and in a category
where the research document itself warns that "public list prices change
frequently", it is the most likely error on the site.

### Q.5 Screenshots and figures

`SPEC-CONTRACT.md` guardrail 10 already requires every figure to be described
rather than faked, and the repo has `scripts/gen-figures.mjs` and
`gen-screenshots.mjs`. Two SEO additions: descriptive `alt` text that states
what the screen shows rather than the page's keyword, and a visible caption
naming the feature and its status — so a `building` feature's screenshot cannot
be mistaken for something shipping today.

---

## R. Backlink and digital PR strategy

### R.1 The gap, quantified

DR 0, no referring domains. The pages we are competing with carry 0–7 backlinks
each — SecturaFAB ranks #8 for `quoting software for manufacturing` with **one**
backlink to that URL. Paperless Parts' homepage has 2,243, but its *ranking
page* strength is modest.

**The implication:** we do not need hundreds of links. We need enough domain
authority to be a plausible result — realistically 25–50 quality referring
domains in year one — plus a handful of links to the specific pages we want to
rank.

### R.2 The linkable assets, in build order

**1. The RFQ Analyzer (`/free-tool/rfq-analyzer`) — already built.**
Free tools earn links in manufacturing because trade publications and
association newsletters like something their readers can use. Promote it as a
tool, not as a lead magnet: no email gate on the result. Gate the *saved report*
if a gate is needed.

**2. The RFQ Response Time Benchmark — already published, needs scale.**
This is the asset with the highest ceiling. Turn it into an annual, cited study:
a stated sample, a stated method, a downloadable dataset, a chart people can
embed with attribution. "The average US job shop takes N days to return a quote"
is exactly the kind of number a trade journalist reaches for.

**3. A quote template pack.** A cost buildup spreadsheet, a quote letter, an
RFQ intake checklist. MRPeasy's free production-schedule template pulls 196
visits a month and accumulates links passively.

**4. A shop-rate calculator.** Machine hour rate from overhead, labour,
depreciation and utilisation. High utility, high embed potential, and it makes
the four-column cost buildup concrete without claiming a feature.

**5. The feature-truth audit as a public artefact.** "Here is every feature we
ship, every one we are building, and the date we last checked." Publishing that
as a standing, dated page is unusual enough in B2B SaaS to be worth a mention.

### R.3 Outreach that is allowed

- **Manufacturing trade publications and newsletters** — pitch the benchmark
  data, not the product. Modern Machine Shop, The Fabricator, Production
  Machining, IndustryWeek and their newsletters.
- **Trade associations** — NTMA, PMA, AMT and regional chapters. Many run
  member-resource pages that link to genuinely useful free tools.
- **Podcast and video appearances** in the machining and fabrication community,
  where the founder can talk about quoting workflow honestly.
- **Reddit and community presence — as a participant, not a link-dropper.**
  Reddit ranks #2 for `manufacturing crm` (UR 0) and #3 for `quoting software
  for manufacturing`. r/Machinists, r/manufacturing and r/CRMSoftware threads
  are literally the competition. Being a known, useful, disclosed voice there is
  worth more than most link building, and it is also market research.
- **Software directories** — G2, Capterra, Software Advice. Genuine listings
  only, and no soliciting reviews in a way that violates their terms. Note that
  guardrail 2 forbids putting review data into schema regardless.
- **Integration partner pages** — QuickBooks, Zoho, Stripe and WhatsApp partner
  and marketplace listings are legitimate, relevant links we have earned by
  building the integration.
- **Digital PR on original data only.** A press release about a product launch
  from an unknown company earns nothing. A press release with a number in it
  might.

### R.4 Explicitly forbidden

No paid links. No private blog networks. No mass guest-post placements. No
directory blasts. No automated outreach. No AI-generated guest posts. No
reciprocal-link schemes. No buying reviews.

### R.5 A realistic year-one target

| Quarter | Referring domains | Source |
|---|---:|---|
| Q1 | 5–10 | Integration partner listings, directories, founder profile |
| Q2 | 15–25 | RFQ benchmark launch, first trade-publication pickup |
| Q3 | 25–40 | Template pack, calculator, association resource pages |
| Q4 | 40–60 | Annual benchmark refresh, podcast and community presence |

DR is a lagging indicator; the leading indicator is whether the ranking pages
for our six P0 keywords have picked up one or two relevant links each. Track
that, not the domain-level number.
