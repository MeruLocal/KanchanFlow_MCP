/**
 * Site structure and SEO-contract tools.
 *
 * These exist so a client writing about, or for, the KanchanFlow website links
 * to URLs that exist and does not propose a structure the site's own contract
 * forbids.
 */

import { z } from "zod";

import { loadMirror } from "../data/mirror.js";
import { ok } from "../errors.js";
import { paginate, type ToolDefinition } from "./tool-types.js";

const listPages: ToolDefinition<{ prefix?: string; query?: string; limit?: number; offset?: number }> = {
  name: "kanchanflow_list_pages",
  title: "List KanchanFlow website pages",
  description: [
    "Returns the real URL set of kanchanflow.com, derived from the website's own route files with every dynamic segment expanded from the content collection that supplies it.",
    "",
    "Use it before linking to a KanchanFlow URL, to check whether a page already exists, or to enumerate a section. Optional `prefix` (e.g. '/features') and `query` narrow the list; `limit` defaults to 100.",
    "",
    "A URL not in this list does not exist on the site. Do not invent one.",
  ].join("\n"),
  inputSchema: {
    prefix: z.string().optional().describe("Only routes starting with this path, e.g. '/integrations'."),
    query: z.string().optional().describe("Substring match anywhere in the route."),
    limit: z.number().int().min(1).max(500).optional().describe("Page size. Default 100."),
    offset: z.number().int().min(0).optional().describe("Routes to skip."),
  },
  handler: ({ prefix, query, limit, offset }) => {
    const m = loadMirror();
    const pfx = prefix?.trim().toLowerCase();
    const q = query?.trim().toLowerCase();
    const filtered = m.site.routes.filter((r) => {
      if (pfx && !r.toLowerCase().startsWith(pfx)) return false;
      if (q && !r.toLowerCase().includes(q)) return false;
      return true;
    });
    const { page, ...pageMeta } = paginate(filtered, limit, offset, 100, 500);
    return ok({
      ...pageMeta,
      siteUrl: m.brand.url,
      routes: page,
      absoluteUrls: page.map((r) => `${m.brand.url}${r === "/" ? "" : r}`),
      totalRoutesOnSite: m.site.routeCount,
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getSeoRules: ToolDefinition = {
  name: "kanchanflow_get_seo_rules",
  title: "Get the KanchanFlow SEO and content contract",
  description: [
    "Returns the rules any new or edited KanchanFlow page must obey: the metadata length budget, the structured-data types the site emits, the structured-data types it forbids outright, the hreflang policy, and the content guardrails around claims and evidence.",
    "",
    "Read this before drafting a page, a title, a meta description or a schema block for kanchanflow.com. The forbidden list is not a preference — FAQPage, Review and AggregateRating are banned by the site's build contract, and a guard script fails the build when one appears.",
    "",
    "The full contract text is available as a reference document at site/spec-contract.md via kanchanflow_get_reference_document.",
  ].join("\n"),
  inputSchema: {},
  handler: () => {
    const m = loadMirror();
    return ok({
      siteUrl: m.brand.url,
      metadataBudget: m.site.metadataBudget,
      schemaTypesEmitted: m.site.schemaTypes,
      schemaTypesForbidden: m.site.forbiddenSchemaTypes,
      forbiddenSchemaReason: {
        FAQPage: "Retired site-wide. FAQs render visibly through the FAQ accordion and emit no structured data.",
        Review: "No third-party review data exists yet.",
        AggregateRating: "No third-party review data exists yet.",
      },
      hreflang: {
        set: m.site.hreflang,
        policy:
          "en-US and x-default only. Wave 1 is a single USA-market .com root — never add en-GB, en-CA, en-AU, en-IN, de, ja or nl.",
      },
      contentGuardrails: [
        "Never fabricate a customer name, logo, testimonial, count or case study. There are none.",
        "Never claim a certification without an audit. Check the compliance list for the verified flag.",
        "Feature status must be truthful: live means production today; building carries a visible target; planned promises nothing.",
        "Never cap RFQ line items or quote revision history in pricing copy.",
        "Never gate the India GST, e-Invoice IRN or 43B(h) features behind a plan.",
        "Every page carries a 40-to-60-word quotable answer block within the first 100 words after the H1.",
        "FAQs are visible on the page and are never structured data only.",
      ],
      keywordArchitecture: m.brand.keywords,
      referenceDocument: "site/spec-contract.md",
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const siteTools: ToolDefinition[] = [listPages as ToolDefinition, getSeoRules as ToolDefinition];
