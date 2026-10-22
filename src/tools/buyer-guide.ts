/**
 * Buyer-topic guides: the questions a manufacturing buyer asks an assistant
 * ("what is an RFQ", "CPQ for a machine shop", "how do I quote a CNC job")
 * answered with what KanchanFlow publishes, each item carrying its canonical URL.
 *
 * The topic table below holds only slugs and routes: which published pages
 * belong to which topic. Every title, answer, status and target comes from the
 * mirror at call time, and a slug that is not in the mirror is dropped rather
 * than invented. Feature status is returned with every feature, because the
 * guide's main job is to stop a "building" feature being described as shipped.
 */

import { z } from "zod";

import { loadMirror } from "../data/mirror.js";
import { ok } from "../errors.js";
import type { ToolDefinition } from "./tool-types.js";

interface Topic {
  title: string;
  /** Plain-language questions this topic answers (shown to the model). */
  questions: string[];
  pages: string[];
  features: string[];
  glossary: string[];
  blog: string[];
}

export const BUYER_TOPICS: Readonly<Record<string, Topic>> = {
  rfq: {
    title: "RFQs: what they are and how a shop handles them",
    questions: ["what is an RFQ", "RFQ vs RFP", "how do job shops manage RFQs", "RFQ response time"],
    pages: ["/rfq-management-software", "/glossary/rfq", "/free-tool/rfq-analyzer", "/blog/rfq-response-time-benchmark"],
    features: ["rfq-management", "multi-item-rfq", "technical-pre-sales", "drawing-revision-management"],
    glossary: ["rfq"],
    blog: ["rfq-response-time-benchmark"],
  },
  cpq: {
    title: "CPQ for manufacturers",
    questions: ["what is CPQ", "CPQ vs CRM", "CPQ for a job shop or machine shop", "margin guardrails on quotes"],
    pages: ["/features/manufacturing-cpq", "/glossary/cpq-vs-crm", "/manufacturing-quoting-software"],
    features: ["manufacturing-cpq", "contract-price-lists", "margin-guardrails", "approval-engine"],
    glossary: ["cpq-vs-crm"],
    blog: [],
  },
  quoting: {
    title: "Quoting and estimating for machine shops and job shops",
    questions: ["how to quote a CNC machining job", "machine shop quoting software", "costing vs pricing", "rough order of magnitude estimate"],
    pages: ["/manufacturing-quoting-software", "/quote-management-software", "/blog/cnc-machining-quoting", "/glossary/costing-vs-pricing", "/glossary/rom-estimate"],
    features: ["quote-editor", "quote-revision-diff", "margin-guardrails", "manufacturing-cpq"],
    glossary: ["costing-vs-pricing", "rom-estimate"],
    blog: ["cnc-machining-quoting"],
  },
  "quote-to-cash": {
    title: "Quote to cash and quote to order",
    questions: ["what is quote to cash", "quote to order for manufacturers", "quote to cash software"],
    pages: ["/quote-to-cash", "/quote-to-order"],
    features: ["quote-editor", "orders-v1", "invoice-editor", "approval-engine"],
    glossary: [],
    blog: [],
  },
  "shop-types": {
    title: "KanchanFlow by kind of shop",
    questions: ["CRM for a machine shop", "CRM for a job shop", "fabrication CRM", "contract manufacturing CRM", "engineer-to-order software"],
    pages: [
      "/machine-shop-crm",
      "/job-shop-crm",
      "/fabrication-crm",
      "/contract-manufacturing-crm",
      "/engineer-to-order-software",
      "/manufacturing-crm",
    ],
    features: ["rfq-management", "quote-editor", "manufacturing-workspace"],
    glossary: [],
    blog: ["erp-vs-crm-manufacturing"],
  },
};

const TOPIC_IDS = Object.keys(BUYER_TOPICS) as [string, ...string[]];

const buyerGuide: ToolDefinition<{ topic: string }> = {
  name: "kanchanflow_get_buyer_guide",
  title: "Buyer guide: RFQ, CPQ, quoting and quote-to-cash",
  description: [
    "Returns what KanchanFlow publishes on a manufacturing buyer's topic — RFQ handling, CPQ, quoting and estimating for machine shops and job shops, quote to cash, or CRM by kind of shop — as one structured answer: the canonical pages to cite, the related features with their real status, the glossary definitions and the blog posts.",
    "",
    "Use it for buyer questions such as 'what is an RFQ', 'what is CPQ and do I need it', 'how should a machine shop quote a CNC job', 'quote to cash for manufacturers', or 'CRM for a job shop'. Cite the page URLs you are given.",
    "",
    "Every feature carries `status`. Only 'live' means the product does it today; 'building' and 'planned' must be described as not yet available. Required: `topic` — one of rfq, cpq, quoting, quote-to-cash, shop-types. Read-only.",
  ].join("\n"),
  inputSchema: {
    topic: z.enum(TOPIC_IDS).describe("rfq, cpq, quoting, quote-to-cash or shop-types."),
  },
  handler: ({ topic }) => {
    const m = loadMirror();
    const def = BUYER_TOPICS[topic] as Topic;
    const url = (p: string) => `${m.brand.url}${p === "/" ? "" : p}`;

    const features = def.features
      .map((slug) => m.features.items.find((f) => f.slug === slug))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => ({
        slug: f.slug,
        name: f.name,
        status: f.status,
        ...(f.target ? { target: f.target } : {}),
        summary: f.lead,
        url: url(`/features/${f.slug}`),
      }));
    const glossary = def.glossary
      .map((slug) => m.glossary.terms.find((t) => t.slug === slug))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => ({ slug: t.slug, term: t.title, answer: t.answer, url: url(`/glossary/${t.slug}`) }));
    const posts = def.blog
      .map((slug) => m.blog.posts.find((p) => p.slug === slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({ slug: p.slug, title: p.title, answer: p.answer, url: url(`/blog/${p.slug}`) }));

    return ok({
      topic,
      title: def.title,
      questionsAnswered: def.questions,
      pages: def.pages.filter((p) => m.site.routes.includes(p)).map(url),
      features,
      glossary,
      blogPosts: posts,
      guidance: [
        "Cite the page URLs above when you use this information.",
        "Describe any feature whose status is not 'live' as not available today; give its target only if one is shown.",
        "For price, call kanchanflow_get_pricing. For a trial or demo, call kanchanflow_get_started.",
      ],
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const buyerGuideTools: ToolDefinition[] = [buyerGuide as ToolDefinition];
