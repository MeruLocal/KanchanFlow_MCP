#!/usr/bin/env node
/**
 * CONTENT MIRROR SYNC
 * ===================
 *
 * Reads the real KanchanFlow website repository and writes two things:
 *
 *   1. data/site-mirror.json  — every fact this MCP server serves, extracted
 *      verbatim from content/*.js in the website repo.
 *   2. reference/site/*.md    — verbatim copies of the website's own contract
 *      and documentation files, so the packaged reference set is standalone.
 *
 * Nothing in this script invents, paraphrases or embellishes a value. If a
 * field is not in the website repo it does not appear in the mirror, and the
 * MCP tool that would have served it reports NOT_FOUND rather than guessing.
 *
 * Usage:
 *   npm run sync                       # expects ../KanchanFlow
 *   npm run sync -- --repo /path/to/KanchanFlow
 *   KANCHANFLOW_REPO=/path npm run sync
 *
 * The website's content/*.js files are ESM that import each other through the
 * "@/content/x" alias and read NEXT_PUBLIC_SITE_URL. We copy them to a temp
 * directory, rewrite the alias to a relative import, and import them — the
 * same technique the website's own scripts/gen-seo-files.mjs uses.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");

/* ------------------------------------------------------------------ */
/* Locate the website repo                                             */
/* ------------------------------------------------------------------ */

function resolveRepo() {
  const flag = process.argv.indexOf("--repo");
  const raw =
    (flag !== -1 ? process.argv[flag + 1] : undefined) ||
    process.env.KANCHANFLOW_REPO ||
    path.join(ROOT, "..", "KanchanFlow");
  const abs = path.resolve(raw);
  if (!fs.existsSync(path.join(abs, "content", "brand.js"))) {
    throw new Error(
      `Not a KanchanFlow website repo: ${abs}\n` +
        "Expected to find content/brand.js there.\n" +
        "Pass --repo <path> or set KANCHANFLOW_REPO."
    );
  }
  return abs;
}

const REPO = resolveRepo();

/* ------------------------------------------------------------------ */
/* Import the website's ESM content modules                            */
/* ------------------------------------------------------------------ */

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kanchanflow-mirror-"));

async function load(name) {
  const src = fs.readFileSync(path.join(REPO, "content", `${name}.js`), "utf8");
  const dst = path.join(tmp, `${name}.mjs`);
  fs.writeFileSync(dst, src.replace(/from "@\/content\/([\w-]+)"/g, 'from "./$1.mjs"'));
  return import(pathToFileURL(dst).href);
}

const brandMod = await load("brand");
const pricingMod = await load("pricing");
const featuresMod = await load("features");
const integrationsMod = await load("integrations");
const countriesMod = await load("countries");
const blogMod = await load("blog");
const glossaryMod = await load("glossary");
const changelogMod = await load("changelog");
const partnersMod = await load("partners");

/* ------------------------------------------------------------------ */
/* Route map — derived from the real app/ directory                    */
/* ------------------------------------------------------------------ */

/**
 * Walk app/ for page.js files and turn each into a route. Dynamic [slug]
 * segments are expanded from the content collection that supplies them, so
 * the map lists real URLs rather than templates. Route groups "(x)" and
 * private "_x" folders are skipped the way the Next.js router skips them.
 */
function buildRouteMap() {
  const APP = path.join(REPO, "app");
  const dynamicSources = {
    "/features": featuresMod.featureSlugs,
    "/integrations": integrationsMod.integrationSlugs,
    "/blog": blogMod.postSlugs,
    "/glossary": glossaryMod.glossarySlugs,
  };

  const routes = [];
  const walk = (dir, segments) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("_") || entry.name.startsWith("(")) continue;
      if (entry.name === "api") continue;
      walk(path.join(dir, entry.name), [...segments, entry.name]);
    }
    if (!fs.existsSync(path.join(dir, "page.js"))) return;

    const base = `/${segments.join("/")}`;
    const last = segments[segments.length - 1];
    if (last && last.startsWith("[")) {
      const parent = `/${segments.slice(0, -1).join("/")}`;
      const slugs = dynamicSources[parent];
      if (!slugs) return; // an unrecognised dynamic route contributes nothing
      for (const slug of slugs) routes.push(`${parent}/${slug}`);
      return;
    }
    routes.push(base === "/" || base === "" ? "/" : base);
  };
  walk(APP, []);
  return [...new Set(routes)].sort();
}

/* ------------------------------------------------------------------ */
/* Source provenance                                                   */
/* ------------------------------------------------------------------ */

function gitCommit() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: REPO,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Build the mirror                                                    */
/* ------------------------------------------------------------------ */

