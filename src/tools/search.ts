/**
 * Cross-collection search.
 *
 * One entry point for "does KanchanFlow say anything about X". It scores a
 * match by where the term appears — a name is a stronger signal than a body
 * paragraph — and returns a snippet plus the tool to call for the full record,
 * so a model can go one level deeper without guessing a slug.
 */

import { z } from "zod";

import { loadMirror } from "../data/mirror.js";
import { ok, validationError } from "../errors.js";
import type { ToolDefinition } from "./tool-types.js";

const TYPES = ["feature", "integration", "glossary", "blog", "changelog", "page"] as const;
type ResultType = (typeof TYPES)[number];

interface Hit {
  type: ResultType;
  slug: string;
  title: string;
  snippet: string;
  status?: string;
  url: string;
  score: number;
  followUpTool: string;
}

/** Index of the first case-insensitive occurrence, or -1. */
function find(haystack: string | undefined, needle: string): number {
  return (haystack ?? "").toLowerCase().indexOf(needle);
}

function snippet(text: string | undefined, needle: string, width = 180): string {
  const body = (text ?? "").replace(/\s+/g, " ").trim();
  if (!body) return "";
  const at = body.toLowerCase().indexOf(needle);
  if (at === -1) return body.slice(0, width);
  const start = Math.max(0, at - Math.floor(width / 3));
  return `${start > 0 ? "…" : ""}${body.slice(start, start + width)}${start + width < body.length ? "…" : ""}`;
}

const search: ToolDefinition<{ query: string; types?: ResultType[]; limit?: number }> = {
  name: "kanchanflow_search",
  title: "Search everything KanchanFlow publishes",
  description: [
    "Searches every KanchanFlow content collection at once — features, integrations, glossary terms, blog posts, changelog entries and website routes — and returns ranked matches with a snippet showing where the term appeared.",
    "",
    "Use this first when you do not know which collection holds the answer, or when a user's wording does not map cleanly onto a slug. Each result names the tool to call for the full record, so this is the discovery step rather than the answer.",
    "",
    "Required: `query`, at least two characters. Optional `types` narrows the collections searched; `limit` defaults to 20 and caps at 50.",
    "An empty result set means KanchanFlow publishes nothing on that term. Say that rather than filling the gap.",
  ].join("\n"),
  inputSchema: {
    query: z.string().min(2).max(200).describe("Search term, 2 to 200 characters."),
    types: z.array(z.enum(TYPES)).optional().describe("Collections to search. Default: all."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum results. Default 20."),
  },
  handler: ({ query, types, limit }) => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) {
      throw validationError("Search needs a query of at least two characters.");
    }

    const m = loadMirror();
    const want = new Set<ResultType>(types?.length ? types : [...TYPES]);
    const hits: Hit[] = [];

    if (want.has("feature")) {
      for (const f of m.features.items) {
        const inName = find(f.name, needle) !== -1 || find(f.slug, needle) !== -1;
        const inLead = find(f.lead, needle) !== -1 || find(f.answer, needle) !== -1;
        const inKeywords =
          find(f.primaryKeyword, needle) !== -1 ||
          find((f.secondaryKeywords ?? []).join(" "), needle) !== -1;
        const inBody = find(JSON.stringify(f.capabilities ?? []), needle) !== -1;
        if (!inName && !inLead && !inKeywords && !inBody) continue;
        hits.push({
          type: "feature",
          slug: f.slug,
          title: f.name,
          status: f.status,
          snippet: snippet(inName || inLead ? f.lead : f.answer, needle),
          url: `/features/${f.slug}`,
          score: inName ? 100 : inKeywords ? 70 : inLead ? 60 : 30,
          followUpTool: "kanchanflow_get_feature",
        });
      }
    }

    if (want.has("integration")) {
      for (const i of m.integrations.items) {
        const inName = find(i.name, needle) !== -1 || find(i.slug, needle) !== -1;
        const inTagline = find(i.tagline, needle) !== -1 || find(i.answer, needle) !== -1;
        const inBody = find(JSON.stringify(i.syncTo ?? []), needle) !== -1 ||
          find(JSON.stringify(i.limitations ?? []), needle) !== -1;
        if (!inName && !inTagline && !inBody) continue;
        hits.push({
          type: "integration",
          slug: i.slug,
          title: i.name,
          status: i.status,
          snippet: snippet(inName || inTagline ? i.tagline : i.answer, needle),
          url: `/integrations/${i.slug}`,
          score: inName ? 100 : inTagline ? 60 : 30,
          followUpTool: "kanchanflow_get_integration",
        });
      }
    }

    if (want.has("glossary")) {
      for (const t of m.glossary.terms) {
        const inTerm = find(t.term, needle) !== -1 || find(t.slug, needle) !== -1;
        const inBody = find(t.description, needle) !== -1 || find(t.answer, needle) !== -1;
        if (!inTerm && !inBody) continue;
        hits.push({
          type: "glossary",
          slug: t.slug,
          title: t.title,
          snippet: snippet(t.answer, needle),
          url: `/glossary/${t.slug}`,
          score: inTerm ? 95 : 50,
          followUpTool: "kanchanflow_get_glossary_term",
        });
      }
    }

    if (want.has("blog")) {
      for (const p of m.blog.posts) {
        const inTitle = find(p.title, needle) !== -1 || find(p.keyword, needle) !== -1;
        const inBody = find(p.description, needle) !== -1 || find(p.answer, needle) !== -1;
        if (!inTitle && !inBody) continue;
        hits.push({
          type: "blog",
          slug: p.slug,
          title: p.title,
          snippet: snippet(p.description, needle),
          url: `/blog/${p.slug}`,
          score: inTitle ? 90 : 45,
          followUpTool: "kanchanflow_get_blog_post",
        });
      }
    }

    if (want.has("changelog")) {
      for (const r of m.changelog.releases) {
        const inTitle = find(r.title, needle) !== -1;
        const inBody = find(r.body, needle) !== -1;
        if (!inTitle && !inBody) continue;
        hits.push({
          type: "changelog",
          slug: r.date,
          title: r.title,
          status: r.tag,
          snippet: snippet(r.body, needle),
          url: "/changelog",
          score: inTitle ? 80 : 40,
          followUpTool: "kanchanflow_get_changelog",
        });
      }
    }

    if (want.has("page")) {
      for (const route of m.site.routes) {
        if (find(route, needle) === -1) continue;
        hits.push({
          type: "page",
          slug: route,
          title: route,
          snippet: `${m.brand.url}${route === "/" ? "" : route}`,
          url: route,
          score: 25,
          followUpTool: "kanchanflow_list_pages",
        });
      }
    }

    hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const capped = hits.slice(0, Math.min(limit ?? 20, 50));

    return ok({
      query,
      total: hits.length,
      returned: capped.length,
      typesSearched: [...want],
      results: capped,
      ...(hits.length === 0
        ? {
            note: `KanchanFlow publishes nothing matching "${query}". Do not answer from general knowledge as if it were a KanchanFlow fact.`,
          }
        : {}),
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const searchTools: ToolDefinition[] = [search as ToolDefinition];
