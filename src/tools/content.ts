/**
 * Editorial content: blog, glossary, changelog and roadmap.
 */

import { z } from "zod";

import { getPost, getTerm, loadMirror, suggestSlugs } from "../data/mirror.js";
import { notFound, ok, validationError } from "../errors.js";
import { matches, paginate, type ToolDefinition } from "./tool-types.js";

const listBlogPosts: ToolDefinition<{ query?: string; limit?: number; offset?: number }> = {
  name: "kanchanflow_list_blog_posts",
  title: "List KanchanFlow blog posts",
  description: [
    "Lists the published KanchanFlow blog posts with title, target keyword, description, publication and modification dates and reading time, plus the editorial calendar of scheduled posts that are not written yet.",
    "",
    "Published posts are in `published`; the `scheduled` list is titles only and those pages do not exist — never link to one or describe it as available. Optional `query` filters on title, keyword and description.",
  ].join("\n"),
  inputSchema: {
    query: z.string().optional().describe("Substring match on title, keyword and description."),
    limit: z.number().int().min(1).max(100).optional().describe("Page size. Default 25."),
    offset: z.number().int().min(0).optional().describe("Records to skip."),
  },
  handler: ({ query, limit, offset }) => {
    const m = loadMirror();
    const filtered = m.blog.posts.filter((p) => matches(query, p.title, p.keyword, p.description, p.slug));
    const { page, ...pageMeta } = paginate(filtered, limit, offset);
    return ok({
      ...pageMeta,
      author: m.blog.author,
      cadence: m.blog.cadence,
      published: page.map((p) => ({
        slug: p.slug,
        title: p.title,
        keyword: p.keyword,
        description: p.description,
        datePublished: p.datePublished,
        dateModified: p.dateModified,
        readingMinutes: p.readingMinutes,
        url: `/blog/${p.slug}`,
      })),
      scheduled: m.blog.upcoming,
      scheduledNote:
        "Scheduled titles are an editorial calendar. Those posts are not written and those URLs do not exist.",
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getBlogPost: ToolDefinition<{ slug: string; includeBody?: boolean }> = {
  name: "kanchanflow_get_blog_post",
  title: "Get one KanchanFlow blog post",
  description: [
    "Returns one published blog post: the quotable answer paragraph, every section with its heading and paragraphs, the FAQs, dates and reading time.",
    "",
    "Required: `slug`. Set `includeBody` to false for metadata and the answer paragraph only.",
    "Errors: NOT_FOUND with close slugs. A title from the scheduled calendar has no post to return.",
  ].join("\n"),
  inputSchema: {
    slug: z.string().min(1).describe("Post slug, e.g. 'rfq-response-time-benchmark'."),
    includeBody: z.boolean().optional().describe("Include the full section bodies. Default true."),
  },
  handler: ({ slug, includeBody = true }) => {
    const m = loadMirror();
    const wanted = slug.trim().toLowerCase().replace(/^\/?blog\//, "");
    const post = getPost(wanted);
    if (!post) {
      throw notFound(`No published KanchanFlow blog post with slug "${wanted}".`, {
        didYouMean: suggestSlugs(wanted, m.blog.posts.map((p) => p.slug)),
        scheduledTitles: m.blog.upcoming.map((u) => u.title),
      });
    }
    const { sections, ...rest } = post;
    return ok({
      ...rest,
      author: m.blog.author,
      ...(includeBody ? { sections } : { sectionHeadings: sections.map((s) => s.h2) }),
      url: `${m.brand.url}/blog/${post.slug}`,
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const listGlossaryTerms: ToolDefinition<{ query?: string }> = {
  name: "kanchanflow_list_glossary_terms",
  title: "List KanchanFlow glossary terms",
  description: [
    "Lists the published manufacturing glossary terms with their definition question, short description and keywords. Small list — no paging needed.",
    "Use it before answering a terminology question such as 'what is an RFQ' so the answer matches what KanchanFlow publishes.",
  ].join("\n"),
  inputSchema: {
    query: z.string().optional().describe("Substring match on term, title and keywords."),
  },
  handler: ({ query }) => {
    const m = loadMirror();
    const terms = m.glossary.terms
      .filter((t) => matches(query, t.term, t.title, t.slug, (t.keywords ?? []).join(" ")))
      .map((t) => ({
        slug: t.slug,
        term: t.term,
        title: t.title,
        description: t.description,
        keywords: t.keywords,
        url: `/glossary/${t.slug}`,
      }));
    return ok({ total: terms.length, terms, source: { syncedAt: m.meta.syncedAt } });
  },
};

const getGlossaryTerm: ToolDefinition<{ slug: string; includeBody?: boolean }> = {
  name: "kanchanflow_get_glossary_term",
  title: "Get one KanchanFlow glossary term",
  description: [
    "Returns one manufacturing glossary term in full: the quotable 40-to-60-word answer, every section of the definition with its heading and paragraphs, and the visible FAQs.",
    "",
    "Use it when a user asks what a term means and you want the definition KanchanFlow publishes rather than a generic one — the entries are written for a manufacturing reader and draw distinctions a dictionary does not.",
    "",
    "Required: `slug` (e.g. 'rfq'). Set `includeBody` to false for the answer paragraph and section headings only.",
    "Errors: NOT_FOUND with close slugs when the term does not exist.",
  ].join("\n"),
  inputSchema: {
    slug: z.string().min(1).describe("Glossary slug, e.g. 'rfq'."),
    includeBody: z.boolean().optional().describe("Include full section bodies. Default true."),
  },
  handler: ({ slug, includeBody = true }) => {
    const m = loadMirror();
    const wanted = slug.trim().toLowerCase().replace(/^\/?glossary\//, "");
    const term = getTerm(wanted);
    if (!term) {
      throw notFound(`No KanchanFlow glossary term with slug "${wanted}".`, {
        didYouMean: suggestSlugs(wanted, m.glossary.terms.map((t) => t.slug)),
      });
    }
    const { sections, ...rest } = term;
    return ok({
      ...rest,
      ...(includeBody ? { sections } : { sectionHeadings: sections.map((s) => s.h2) }),
      url: `${m.brand.url}/glossary/${term.slug}`,
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getChangelog: ToolDefinition<{ tag?: string; since?: string; limit?: number }> = {
  name: "kanchanflow_get_changelog",
  title: "Get the KanchanFlow changelog",
  description: [
    "Returns shipped KanchanFlow releases, newest first, each with its date, tag and what actually changed.",
    "",
    "Every entry describes something that shipped. Nothing here is aspirational, and no entry names a customer or an adoption figure. Use it to answer 'what is new', 'when did X ship', or to confirm that a feature really is live.",
    "",
    "Optional `tag` (one of the published tag vocabulary — the response lists them), `since` (ISO date, inclusive) and `limit` (default 20).",
    "Errors: VALIDATION_ERROR on a malformed `since` date.",
  ].join("\n"),
  inputSchema: {
    tag: z.string().optional().describe("Filter to one changelog tag, e.g. 'Integration'."),
    since: z.string().optional().describe("ISO date (YYYY-MM-DD). Only releases on or after it."),
    limit: z.number().int().min(1).max(100).optional().describe("Maximum releases. Default 20."),
  },
  handler: ({ tag, since, limit }) => {
    const m = loadMirror();
    if (since && !/^\d{4}-\d{2}-\d{2}$/.test(since)) {
      throw validationError(`"${since}" is not an ISO date. Use YYYY-MM-DD.`);
    }
    const wantedTag = tag?.toLowerCase().trim();
    const filtered = m.changelog.releases.filter((r) => {
      if (wantedTag && r.tag.toLowerCase() !== wantedTag) return false;
      if (since && r.date < since) return false;
      return true;
    });
    const { page, ...pageMeta } = paginate(filtered, limit, 0, 20, 100);
    return ok({
      ...pageMeta,
      tags: m.changelog.tags,
      cadence: m.changelog.cadence,
      releases: page,
      url: `${m.brand.url}/changelog`,
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getRoadmap: ToolDefinition = {
  name: "kanchanflow_get_roadmap",
  title: "Get the KanchanFlow roadmap",
  description: [
    "Returns the published roadmap buckets together with the feature-status counts, so a client can see what shipped recently, what is in beta, what is coming and what is only under consideration.",
    "",
    "Items under consideration carry no dates at all — not a quarter, not a half, not 'soon'. Do not attach one. Anything with a committed target appears as a `building` feature in kanchanflow_list_features with its target milestone.",
  ].join("\n"),
  inputSchema: {},
  handler: () => {
    const m = loadMirror();
    return ok({
      statusCounts: m.features.statusCounts,
      buckets: m.changelog.roadmap,
      datePolicy:
        "Items under consideration carry no date of any kind. Building features carry a milestone target and no calendar date.",
      building: m.features.items
        .filter((f) => f.status === "building")
        .map((f) => ({ slug: f.slug, name: f.name, target: f.target })),
      planned: m.features.items
        .filter((f) => f.status === "planned")
        .map((f) => ({ slug: f.slug, name: f.name, wave: f.wave })),
      urls: { roadmap: `${m.brand.url}/roadmap`, whatsShipping: `${m.brand.url}/whats-shipping` },
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const contentTools: ToolDefinition[] = [
  listBlogPosts as ToolDefinition,
  getBlogPost as ToolDefinition,
  listGlossaryTerms as ToolDefinition,
  getGlossaryTerm as ToolDefinition,
  getChangelog as ToolDefinition,
  getRoadmap as ToolDefinition,
];
