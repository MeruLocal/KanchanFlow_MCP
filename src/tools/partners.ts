/**
 * Partner-program tool.
 */

import { z } from "zod";

import { loadMirror } from "../data/mirror.js";
import { ok } from "../errors.js";
import type { ToolDefinition } from "./tool-types.js";

type PartnerSection =
  | "types"
  | "whyPartner"
  | "tiers"
  | "guardrails"
  | "certificationTracks"
  | "certificationPolicy"
  | "reviewCommitment"
  | "portalCapabilities"
  | "faqs";

const getPartnerProgram: ToolDefinition<{ section?: PartnerSection }> = {
  name: "kanchanflow_get_partner_program",
  title: "Get the KanchanFlow partner program",
  description: [
    "Returns the published partner program: partner types, tiers and their commission rates, the program guardrails, the certification tracks and policy, what sits behind the partner portal, the application review commitment, and the partner FAQs.",
    "",
    "Use it for 'how do I become a KanchanFlow partner', 'what commission do partners earn', 'is there an exclusive territory'. Optional `section` returns one part of the program.",
    "",
    "The public partner directory is currently empty — there are no listed partners yet. Say so rather than implying a partner network exists.",
  ].join("\n"),
  inputSchema: {
    section: z
      .enum([
        "types",
        "whyPartner",
        "tiers",
        "guardrails",
        "certificationTracks",
        "certificationPolicy",
        "reviewCommitment",
        "portalCapabilities",
        "faqs",
      ])
      .optional()
      .describe("Return only this part of the program."),
  },
  handler: ({ section }) => {
    const m = loadMirror();
    const p = m.partners;
    const full: Record<PartnerSection, unknown> = {
      types: p.types,
      whyPartner: p.whyPartner,
      tiers: p.tiers,
      guardrails: p.guardrails,
      certificationTracks: p.certificationTracks,
      certificationPolicy: p.certificationPolicy,
      reviewCommitment: p.reviewCommitment,
      portalCapabilities: p.portalCapabilities,
      faqs: p.faqs,
    };

    const body: Record<string, unknown> = section ? { [section]: full[section] } : { ...full };

    return ok({
      ...body,
      directory: {
        listedPartners: p.directoryListings.length,
        note:
          p.directoryListings.length === 0
            ? "The public partner directory has no listings yet. Do not imply an existing partner network."
            : undefined,
      },
      urls: {
        program: `${m.brand.url}/partners`,
        directory: `${m.brand.url}/partners/directory`,
        certification: `${m.brand.url}/partners/certification`,
      },
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const partnerTools: ToolDefinition[] = [getPartnerProgram as ToolDefinition];
