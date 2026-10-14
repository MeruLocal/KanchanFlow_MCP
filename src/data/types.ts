/**
 * Types for data/site-mirror.json.
 *
 * These describe the KanchanFlow website's own content collections. They are
 * deliberately close to the source shape rather than a re-modelling of it:
 * the mirror is a copy, and a copy that renames fields is a copy that drifts.
 *
 * Fields the website carries but no tool reads are permitted through the
 * index signature on the record types, so a new field on the website appears
 * in tool output on the next `npm run sync` without a code change here.
 */

export type FeatureStatus = "live" | "beta" | "building" | "planned";
export type TierId = "starter" | "professional" | "enterprise";

export interface Faq {
  q: string;
  a: string;
}

export interface MirrorMeta {
  mirrorVersion: number;
  syncedAt: string;
  sourceRepo: string;
  sourceCommit: string | null;
  siteUrl: string;
  note: string;
}

export interface Entity {
  legalName: string;
  jurisdiction: string;
  addressLine: string;
  phone: string;
  foundingDate: string;
  dataResidency: string;
  supportHours: string;
  ownershipLine: string;
  email: Record<string, string>;
  [key: string]: unknown;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface Brand {
  name: string;
  legalProduct: string;
  domain: string;
  url: string;
  tagline: string;
  h1: string;
  sub: string;
  /** Main call to action, e.g. the demo. */
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  /** The free-trial call to action. */
  trialCta?: CtaLink;
  entity: Entity;
  compliance: { label: string; verified: boolean; note?: string; evidence?: string }[];
  trustBadges: { label: string; detail: string }[];
  social: Record<string, string>;
  sameAs: string[];
  locales: {
    wave: number;
    default: string;
    hreflang: { hreflang: string; path: string }[];
    [key: string]: unknown;
  };
  keywords: { head: string[]; wedge: string[]; rejected: string[] };
  [key: string]: unknown;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Navigation {
  primary: unknown[];
  footer: { title: string; links: NavLink[] }[];
  legal: NavLink[];
}

export interface Tier {
  id: TierId;
  name: string;
  monthlyUsd: number;
  annualUsd: number;
  monthlyInr: number;
  annualInr: number;
  minUsers: number;
  maxUsers: number | null;
  platformFeeUsd: number;
  platformFeeInr?: number;
  popular?: boolean;
  tagline: string;
  bestFor: string;
  highlights: string[];
  [key: string]: unknown;
}

export interface AddOn {
  name: string;
  usd: number;
  inr: number;
  cadence: string;
  availableIn: string;
}

export interface MatrixGroup {
  group: string;
  rows: string[][];
}

export interface Pricing {
  trial: { days: number; creditCard: boolean; sampleData: boolean; blurb: string };
  tiers: Tier[];
  annualDiscountPct: number;
  addOns: AddOn[];
  creditWeights: { op: string; credits: number | string }[];
  creditAllowance: Record<string, number | string>;
  whatsappBilling: {
    included: Record<string, number>;
    markupPct: Record<string, number>;
    numbers: Record<string, string>;
  };
  ceilingPolicy: { softWarnPct: number; hardBlockPct: number; note: string };
  featureMatrix: MatrixGroup[];
  faqs: Faq[];
}

export interface Feature {
  slug: string;
  name: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  status: FeatureStatus;
  target: string | null;
  wave: number | string;
  lead: string;
  answer: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  summary?: string[];
  capabilities?: { title: string; body: string }[];
  howItWorks?: { name: string; text: string }[];
  tierAvailability?: Record<string, string>;
  faqs?: Faq[];
  noindex?: boolean;
  [key: string]: unknown;
}

export interface Features {
  indiaFraming: string;
  items: Feature[];
  categories: { name: string; slugs: string[] }[];
  statusCounts: { live: number; building: number; planned: number; total: number };
  aliases: Record<string, string>;
}

export interface Integration {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  market: string;
  priority: string;
  status: FeatureStatus;
  target: string | null;
  lastTested: string;
  h1: string;
  tagline: string;
  metaDescription: string;
  answer: string;
  tiers: string;
  syncTo?: { field: string; detail: string }[];
  syncFrom?: { field: string; detail: string }[];
  cadence?: string;
  setup?: string[];
  limitations?: string[];
  troubleshooting?: { error: string; cause: string; fix: string }[];
  faqs?: Faq[];
  related?: string[];
  [key: string]: unknown;
}

export interface Integrations {
  items: Integration[];
  categories: string[];
  testing: { lastTested: string; cadence: string; note: string };
}

export interface Country {
  code: string;
  name: string;
  short: string;
  currency: string;
  symbol: string;
  rate: number;
  locked: boolean;
  billedIn: string;
}

export interface Markets {
  ratesAsOf: string;
  defaultCountry: string;
  countries: Country[];
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  keyword: string;
  description: string;
  datePublished: string;
  dateModified: string;
  readingMinutes: number;
  answer: string;
  sections: { h2: string; paragraphs: string[]; list?: string[] }[];
  faqs?: Faq[];
  [key: string]: unknown;
}

export interface Blog {
  author: string;
  cadence: { headline: string; detail: string };
  posts: BlogPost[];
  upcoming: { title: string; keyword: string; status: string }[];
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  answer: string;
  sections: { h2: string; paragraphs: string[]; list?: string[] }[];
  faqs?: Faq[];
  [key: string]: unknown;
}

export interface Release {
  date: string;
  title: string;
  tag: string;
  body: string;
}

export interface RoadmapItem {
  name: string;
  href?: string;
  note?: string;
  [key: string]: unknown;
}

export interface Changelog {
  cadence: string;
  tags: string[];
  releases: Release[];
  roadmap: Record<string, RoadmapItem[]>;
}

export interface Partners {
  types: unknown[];
  whyPartner: unknown[];
  tiers: unknown[];
  guardrails: unknown[];
  certificationTracks: unknown[];
  certificationPolicy: unknown[];
  reviewCommitment: { days: number; routing: string; steps: unknown[] };
  portalCapabilities: unknown[];
  directoryListings: unknown[];
  faqs: Faq[];
}

export interface SiteInfo {
  routes: string[];
  routeCount: number;
  schemaTypes: string[];
  forbiddenSchemaTypes: string[];
  metadataBudget: {
    titleSuffix: string;
    titleMaxRendered: number;
    titleMaxPageLevel: number;
    descriptionMin: number;
    descriptionTargetMin: number;
    descriptionMax: number;
  };
  hreflang: { hreflang: string; path: string }[];
}

export interface SiteMirror {
  meta: MirrorMeta;
  brand: Brand;
  navigation: Navigation;
  pricing: Pricing;
  features: Features;
  integrations: Integrations;
  markets: Markets;
  blog: Blog;
  glossary: { terms: GlossaryTerm[] };
  changelog: Changelog;
  partners: Partners;
  site: SiteInfo;
}
