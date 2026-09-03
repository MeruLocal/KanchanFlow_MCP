/**
 * MCP prompts.
 *
 * A prompt here is a short operating procedure: which tools to call, in what
 * order, and what not to say. They exist because the failure mode of an AI
 * answering a KanchanFlow question is not "cannot find the data" — it is
 * "answered from general CRM knowledge and got the feature status wrong".
 * Every prompt therefore starts by naming the tools that hold the truth.
 *
 * MCP prompt arguments are strings by protocol, so each argument is a string
 * schema and the guidance handles an empty value.
 */

import { z } from "zod";

export interface PromptDefinition {
  name: string;
  title: string;
  description: string;
  argsSchema: Record<string, z.ZodType<string | undefined>>;
  build: (args: Record<string, string | undefined>) => string;
}

const TRUTH_RULE = [
  "Ground every claim in a tool result. If the tools return nothing on a point, say KanchanFlow does not publish that, and do not fill the gap from general knowledge about CRMs.",
  "KanchanFlow has no named customers, testimonials, case studies or review scores. Never imply otherwise.",
  "Feature status is load-bearing: live means production today; beta means customer tested; building carries a target milestone; planned has no date. Never describe a building or planned feature as available.",
].join("\n");

export const prompts: PromptDefinition[] = [
  {
    name: "kanchanflow_answer_product_question",
    title: "Answer a question about KanchanFlow",
    description:
      "A procedure for answering any question about what KanchanFlow is, does, costs or connects to, grounded only in what the product actually publishes.",
    argsSchema: {
      question: z.string().describe("The question to answer."),
      audience: z
        .string()
        .optional()
        .describe("Who is asking, e.g. 'a shop owner evaluating us' or 'an existing customer'."),
    },
    build: ({ question, audience }) =>
      [
        `Answer this question about KanchanFlow: ${question ?? "(no question supplied — ask for one)"}`,
        audience ? `\nThe reader is: ${audience}.` : "",
        "\nProcedure:",
        "1. Call kanchanflow_search with the key term from the question to find which collection holds the answer.",
        "2. Follow each result's followUpTool for the full record — kanchanflow_get_feature, kanchanflow_get_integration, kanchanflow_get_glossary_term and so on.",
        "3. For anything about price, call kanchanflow_get_pricing, and kanchanflow_compare_tiers when the question is 'is X included in plan Y'.",
        "4. For 'do you integrate with X', call kanchanflow_list_integrations first and read the limitations from kanchanflow_get_integration before answering yes.",
        "\nRules:",
        TRUTH_RULE,
        "Write plainly for a manufacturing reader. No SaaS buzzwords. Say what the software does, then say what it does not do.",
        "Quote a converted currency figure only with the basis sentence the pricing tool returns alongside it.",
      ]
        .filter(Boolean)
        .join("\n"),
  },

  {
    name: "kanchanflow_feature_status_check",
    title: "Check whether a KanchanFlow capability exists today",
    description:
      "A procedure for verifying that a capability is genuinely live before it is described as available — the check to run before a proposal, a quote or a sales email goes out.",
    argsSchema: {
      capability: z.string().describe("The capability to verify, in the asker's own words."),
    },
    build: ({ capability }) =>
      [
        `Determine whether KanchanFlow can do this today: ${capability ?? "(no capability supplied — ask for one)"}`,
        "",
        "Procedure:",
        "1. kanchanflow_search with the capability wording, restricted to types ['feature','integration','changelog'].",
        "2. kanchanflow_get_feature on the closest match. Read `status` and `target`.",
        "3. If status is 'live', confirm it against kanchanflow_get_changelog — a live feature has a shipped release entry behind it.",
        "4. If status is 'building' or 'planned', report exactly that, with the target milestone if one exists, and do not offer a date the tools did not give you.",
        "5. Check `tierAvailability` so the answer names which plans include it.",
        "",
        "Report in this shape: capability, status, plan availability, evidence (the release entry or the feature page), and a plain sentence on what a customer can and cannot do with it today.",
        "",
        TRUTH_RULE,
      ].join("\n"),
  },

  {
    name: "kanchanflow_plan_recommendation",
    title: "Recommend a KanchanFlow plan for a described shop",
    description:
      "A procedure for matching a described manufacturing business to Starter, Professional or Enterprise using the published gate matrix rather than a guess.",
    argsSchema: {
      shopProfile: z
        .string()
        .describe("The shop: headcount, what they make, how they quote, channels, compliance needs."),
      countryCode: z.string().optional().describe("Display market for prices: US, IN, GB, AU, AE, SG or NZ."),
    },
    build: ({ shopProfile, countryCode }) =>
      [
        `Recommend a KanchanFlow plan for this business: ${shopProfile ?? "(no profile supplied — ask for one)"}`,
        "",
        "Procedure:",
        `1. kanchanflow_get_pricing${countryCode ? ` with countryCode "${countryCode}"` : ""} for the plans, minimums, caps and trial terms.`,
        "2. kanchanflow_compare_tiers for the gate matrix. Use `capability` to check the specific things this shop said it needs.",
        "3. kanchanflow_get_addons where a single ceiling is the only thing pushing them up a plan — an add-on is usually the honest answer.",
        `4. kanchanflow_convert_price with the seat count for a monthly figure${countryCode ? "" : " in USD"}.`,
        "",
        "Rules:",
        "Recommend the lowest plan that genuinely covers what they described. Enterprise is capability-led — multi-entity, SSO, ITAR/PPAP/USMCA, custom residency — not simply 'bigger'. A large shop with none of those belongs on Professional, and saying so is the point.",
        "Name the specific matrix rows that decided it.",
        "State the seat minimum and cap for the plan you recommend.",
        "If the shop needs something no plan provides, say so plainly.",
        TRUTH_RULE,
      ].join("\n"),
  },

  {
    name: "kanchanflow_integration_setup_guide",
    title: "Walk through setting up a KanchanFlow connector",
    description:
      "A procedure for producing accurate setup guidance for one connector, including the limitations that decide whether it will work at all.",
    argsSchema: {
      integration: z.string().describe("Connector name or slug, e.g. 'tally'."),
      situation: z.string().optional().describe("What the user is trying to do, or the error they hit."),
    },
    build: ({ integration, situation }) =>
      [
        `Produce setup guidance for the KanchanFlow ${integration ?? "(connector not supplied — ask which one)"} connector.`,
        situation ? `The user's situation: ${situation}` : "",
        "",
        "Procedure:",
        "1. kanchanflow_list_integrations to resolve the slug and read the status and last-tested date.",
        "2. kanchanflow_get_integration for the setup steps, the sync tables, the limitations and the troubleshooting entries.",
        "3. Lead with the limitations that could stop this working — a version floor, a machine that must stay switched on, a one-workspace-to-one-company constraint. Those belong before the steps, not after.",
        "4. Give the numbered setup steps as published, without reordering or inventing one.",
        situation ? "5. Match the reported error against the troubleshooting table and give the published cause and fix." : "",
        "",
        "Rules:",
        "Report the last-tested date. If it looks stale, say so.",
        "State exactly what data crosses the boundary in each direction, from the sync tables. Do not generalise.",
        TRUTH_RULE,
      ]
        .filter(Boolean)
        .join("\n"),
  },

  {
    name: "kanchanflow_page_content_brief",
    title: "Draft a brief for a new KanchanFlow website page",
    description:
      "A procedure for briefing a new page on kanchanflow.com that obeys the site's build contract — the URL check, the metadata budget, the schema rules and the content guardrails.",
    argsSchema: {
      topic: z.string().describe("What the page should cover."),
      targetKeyword: z.string().optional().describe("Primary keyword, if one is already chosen."),
    },
    build: ({ topic, targetKeyword }) =>
      [
        `Draft a content brief for a new KanchanFlow website page about: ${topic ?? "(no topic supplied — ask for one)"}`,
        targetKeyword ? `Primary keyword: ${targetKeyword}` : "",
        "",
        "Procedure:",
        "1. kanchanflow_list_pages with a matching prefix or query — if a page already covers this, say so and stop. Duplicate pages split ranking signals.",
        "2. kanchanflow_get_seo_rules for the metadata budget, the permitted schema types, the forbidden schema types and the hreflang policy.",
        "3. kanchanflow_get_reference_document on 'site/spec-contract.md' for the full page contract, and on 'mcp/examples.md' for worked examples.",
        "4. kanchanflow_search on the topic to find the internal pages this one should link to.",
        "5. kanchanflow_list_features and kanchanflow_get_pricing for any capability or price the page will assert, so nothing on it outruns the product.",
        "",
        "The brief must specify:",
        "- The URL, and evidence that it does not already exist.",
        "- Title within the page-level character budget, and a meta description within its budget.",
        "- The H1, outcome-first and plain.",
        "- A 40-to-60-word answer paragraph, prose, no lists, inside the first 100 words after the H1, naming KanchanFlow and the category.",
        "- Five or more body sections with the specific manufacturing detail each must carry.",
        "- Five to seven visible FAQs.",
        "- At least three internal links to pages confirmed to exist.",
        "- The structured data to emit — breadcrumb plus the page-appropriate type. Never FAQPage, Review or AggregateRating.",
        "",
        "Rules:",
        TRUTH_RULE,
        "House style: sentence-case headings, no exclamation marks, no emoji, no 'unlock', 'supercharge', 'seamless' or 'revolutionize'. Write for a 55-year-old shop owner.",
      ]
        .filter(Boolean)
        .join("\n"),
  },
];

export const promptsByName: ReadonlyMap<string, PromptDefinition> = new Map(
  prompts.map((p) => [p.name, p])
);
