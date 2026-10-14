/**
 * Feature catalog tools.
 *
 * The status field is the point of these tools. KanchanFlow publishes a
 * truthful status for every advertised feature, and an AI client that
 * describes a "building" feature as available has misled someone. Both tools
 * return the status on every record, and the list tool defaults to no filter
 * so the mix is visible.
 */

import { z } from "zod";

import { getFeature, loadMirror, suggestSlugs } from "../data/mirror.js";
import { notFound, ok } from "../errors.js";
import { matches, paginate, type ToolDefinition } from "./tool-types.js";
import { listFeaturesOutput } from "./output-schemas.js";
import type { Feature } from "../data/types.js";

const STATUSES = ["live", "beta", "building", "planned"] as const;
const TIERS = ["starter", "professional", "enterprise"] as const;

function summarise(f: Feature) {
  return {
    slug: f.slug,
    name: f.name,
    category: f.category,
    status: f.status,
    target: f.target,
    wave: f.wave,
    lead: f.lead,
    url: `/features/${f.slug}`,
  };
}

const listFeatures: ToolDefinition<{
  status?: (typeof STATUSES)[number];
  category?: string;
  tier?: (typeof TIERS)[number];
  query?: string;
  limit?: number;
  offset?: number;
}> = {
  name: "kanchanflow_list_features",
  title: "List KanchanFlow features",
  description: [
    "Lists the KanchanFlow feature catalog with each feature's truthful status, category and one-line summary. This is the tool to use for 'what can KanchanFlow do', 'is X available', 'what is shipping', 'what is on the roadmap' and any capability question.",
    "",
    "Status values and what they mean:",
    "  live     — running in production for customers today",
    "  beta     — customer tested, not yet general",
    "  building — in active development, `target` names the milestone",
    "  planned  — not built, no committed date",
    "Never describe a building or planned feature as something the product does today.",
    "",
    "Optional filters: `status`, `category` (see the categories in the response), `tier` (returns only features available on that plan, using the feature's own tierAvailability text), and `query` (case-insensitive substring across name, lead, category and keywords).",
    "Paging: `limit` (default 25, max 200) and `offset`.",
    "",
    "Returns summaries, not full pages. Call kanchanflow_get_feature for one feature's capabilities, how-it-works steps, per-tier availability and FAQs.",
    "Errors: VALIDATION_ERROR on an unknown status or tier.",
  ].join("\n"),
  inputSchema: {
    status: z.enum(STATUSES).optional().describe("Only features with this status."),
    category: z.string().optional().describe("Only features in this category, e.g. 'Quoting'."),
    tier: z
      .enum(TIERS)
      .optional()
      .describe("Only features available on this plan, per the feature's own tier availability."),
    query: z.string().optional().describe("Case-insensitive substring match on name, lead, category and keywords."),
    limit: z.number().int().min(1).max(200).optional().describe("Page size. Default 25."),
    offset: z.number().int().min(0).optional().describe("Records to skip. Default 0."),
  },
  outputSchema: listFeaturesOutput,
  handler: ({ status, category, tier, query, limit, offset }) => {
    const m = loadMirror();
    const cat = category?.toLowerCase().trim();

    const filtered = m.features.items.filter((f) => {
      if (status && f.status !== status) return false;
      if (cat && f.category.toLowerCase() !== cat) return false;
      if (tier) {
        const text = f.tierAvailability?.[tier];
        if (!text || /^(—|-|not available|no)\b/i.test(text.trim())) return false;
      }
      return matches(
        query,
        f.name,
        f.lead,
        f.category,
        f.slug,
        f.primaryKeyword,
        (f.secondaryKeywords ?? []).join(" ")
      );
    });

    const { page, ...pageMeta } = paginate(filtered, limit, offset);
    return ok({
      ...pageMeta,
      statusCounts: m.features.statusCounts,
      categories: m.features.categories.map((c) => c.name),
      features: page.map(summarise),
      statusLegend: {
        live: "In production today.",
        beta: "Customer tested, not yet general.",
        building: "In development with a visible target milestone.",
        planned: "Not built, no committed date.",
      },
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getFeatureTool: ToolDefinition<{ slug: string; includeFaqs?: boolean }> = {
  name: "kanchanflow_get_feature",
  title: "Get one KanchanFlow feature",
  description: [
    "Returns everything KanchanFlow publishes about one feature: status and target, the quotable answer paragraph, the long summary, the capability list, the how-it-works steps, availability per plan, keywords and the visible FAQs.",
    "",
    "Use it after kanchanflow_list_features has found the slug, or when a slug is already known. Required parameter: `slug` (e.g. 'quote-editor', 'rfq-management').",
    "Set `includeFaqs` to false to trim the response when the FAQs are not needed.",
    "",
    "Legacy slugs are resolved through the site's own alias table and the response reports the redirect.",
    "Errors: NOT_FOUND with a list of close slugs when the feature does not exist. This tool never invents a feature.",
  ].join("\n"),
  inputSchema: {
    slug: z.string().min(1).describe("Feature slug, e.g. 'quote-editor'."),
    includeFaqs: z.boolean().optional().describe("Include the visible FAQ list. Default true."),
  },
  handler: ({ slug, includeFaqs = true }) => {
    const m = loadMirror();
    const wanted = slug.trim().toLowerCase().replace(/^\/?features\//, "");

    const alias = m.features.aliases[wanted];
    const resolved = alias ?? wanted;
    const feature = getFeature(resolved);

    if (!feature) {
      throw notFound(`No KanchanFlow feature with slug "${wanted}".`, {
        didYouMean: suggestSlugs(
          wanted,
          m.features.items.map((f) => f.slug)
        ),
      });
    }

    const { faqs, ...rest } = feature;
    return ok({
      ...rest,
      ...(includeFaqs ? { faqs: faqs ?? [] } : {}),
      url: `${m.brand.url}/features/${feature.slug}`,
      ...(alias ? { resolvedFromAlias: wanted } : {}),
      ...(/gst|irn|gstin|aadhaar|43bh|msmed/.test(feature.slug)
        ? { indiaFraming: m.features.indiaFraming }
        : {}),
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const featureTools: ToolDefinition[] = [
  listFeatures as ToolDefinition,
  getFeatureTool as ToolDefinition,
];
