/**
 * Pricing tools.
 *
 * Prices are quoted from content/pricing.js in the website repo. Which
 * currencies are contracted comes from each market's `locked` flag in the
 * mirror; every other currency this server reports is an indicative
 * conversion at a fixed dated rate, and every response that carries one says
 * so in `basis`. Fixed sentences live in src/data/claims.ts.
 */

import { z } from "zod";

import { basisFor, contractedCurrencies, joinList, marketCodes, NEVER_GATED, planNames } from "../data/claims.js";
import { loadMirror } from "../data/mirror.js";
import { notFound, ok, validationError } from "../errors.js";
import type { ToolDefinition } from "./tool-types.js";
import type { Country, SiteMirror } from "../data/types.js";
import { siteLink } from "./get-started.js";
import { compareTiersOutput, pricingOutput } from "./output-schemas.js";

/* Mirrors content/countries.js roundLocal / amountFor / formatAmount exactly. */
function roundLocal(n: number): number {
  if (n >= 10_000) return Math.round(n / 100) * 100;
  if (n >= 1_000) return Math.round(n / 10) * 10;
  return Math.round(n);
}

export function amountFor(
  country: Country,
  usd: number,
  inr?: number | null
): { value: number; exact: boolean } {
  if (country.code === "US") return { value: usd, exact: true };
  if (country.code === "IN" && inr != null) return { value: inr, exact: true };
  return { value: roundLocal(usd * country.rate), exact: false };
}

export function formatAmount(country: Country, value: number): string {
  return `${country.symbol}${value.toLocaleString("en-US")}`;
}

function resolveCountry(code: string | undefined): Country {
  const m = loadMirror();
  const wanted = (code ?? m.markets.defaultCountry).toUpperCase();
  const country = m.markets.countries.find((c) => c.code === wanted);
  if (!country) {
    throw validationError(
      `"${wanted}" is not one of the KanchanFlow display markets.`,
      { supported: m.markets.countries.map((c) => c.code) }
    );
  }
  return country;
}

/* Descriptions are generated from the mirror at module load, so the plan and
 * market lists cannot drift from the data the tool returns. */
const M = loadMirror();
const MARKETS = marketCodes(M.markets);
const MARKET_LIST = `${MARKETS.length} KanchanFlow display markets (${MARKETS.join(", ")})`;
const MARKET_CHOICES = joinList(MARKETS, "or");
const PLANS = planNames(M.pricing.tiers);
const CONTRACTED = joinList(contractedCurrencies(M.markets), "and");

