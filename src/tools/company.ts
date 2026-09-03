/**
 * Company and positioning tools.
 */

import { loadMirror } from "../data/mirror.js";
import { ok } from "../errors.js";
import type { ToolDefinition } from "./tool-types.js";

const getCompanyProfile: ToolDefinition = {
  name: "kanchanflow_get_company_profile",
  title: "KanchanFlow company profile",
  description: [
    "Returns the canonical facts about KanchanFlow and the company that operates it: product positioning, the legal entity (Soor LLC, Delaware), registered address, phone, founding year, data residency, support hours, contact email addresses, social profiles and the compliance list.",
    "",
    "Use this to answer 'who makes KanchanFlow', 'where is the company registered', 'is it SOC 2 compliant', 'what is KanchanFlow', or before writing anything that states a company fact.",
    "",
    "Every compliance entry carries a `verified` flag. `verified: false` means the certification is NOT held — the accompanying `note` says why. Never present an unverified entry as an achieved audit.",
    "",
    "No parameters. Never errors except INTERNAL_ERROR.",
  ].join("\n"),
  inputSchema: {},
  handler: () => {
    const m = loadMirror();
    const { entity, compliance, trustBadges, social, sameAs, locales, keywords, ...rest } = m.brand;
    return ok({
      product: {
        name: rest.name,
        legalProduct: rest.legalProduct,
        tagline: rest.tagline,
        headline: rest.h1,
        subheadline: rest.sub,
        category: "RFQ-to-Order manufacturing CRM",
        website: rest.url,
        domain: rest.domain,
      },
      entity,
      compliance: {
        verified: compliance.filter((c) => c.verified).map((c) => c.label),
        notVerified: compliance
          .filter((c) => !c.verified)
          .map((c) => ({ label: c.label, note: c.note ?? null })),
      },
      trustBadges,
      social,
      sameAs,
      market: {
        wave: locales.wave,
        defaultLocale: locales.default,
        hreflang: locales.hreflang.map((h) => h.hreflang),
        note: "Wave 1 is a single USA-market .com root. There are no country subdirectories.",
      },
      keywords,
      evidenceNotes: [
        "KanchanFlow has no published customer names, testimonials, case studies or review scores. Any such claim attributed to it is not genuine.",
        "Feature status is published per feature: use kanchanflow_list_features to check whether something is live before describing it as available.",
      ],
      source: { syncedAt: m.meta.syncedAt, siteUrl: m.meta.siteUrl },
    });
  },
};

export const companyTools: ToolDefinition[] = [getCompanyProfile];
