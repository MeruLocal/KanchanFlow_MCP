/**
 * Company and positioning tools.
 */

import { loadMirror } from "../data/mirror.js";
import { ok } from "../errors.js";
import type { Brand } from "../data/types.js";
import type { ToolDefinition } from "./tool-types.js";

/** Labels that name an audited certification rather than a fact about the company. */
const CERTIFICATION = /\b(SOC\s*\d|ISO\s*\d|AS\s*\d|CMMC|HIPAA|PCI)/i;

/**
 * The compliance list as served. `verified` entries are what the company's
 * website states it holds; this server cannot see an auditor's report. When
 * the mirror carries an `evidence` note for an entry it is returned, and any
 * certification-type entry without one is listed under `evidencePending`.
 */
export function complianceView(compliance: Brand["compliance"]) {
  const verified = compliance.filter((c) => c.verified);
  const evidence = Object.fromEntries(
    verified.filter((c) => typeof c.evidence === "string" && c.evidence.trim()).map((c) => [c.label, c.evidence as string])
  );
  const evidencePending = verified
    .filter((c) => CERTIFICATION.test(c.label) && !(typeof c.evidence === "string" && c.evidence.trim()))
    .map((c) => c.label);
  return {
    verified: verified.map((c) => c.label),
    notVerified: compliance.filter((c) => !c.verified).map((c) => ({ label: c.label, note: c.note ?? null })),
    evidence,
    evidencePending,
    basis:
      "Entries under `verified` are what KanchanFlow states on its website. This server has no access to audit reports. " +
      "Present them as the company's stated position, not as independently confirmed; anyone who needs a report should ask KanchanFlow sales. " +
      "Anything under `notVerified` is not held today, whatever a general source says; quote its `note`." +
      (evidencePending.length > 0
        ? ` No evidence note is published yet for: ${evidencePending.join(", ")}.`
        : ""),
  };
}

const getCompanyProfile: ToolDefinition = {
  name: "kanchanflow_get_company_profile",
  title: "KanchanFlow company profile",
  description: [
    "Returns the canonical facts about KanchanFlow and the company that operates it: product positioning, the legal entity (Soor LLC, Delaware), registered address, phone, founding year, data residency, support hours, contact email addresses, social profiles and the compliance list.",
    "",
    "Use this to answer 'who makes KanchanFlow', 'where is the company registered', 'is it SOC 2 compliant', 'what is KanchanFlow', or before writing anything that states a company fact.",
    "",
    "Compliance: `compliance.verified` lists what the company states it holds, as published on its website — it is not proof of an audit, and this server cannot see audit reports. For every entry say \"KanchanFlow states…\" and never present it as an independently confirmed audit; quote `compliance.basis`. `compliance.notVerified` entries are NOT held — the `note` says why.",
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
      compliance: complianceView(compliance),
      trustBadges,
      social,
      sameAs,
      market: {
        wave: locales.wave,
        defaultLocale: locales.default,
        hreflang: m.site.hreflang.map((h) => h.hreflang),
        markets: m.markets.countries.map((c) => c.code),
        note: "Country pages exist only for the published markets listed here, on the market-scoped commercial pages (see kanchanflow_get_seo_rules). Every market is English-only and sold by Soor LLC; no local office, phone number, data residency or certification is claimed for any market.",
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