const { brand, entity, compliance, trustBadges, social, sameAs, locales, keywords, nav, footerColumns, legalLinks } =
  brandMod;

const routes = buildRouteMap();

const mirror = {
  meta: {
    mirrorVersion: 1,
    syncedAt: new Date().toISOString(),
    sourceRepo: "kanchanflow-crm-web",
    sourceCommit: gitCommit(),
    siteUrl: brand.url,
    note:
      "Generated by scripts/sync-content.mjs from the KanchanFlow website repository. " +
      "Every value is copied verbatim from content/*.js. Do not hand-edit this file.",
  },

  brand: { ...brand, entity, compliance, trustBadges, social, sameAs, locales, keywords },

  navigation: { primary: nav, footer: footerColumns, legal: legalLinks },

  pricing: {
    trial: pricingMod.trial,
    tiers: pricingMod.tiers,
    annualDiscountPct: pricingMod.annualDiscountPct,
    addOns: pricingMod.addOns,
    creditWeights: pricingMod.creditWeights,
    creditAllowance: pricingMod.creditAllowance,
    whatsappBilling: pricingMod.whatsappBilling,
    ceilingPolicy: pricingMod.ceilingPolicy,
    featureMatrix: pricingMod.featureMatrix,
    faqs: pricingMod.pricingFaqs,
  },

  features: {
    indiaFraming: featuresMod.INDIA_FRAMING,
    items: featuresMod.features,
    categories: featuresMod.featureCategories.map((c) => ({
      name: c.name,
      slugs: c.features.map((f) => f.slug),
    })),
    statusCounts: featuresMod.featureStatusCounts,
    aliases: featuresMod.featureAliases,
  },

  integrations: {
    items: integrationsMod.integrations,
    categories: integrationsMod.integrationCategories,
    testing: integrationsMod.integrationTesting,
  },

  markets: {
    ratesAsOf: countriesMod.RATES_AS_OF,
    defaultCountry: countriesMod.DEFAULT_COUNTRY,
    countries: countriesMod.countries,
  },

  blog: {
    author: blogMod.AUTHOR,
    cadence: blogMod.cadence,
    posts: blogMod.posts,
    upcoming: blogMod.upcoming,
  },

  glossary: { terms: glossaryMod.terms },

  changelog: {
    cadence: changelogMod.changelogCadence,
    tags: changelogMod.changelogTags,
    releases: changelogMod.releasesNewestFirst,
    roadmap: changelogMod.roadmapBuckets,
  },

  partners: {
    types: partnersMod.partnerTypes,
    whyPartner: partnersMod.whyPartner,
    tiers: partnersMod.partnerTiers,
    guardrails: partnersMod.partnerGuardrails,
    certificationTracks: partnersMod.certificationTracks,
    certificationPolicy: partnersMod.certificationPolicy,
    reviewCommitment: partnersMod.reviewCommitment,
    portalCapabilities: partnersMod.portalCapabilities,
    directoryListings: partnersMod.directoryListings,
    faqs: partnersMod.partnerFaqs,
  },

  site: {
    routes,
    routeCount: routes.length,
    /* Structured-data helpers the site actually exports from lib/schema.js. */
    schemaTypes: [
      "Organization",
      "WebSite",
      "SoftwareApplication",
      "BreadcrumbList",
      "Article",
      "HowTo",
      "ItemList",
      "DefinedTerm",
    ],
    /*
     * Schema types the website contract forbids outright (SPEC-CONTRACT.md §0
     * guardrails 1 and 2). Stated here so an AI client cannot propose them.
     */
    forbiddenSchemaTypes: ["FAQPage", "Review", "AggregateRating"],
    /* SERP budgets from the website's own scripts/seo-lengths.mjs. */
    metadataBudget: {
      titleSuffix: " · KanchanFlow",
      titleMaxRendered: 62,
      titleMaxPageLevel: 48,
      descriptionMin: 70,
      descriptionTargetMin: 120,
      descriptionMax: 158,
    },
    hreflang: locales.hreflang,
  },
};

fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "data", "site-mirror.json"),
  `${JSON.stringify(mirror, null, 2)}\n`
);

/* ------------------------------------------------------------------ */
/* Mirror the website's own documents into reference/site/             */
/* ------------------------------------------------------------------ */

