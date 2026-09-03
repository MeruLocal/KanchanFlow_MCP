/**
 * Connector catalog tools.
 *
 * `lastTested` is the date a human ran the sync end to end against a live
 * sandbox. Both tools return it, because a connector page whose test date has
 * gone stale is a page that may be wrong, and a client should be able to say so.
 */

import { z } from "zod";

import { getIntegration, loadMirror, suggestSlugs } from "../data/mirror.js";
import { notFound, ok } from "../errors.js";
import { matches, paginate, type ToolDefinition } from "./tool-types.js";

const STATUSES = ["live", "beta", "building", "planned"] as const;
const SECTIONS = [
  "syncTo",
  "syncFrom",
  "setup",
  "limitations",
  "troubleshooting",
  "faqs",
  "screenshots",
] as const;

const listIntegrations: ToolDefinition<{
  category?: string;
  status?: (typeof STATUSES)[number];
  market?: string;
  query?: string;
  limit?: number;
  offset?: number;
}> = {
  name: "kanchanflow_list_integrations",
  title: "List KanchanFlow integrations",
  description: [
    "Lists the KanchanFlow connector catalog: name, category, market, status, the date the connector was last tested end to end, a one-line description and which plans include it.",
    "",
    "Use it for 'does KanchanFlow integrate with X', 'what accounting systems does it connect to', or to enumerate connectors by category.",
    "",
    "Optional filters: `category` (the response lists the valid values), `status`, `market` (for example 'India', 'USA', 'Global') and `query` (substring across name, tagline and slug). Paging: `limit` (default 25, max 200), `offset`.",
    "",
    "Returns summaries. Call kanchanflow_get_integration for the field-by-field sync tables, setup steps, limitations and troubleshooting entries.",
  ].join("\n"),
  inputSchema: {
    category: z.string().optional().describe("Connector category, e.g. 'Accounting'."),
    status: z.enum(STATUSES).optional().describe("Only connectors with this status."),
    market: z.string().optional().describe("Market the connector targets, e.g. 'India'."),
    query: z.string().optional().describe("Substring match on name, tagline and slug."),
    limit: z.number().int().min(1).max(200).optional().describe("Page size. Default 25."),
    offset: z.number().int().min(0).optional().describe("Records to skip. Default 0."),
  },
  handler: ({ category, status, market, query, limit, offset }) => {
    const m = loadMirror();
    const cat = category?.toLowerCase().trim();
    const mkt = market?.toLowerCase().trim();

    const filtered = m.integrations.items.filter((i) => {
      if (cat && i.category.toLowerCase() !== cat) return false;
      if (status && i.status !== status) return false;
      if (mkt && (i.market ?? "").toLowerCase() !== mkt) return false;
      return matches(query, i.name, i.shortName, i.tagline, i.slug, i.category);
    });

    const { page, ...pageMeta } = paginate(filtered, limit, offset);
    return ok({
      ...pageMeta,
      categories: m.integrations.categories,
      testingPromise: m.integrations.testing,
      integrations: page.map((i) => ({
        slug: i.slug,
        name: i.name,
        category: i.category,
        market: i.market,
        status: i.status,
        target: i.target,
        lastTested: i.lastTested,
        tagline: i.tagline,
        tiers: i.tiers,
        url: `/integrations/${i.slug}`,
      })),
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getIntegrationTool: ToolDefinition<{
  slug: string;
  sections?: (typeof SECTIONS)[number][];
}> = {
  name: "kanchanflow_get_integration",
  title: "Get one KanchanFlow integration",
  description: [
    "Returns the full published detail for one connector: what it writes to the other system field by field, what it reads back, the sync cadence, the numbered setup steps, the stated limitations, the troubleshooting table (error, cause, fix) and the visible FAQs.",
    "",
    "Use it when someone asks how to set a connector up, why a sync failed, or exactly what data crosses the boundary. The limitations list is deliberately explicit — quote it rather than glossing over it.",
    "",
    "Required: `slug` (e.g. 'tally', 'quickbooks'). Optional `sections` returns only the named parts, which keeps a response small when only the setup steps are wanted.",
    "Errors: NOT_FOUND with close slugs when the connector does not exist.",
  ].join("\n"),
  inputSchema: {
    slug: z.string().min(1).describe("Integration slug, e.g. 'tally'."),
    sections: z
      .array(z.enum(SECTIONS))
      .optional()
      .describe("Limit the response to these sections. Omit for everything."),
  },
  handler: ({ slug, sections }) => {
    const m = loadMirror();
    const wanted = slug.trim().toLowerCase().replace(/^\/?integrations\//, "");
    const integration = getIntegration(wanted);

    if (!integration) {
      throw notFound(`No KanchanFlow integration with slug "${wanted}".`, {
        didYouMean: suggestSlugs(
          wanted,
          m.integrations.items.map((i) => i.slug)
        ),
      });
    }

    const core = {
      slug: integration.slug,
      name: integration.name,
      shortName: integration.shortName,
      category: integration.category,
      market: integration.market,
      priority: integration.priority,
      status: integration.status,
      target: integration.target,
      lastTested: integration.lastTested,
      h1: integration.h1,
      tagline: integration.tagline,
      answer: integration.answer,
      intro: integration.intro,
      frame: integration.frame,
      cadence: integration.cadence,
      related: integration.related,
      tiers: integration.tiers,
      url: `${m.brand.url}/integrations/${integration.slug}`,
    };

    const detail: Record<string, unknown> = {};
    const wantedSections = sections?.length ? sections : SECTIONS;
    for (const key of wantedSections) {
      if (integration[key] !== undefined) detail[key] = integration[key];
    }

    return ok({
      ...core,
      ...detail,
      testingPromise: m.integrations.testing,
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const integrationTools: ToolDefinition[] = [
  listIntegrations as ToolDefinition,
  getIntegrationTool as ToolDefinition,
];