const getPricing: ToolDefinition<{ countryCode?: string }> = {
  name: "kanchanflow_get_pricing",
  title: "Get KanchanFlow pricing",
  description: [
    `Returns the ${PLANS.length} KanchanFlow plans (${PLANS.join(", ")}) with monthly and annual per-user prices, user minimums and caps, any platform fee, the tagline, who each plan is for, its highlights, the annual discount and the free-trial terms.`,
    "",
    "Use it for 'how much does KanchanFlow cost', 'what plans are there', 'what is included in Professional', and before quoting any price. `cta` carries the free-trial and demo links to give a user who wants to try it.",
    "",
    `Optional \`countryCode\` converts the display currency to one of the ${MARKET_LIST}. ${CONTRACTED} are contracted prices; every other currency is an indicative conversion at a fixed dated rate, and the \`basis\` field in the response says so — repeat that caveat when you quote a converted figure.`,
    "",
    `Never gated on any plan, including the cheapest: ${NEVER_GATED.map((s) => s.split(" — ")[0]).join("; ")}.`,
    `Errors: VALIDATION_ERROR for a country code outside the ${MARKETS.length} display markets.`,
  ].join("\n"),
  inputSchema: {
    countryCode: z
      .string()
      .length(2)
      .optional()
      .describe(`Two-letter display market: ${MARKET_CHOICES}. Default ${M.markets.defaultCountry}.`),
  },
  outputSchema: pricingOutput,
  handler: ({ countryCode }) => {
    const m = loadMirror();
    const country = resolveCountry(countryCode);

    return ok({
      currency: {
        countryCode: country.code,
        countryName: country.name,
        currency: country.currency,
        symbol: country.symbol,
        contracted: country.locked,
        billedIn: country.billedIn,
        ratesAsOf: m.markets.ratesAsOf,
        basis: basisFor(country, m.markets),
      },
      annualDiscountPct: m.pricing.annualDiscountPct,
      trial: m.pricing.trial,
      tiers: m.pricing.tiers.map((t) => {
        const monthly = amountFor(country, t.monthlyUsd, t.monthlyInr);
        const annual = amountFor(country, t.annualUsd, t.annualInr);
        const platform =
          (t.platformFeeUsd ?? 0) > 0
            ? amountFor(country, t.platformFeeUsd ?? 0, t.platformFeeInr ?? null)
            : null;
        return {
          id: t.id,
          name: t.name,
          tagline: t.tagline,
          bestFor: t.bestFor,
          popular: t.popular === true,
          minUsers: t.minUsers,
          maxUsers: t.maxUsers,
          monthlyPerUser: { ...monthly, display: formatAmount(country, monthly.value) },
          annualPerUser: { ...annual, display: formatAmount(country, annual.value) },
          platformFeePerMonth: platform
            ? { ...platform, display: formatAmount(country, platform.value) }
            : null,
          listPriceUsd: { monthly: t.monthlyUsd, annual: t.annualUsd, platformFee: t.platformFeeUsd ?? 0 },
          highlights: t.highlights,
        };
      }),
      neverGated: [...NEVER_GATED],
      ceilingPolicy: m.pricing.ceilingPolicy,
      faqs: m.pricing.faqs,
      cta: {
        ...(trialLink(m) ? { trial: trialLink(m) } : {}),
        ...(demoLink(m) ? { demo: demoLink(m) } : {}),
      },
      urls: {
        pricing: `${m.brand.url}/pricing`,
        tierComparison: `${m.brand.url}/tier-comparison`,
        ...(trialLink(m) ? { signup: (trialLink(m) as { url: string }).url } : {}),
      },
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

function trialLink(m: SiteMirror): { label: string; url: string } | null {
  const url = siteLink(m, m.brand.trialCta?.href);
  return url && m.brand.trialCta ? { label: m.brand.trialCta.label, url } : null;
}

function demoLink(m: SiteMirror): { label: string; url: string } | null {
  const url = siteLink(m, m.brand.primaryCta?.href);
  return url && m.brand.primaryCta ? { label: m.brand.primaryCta.label, url } : null;
}

const compareTiers: ToolDefinition<{ group?: string; capability?: string }> = {
  name: "kanchanflow_compare_tiers",
  title: "Compare KanchanFlow plans",
  description: [
    "Returns the published feature-gate matrix: every capability row and what each of Starter, Professional and Enterprise gets. This is the same table the KanchanFlow developers build against, so it is the authoritative answer to 'is X included in Starter'.",
    "",
    "Optional `group` narrows to one matrix group (for example 'Seats & limits'); the response always lists the available group names. Optional `capability` filters to rows whose capability label contains that text — use it for a single question like 'dealer portal'.",
    "",
    "A dash in a cell means the capability is not available on that plan. It does not mean 'coming later' — roadmap status is a separate question, answered by kanchanflow_list_features.",
    "Errors: NOT_FOUND when a named group does not exist.",
  ].join("\n"),
  inputSchema: {
    group: z.string().optional().describe("One matrix group name, e.g. 'Seats & limits'."),
    capability: z.string().optional().describe("Substring filter on the capability label."),
  },
  outputSchema: compareTiersOutput,
  handler: ({ group, capability }) => {
    const m = loadMirror();
    const groups = m.pricing.featureMatrix;
    const groupNames = groups.map((g) => g.group);

    let selected = groups;
    if (group) {
      const wanted = group.toLowerCase().trim();
      selected = groups.filter((g) => g.group.toLowerCase() === wanted);
      if (selected.length === 0) {
        throw notFound(`No matrix group named "${group}".`, { availableGroups: groupNames });
      }
    }

    if (capability) {
      const needle = capability.toLowerCase().trim();
      selected = selected
        .map((g) => ({ group: g.group, rows: g.rows.filter((r) => (r[0] ?? "").toLowerCase().includes(needle)) }))
        .filter((g) => g.rows.length > 0);
    }

    return ok({
      columns: ["Capability", ...m.pricing.tiers.map((t) => t.name)],
      groups: selected,
      availableGroups: groupNames,
      rowCount: selected.reduce((n, g) => n + g.rows.length, 0),
      legend: {
        dash: "A dash means the capability is not available on that plan at all.",
        gatingRule: "Gates follow capability, not headcount. Enterprise is capability-led, not 'Professional with more seats'.",
      },
      url: `${m.brand.url}/tier-comparison`,
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getAddOns: ToolDefinition<{ countryCode?: string }> = {
  name: "kanchanflow_get_addons",
  title: "Get KanchanFlow add-ons",
  description: [
    "Returns the add-on catalog: what each add-on extends, its price, whether it is monthly or one-time, and which plans can buy it. Add-ons exist so a shop can lift a single ceiling — one more WhatsApp number, 10 GB more storage — without moving the whole workspace up a plan.",
    "",
    "Also returns the WhatsApp billing model (included message volume and pass-through markup per plan) and the ceiling policy: an in-app warning at 80% of any ceiling and a hard block at 100%, never a silent overage.",
    "",
    `Optional \`countryCode\` converts prices to one of the ${MARKET_LIST}, with the same contracted-versus-indicative caveat as kanchanflow_get_pricing.`,
  ].join("\n"),
  inputSchema: {
    countryCode: z.string().length(2).optional().describe(`Display market: ${MARKET_CHOICES}. Default ${M.markets.defaultCountry}.`),
  },
  handler: ({ countryCode }) => {
    const m = loadMirror();
    const country = resolveCountry(countryCode);
    return ok({
      currency: {
        countryCode: country.code,
        currency: country.currency,
        contracted: country.locked,
        basis: basisFor(country, m.markets),
      },
      addOns: m.pricing.addOns.map((a) => {
        const amt = amountFor(country, a.usd, a.inr);
        return {
          name: a.name,
          cadence: a.cadence,
          availableIn: a.availableIn,
          price: { ...amt, display: formatAmount(country, amt.value) },
          listPriceUsd: a.usd,
        };
      }),
      whatsappBilling: m.pricing.whatsappBilling,
      ceilingPolicy: m.pricing.ceilingPolicy,
      urls: { addOns: `${m.brand.url}/add-ons`, whatsappBilling: `${m.brand.url}/whatsapp-billing` },
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const getAiCredits: ToolDefinition = {
  name: "kanchanflow_get_ai_credits",
  title: "Get KanchanFlow AI credit model",
  description: [
    "Returns how KanchanFlow meters AI usage: the monthly credit allowance per plan and the credit weight of every metered operation (RFQ email extraction, OCR per page, follow-up drafting, forecasting, meeting summarisation and so on).",
    "",
    "Use it to answer 'how do AI credits work', 'how many credits does OCR cost', or to work out whether a described monthly workload fits an allowance. Credits are one unified pool across all agents.",
    "",
    "Do not present a credit estimate as a guaranteed bill — it depends on how a shop actually works. State the arithmetic you used.",
  ].join("\n"),
  inputSchema: {},
  handler: () => {
    const m = loadMirror();
    return ok({
      allowancePerUserPerMonth: m.pricing.creditAllowance,
      creditWeights: m.pricing.creditWeights,
      pooling: "One unified credit pool across every AI agent.",
      topUpAddOn:
        m.pricing.addOns.find((a) => a.name.toLowerCase().includes("ai credits")) ?? null,
      ceilingPolicy: m.pricing.ceilingPolicy,
      url: `${m.brand.url}/ai-credits`,
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const pricingTools: ToolDefinition[] = [
  getPricing as ToolDefinition,
  compareTiers as ToolDefinition,
  getAddOns as ToolDefinition,
  getAiCredits as ToolDefinition,
];