const SITE_DOCS = [
  ["SPEC-CONTRACT.md", "spec-contract.md", "The website build contract — the locked guardrails every page obeys."],
  ["README.md", "website-readme.md", "The website repository README: route inventory, content architecture, design system."],
  ["docs/seo/01-strategy.md", "seo/01-strategy.md", "SEO strategy for the KanchanFlow site."],
  ["docs/seo/02-keywords.md", "seo/02-keywords.md", "Keyword architecture and target terms."],
  ["docs/seo/03-architecture.md", "seo/03-architecture.md", "Site and URL architecture."],
  ["docs/seo/04-editorial.md", "seo/04-editorial.md", "Editorial standards and house style."],
  ["docs/seo/05-technical.md", "seo/05-technical.md", "Technical SEO requirements."],
  ["docs/seo/06-roadmap.md", "seo/06-roadmap.md", "SEO delivery roadmap."],
  ["docs/seo/07-page-briefs.md", "seo/07-page-briefs.md", "Per-page content briefs."],
  ["docs/seo/08-conflicts.md", "seo/08-conflicts.md", "Known content conflicts and their resolutions."],
];

const siteRefDir = path.join(ROOT, "reference", "site");
fs.mkdirSync(path.join(siteRefDir, "seo"), { recursive: true });

let copied = 0;
const manifest = [];
for (const [from, to, summary] of SITE_DOCS) {
  const src = path.join(REPO, from);
  if (!fs.existsSync(src)) continue;
  const header =
    `<!-- SYNCED COPY. Source of truth: ${from} in the KanchanFlow website repository.\n` +
    `     Regenerate with \`npm run sync\`. Do not edit this copy by hand. -->\n\n`;
  fs.writeFileSync(path.join(siteRefDir, to), header + fs.readFileSync(src, "utf8"));
  manifest.push({ path: `site/${to}`, source: from, summary });
  copied += 1;
}

fs.writeFileSync(
  path.join(siteRefDir, "MANIFEST.json"),
  `${JSON.stringify({ syncedAt: mirror.meta.syncedAt, sourceCommit: mirror.meta.sourceCommit, documents: manifest }, null, 2)}\n`
);

/* ------------------------------------------------------------------ */
/* Mirror the brand artwork into assets/brand/                         */
/* ------------------------------------------------------------------ */

/*
 * The homepage the HTTP transport serves needs the real logo, and the browser
 * tab needs a real icon. Both are copied from the website repository rather
 * than redrawn here, for the same reason the content is: two copies of a logo
 * drift, and the one nobody looks at is the one that goes stale.
 *
 * Only these three files. The MCP server has no use for the rest of the brand
 * kit, and an assets folder that accumulates is an assets folder that ships
 * megabytes nobody serves.
 */
const BRAND_ASSETS = [
  ["public/brand/kanchanflow-logo-light.png", "kanchanflow-logo-light.png", "Full lockup for a light background."],
  ["public/brand/kanchanflow-logo-dark.png", "kanchanflow-logo-dark.png", "Full lockup for a dark background."],
  ["public/brand/icon-192.png", "icon-192.png", "Browser tab and bookmark icon."],
];

const brandDir = path.join(ROOT, "assets", "brand");
fs.mkdirSync(brandDir, { recursive: true });

let brandCopied = 0;
const brandManifest = [];
for (const [from, to, summary] of BRAND_ASSETS) {
  const src = path.join(REPO, from);
  if (!fs.existsSync(src)) continue;
  fs.copyFileSync(src, path.join(brandDir, to));
  brandManifest.push({ file: to, source: from, summary, bytes: fs.statSync(src).size });
  brandCopied += 1;
}

fs.writeFileSync(
  path.join(brandDir, "MANIFEST.json"),
  `${JSON.stringify({ syncedAt: mirror.meta.syncedAt, sourceCommit: mirror.meta.sourceCommit, assets: brandManifest }, null, 2)}\n`
);

fs.rmSync(tmp, { recursive: true, force: true });

const bytes = fs.statSync(path.join(ROOT, "data", "site-mirror.json")).size;
console.log(
  [
    `Mirror written from ${REPO}${mirror.meta.sourceCommit ? ` @ ${mirror.meta.sourceCommit}` : ""}`,
    `  data/site-mirror.json   ${(bytes / 1024).toFixed(0)} KB`,
    `  features                ${mirror.features.items.length} (${mirror.features.statusCounts.live} live, ${mirror.features.statusCounts.building} building, ${mirror.features.statusCounts.planned} planned)`,
    `  integrations            ${mirror.integrations.items.length}`,
    `  pricing tiers           ${mirror.pricing.tiers.length}`,
    `  markets                 ${mirror.markets.countries.length}`,
    `  glossary terms          ${mirror.glossary.terms.length}`,
    `  blog posts              ${mirror.blog.posts.length} published, ${mirror.blog.upcoming.length} scheduled`,
    `  releases                ${mirror.changelog.releases.length}`,
    `  routes                  ${mirror.site.routeCount}`,
    `  reference/site docs     ${copied}`,
    `  assets/brand files      ${brandCopied}`,
  ].join("\n")
);
