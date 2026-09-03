# Prompts

A prompt here is a short operating procedure: which tools to call, in what order,
and what not to say. They exist because the failure mode of an AI answering a
KanchanFlow question is rarely "could not find the data" — it is "answered from
general CRM knowledge and got the feature status wrong".

Each prompt therefore opens by naming the tools that hold the truth, and closes
with the same three rules: ground every claim in a tool result, never imply
customers that do not exist, and treat feature status as load-bearing.

MCP prompt arguments are strings by protocol, so every argument below is a
string and each prompt handles an empty one by asking for it.

## `kanchanflow_answer_product_question`

**Arguments:** `question`, `audience?`

The general procedure: search, follow each result's `followUpTool`, use the
pricing tools for anything commercial, and read a connector's limitations before
answering "yes we integrate with that". Adds the house style — plain language for
a manufacturing reader, say what the software does and then what it does not.

## `kanchanflow_feature_status_check`

**Arguments:** `capability`

The check to run before a proposal, a quote or a sales email goes out. Searches
for the capability, reads `status` and `target`, and — for anything claimed live —
confirms it against the changelog, because a live feature has a shipped release
behind it. Reports capability, status, plan availability, evidence, and a plain
sentence on what a customer can and cannot do today.

## `kanchanflow_plan_recommendation`

**Arguments:** `shopProfile`, `countryCode?`

Matches a described business to a plan using the published gate matrix rather
than a guess. Instructs the model to recommend the **lowest** plan that genuinely
covers what was described, to prefer an add-on when a single ceiling is the only
thing pushing a shop upward, and to name the specific matrix rows that decided
it. Enterprise is capability-led — a large shop needing none of its capabilities
belongs on Professional, and saying so is the point.

## `kanchanflow_integration_setup_guide`

**Arguments:** `integration`, `situation?`

Produces connector setup guidance with the **limitations first** — a version
floor, a machine that must stay switched on, a one-workspace-to-one-company
constraint — because those decide whether the setup will work at all. Then the
published steps in order, then the troubleshooting entry matching any reported
error. Reports the last-tested date and flags it when stale.

## `kanchanflow_page_content_brief`

**Arguments:** `topic`, `targetKeyword?`

Briefs a new page for kanchanflow.com under the site's own build contract:
checks the URL does not already exist (a duplicate splits ranking signals),
pulls the metadata budget and the schema rules, reads the contract document, and
grounds every capability and price claim in the product tools. Specifies the
title, meta description, H1, the 40-to-60-word answer paragraph, five or more
body sections, five to seven visible FAQs, at least three internal links to
pages confirmed to exist, and the structured data to emit — never FAQPage,
Review or AggregateRating.
