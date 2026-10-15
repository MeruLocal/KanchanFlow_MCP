/**
 * MCP resources.
 *
 * Resources are the "here is the whole collection" surface, for a client that
 * wants to load context once rather than call a tool per question. Two kinds:
 *
 *   kanchanflow://site/<name>       — a slice of the content mirror as JSON
 *   kanchanflow://reference/<path>  — one reference document as markdown
 *
 * Everything here is public, published website content. No secret, no
 * credential and no environment value is reachable through a resource: the
 * site resources read named slices of the mirror rather than serving an
 * arbitrary key, and the reference resources go through the same
 * traversal-guarded loader the tools use.
 */

import { freshness } from "../data/freshness.js";
import { loadMirror } from "../data/mirror.js";
import { complianceView } from "../tools/company.js";
import { referenceLoader } from "../reference/index.js";
import type { SiteMirror } from "../data/types.js";

export interface SiteResource {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: string;
  /** Named slice of the mirror. Never an arbitrary path expression. */
  read: (mirror: SiteMirror) => unknown;
}

export const SITE_RESOURCE_SCHEME = "kanchanflow";

export const siteResources: SiteResource[] = [
  {
    uri: "kanchanflow://site/company",
    name: "kanchanflow-company",
    title: "Company profile",
    description:
      "Soor LLC entity facts, positioning, compliance list with verified flags, trust badges and social profiles.",
    mimeType: "application/json",
    read: (m) => ({
      brand: {
        name: m.brand.name,
        tagline: m.brand.tagline,
        h1: m.brand.h1,
        sub: m.brand.sub,
        url: m.brand.url,
      },
      entity: m.brand.entity,
      compliance: m.brand.compliance,
      complianceBasis: complianceView(m.brand.compliance).basis,
      trustBadges: m.brand.trustBadges,
      social: m.brand.social,
    }),
  },
  {
    uri: "kanchanflow://site/features",
    name: "kanchanflow-features",
    title: "Feature catalog",
    description:
      "Every advertised feature with its truthful status (live, beta, building, planned), category and target milestone.",
    mimeType: "application/json",
    read: (m) => ({
      statusCounts: m.features.statusCounts,
      categories: m.features.categories,
      features: m.features.items.map((f) => ({
        slug: f.slug,
        name: f.name,
        category: f.category,
        status: f.status,
        target: f.target,
        wave: f.wave,
        lead: f.lead,
        tierAvailability: f.tierAvailability,
      })),
    }),
  },
  {
    uri: "kanchanflow://site/pricing",
    name: "kanchanflow-pricing",
    title: "Pricing and the feature-gate matrix",
    description:
      "The three plans, the trial terms, the add-on catalog, AI credit weights, WhatsApp billing and the complete feature-gate matrix.",
    mimeType: "application/json",
    read: (m) => m.pricing,
  },
  {
    uri: "kanchanflow://site/integrations",
    name: "kanchanflow-integrations",
    title: "Integration catalog",
    description:
      "Every connector with its category, market, status, last end-to-end test date and plan availability.",
    mimeType: "application/json",
    read: (m) => ({
      categories: m.integrations.categories,
      testing: m.integrations.testing,
      integrations: m.integrations.items.map((i) => ({
        slug: i.slug,
        name: i.name,
        category: i.category,
        market: i.market,
        status: i.status,
        target: i.target,
        lastTested: i.lastTested,
        tagline: i.tagline,
        tiers: i.tiers,
      })),
    }),
  },
  {
    uri: "kanchanflow://site/markets",
    name: "kanchanflow-markets",
    title: "Display markets and currencies",
    description:
      "The seven display markets, their currencies, the dated reference rates, and which prices are contracted rather than converted.",
    mimeType: "application/json",
    read: (m) => m.markets,
  },
  {
    uri: "kanchanflow://site/changelog",
    name: "kanchanflow-changelog",
    title: "Changelog and roadmap",
    description: "Shipped releases newest first, plus the published roadmap buckets.",
    mimeType: "application/json",
    read: (m) => m.changelog,
  },
  {
    uri: "kanchanflow://site/url-map",
    name: "kanchanflow-url-map",
    title: "Website URL map",
    description:
      "Every route on kanchanflow.com, expanded from the site's own route files. A URL absent from this list does not exist.",
    mimeType: "application/json",
    read: (m) => ({ siteUrl: m.brand.url, routeCount: m.site.routeCount, routes: m.site.routes }),
  },
  {
    uri: "kanchanflow://site/seo-contract",
    name: "kanchanflow-seo-contract",
    title: "SEO and content contract",
    description:
      "Metadata budgets, the structured-data types the site emits, the types it forbids, the hreflang policy and the content guardrails.",
    mimeType: "application/json",
    read: (m) => ({
      metadataBudget: m.site.metadataBudget,
      schemaTypesEmitted: m.site.schemaTypes,
      schemaTypesForbidden: m.site.forbiddenSchemaTypes,
      hreflang: m.site.hreflang,
      keywords: m.brand.keywords,
    }),
  },
];

export const siteResourcesByUri: ReadonlyMap<string, SiteResource> = new Map(
  siteResources.map((r) => [r.uri, r])
);

/** Read one site resource by URI. Returns null for an unknown URI. */
export function readSiteResource(uri: string): { uri: string; mimeType: string; text: string } | null {
  const resource = siteResourcesByUri.get(uri);
  if (!resource) return null;
  const mirror = loadMirror();
  return {
    uri,
    mimeType: resource.mimeType,
    text: JSON.stringify(
      {
        source: {
          ...freshness(mirror.meta.syncedAt, Date.now(), undefined, mirror.brand.url),
          siteUrl: mirror.meta.siteUrl,
        },
        data: resource.read(mirror),
      },
      null,
      2
    ),
  };
}

export const REFERENCE_URI_PREFIX = "kanchanflow://reference/";

/** Every reference document, advertised as its own resource. */
export function referenceResources(): {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: string;
}[] {
  return referenceLoader()
    .list()
    .map((doc) => ({
      uri: `${REFERENCE_URI_PREFIX}${doc.path}`,
      name: `reference-${doc.path.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      title: doc.title,
      description: doc.summary || `Reference document: ${doc.path}`,
      mimeType: doc.path.endsWith(".json") ? "application/json" : "text/markdown",
    }));
}

/** Read a reference document addressed by its kanchanflow://reference/ URI. */
export function readReferenceResource(uri: string): { uri: string; mimeType: string; text: string } {
  const relPath = decodeURIComponent(uri.slice(REFERENCE_URI_PREFIX.length));
  const doc = referenceLoader().read(relPath);
  return {
    uri,
    mimeType: doc.path.endsWith(".json") ? "application/json" : "text/markdown",
    text: doc.content,
  };
}
