/**
 * Display-market tools.
 *
 * The KanchanFlow market selector is display-only: it changes the currency a
 * price is shown in and nothing else. There are no country routes, no extra
 * hreflang and no different copy. These tools say so on every response so a
 * client cannot infer a localised site that does not exist.
 */

import { z } from "zod";

import { loadMirror } from "../data/mirror.js";
import { ok, validationError } from "../errors.js";
import { amountFor, formatAmount } from "./pricing.js";
import type { ToolDefinition } from "./tool-types.js";

const listMarkets: ToolDefinition = {
  name: "kanchanflow_list_markets",
  title: "List KanchanFlow display markets",
  description: [
    "Returns the seven markets the KanchanFlow pricing page can display, each with its currency, symbol, the fixed reference rate used for conversion, whether the price is contracted in that currency, and what the customer is actually billed in.",
    "",
    "USD and INR are contracted prices. GBP, AUD, AED, SGD and NZD are indicative conversions at a fixed dated reference rate and are billed in USD.",
    "",
    "This is a display currency list, not a list of localised sites. KanchanFlow Wave 1 is a single USA-market .com root: there are no country subdirectories, no per-country canonicals and no non-en-US hreflang alternates.",
  ].join("\n"),
  inputSchema: {},
  handler: () => {
    const m = loadMirror();
    return ok({
      ratesAsOf: m.markets.ratesAsOf,
      defaultCountry: m.markets.defaultCountry,
      countries: m.markets.countries,
      contractCurrencies: m.markets.countries.filter((c) => c.locked).map((c) => c.currency),
      selectorScope:
        "Display currency only. The selector never changes the canonical URL, the hreflang set, the routes or the page copy.",
      hreflang: m.site.hreflang.map((h) => h.hreflang),
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

const convertPrice: ToolDefinition<{
  countryCode: string;
  amountUsd?: number;
  tierId?: string;
  billing?: "monthly" | "annual";
  users?: number;
}> = {
  name: "kanchanflow_convert_price",
  title: "Convert a KanchanFlow price to a display market",
  description: [
    "Converts a USD amount, or a named KanchanFlow plan, into one of the seven display-market currencies using the site's own fixed reference rate and rounding rule — the same arithmetic the pricing page performs, so the figure matches what a visitor sees.",
    "",
    "Give either `amountUsd`, or `tierId` with an optional `billing` ('monthly' or 'annual', default monthly) and an optional `users` count for a plan subtotal including any platform fee.",
    "",
    "The response marks each figure `exact: true` when it is a contracted price (USD, and INR for a plan that carries a locked INR price) and `exact: false` when it is an indicative conversion. Always repeat the `basis` sentence when quoting an inexact figure.",
    "Errors: VALIDATION_ERROR for an unsupported country, an unknown tier, a negative amount, or neither amountUsd nor tierId.",
  ].join("\n"),
  inputSchema: {
    countryCode: z
      .string()
      .length(2)
      .describe("Two-letter display market: US, IN, GB, AU, AE, SG or NZ."),
    amountUsd: z.number().min(0).optional().describe("A USD amount to convert."),
    tierId: z
      .enum(["starter", "professional", "enterprise"])
      .optional()
      .describe("Convert this plan's per-user price instead of a raw amount."),
    billing: z.enum(["monthly", "annual"]).optional().describe("Billing period for tierId. Default monthly."),
    users: z.number().int().min(1).optional().describe("Seat count, to compute a plan subtotal."),
  },
  handler: ({ countryCode, amountUsd, tierId, billing = "monthly", users }) => {
    const m = loadMirror();
    const country = m.markets.countries.find((c) => c.code === countryCode.toUpperCase());
    if (!country) {
      throw validationError(`"${countryCode}" is not a KanchanFlow display market.`, {
        supported: m.markets.countries.map((c) => c.code),
      });
    }

    const basis =
      country.code === "US"
        ? "USD is the contract currency."
        : country.code === "IN"
          ? "India pricing is contracted in INR."
          : `${country.currency} is indicative, converted from USD at a fixed reference rate set ${m.markets.ratesAsOf}. Contracts and invoices are in USD.`;

    if (amountUsd !== undefined) {
      const converted = amountFor(country, amountUsd);
      return ok({
        input: { amountUsd },
        countryCode: country.code,
        currency: country.currency,
        ...converted,
        display: formatAmount(country, converted.value),
        basis,
        source: { syncedAt: m.meta.syncedAt, ratesAsOf: m.markets.ratesAsOf },
      });
    }

    if (!tierId) {
      throw validationError("Provide either amountUsd or tierId.");
    }

    const tier = m.pricing.tiers.find((t) => t.id === tierId);
    if (!tier) {
      throw validationError(`"${tierId}" is not a KanchanFlow plan.`, {
        supported: m.pricing.tiers.map((t) => t.id),
      });
    }

    if (users !== undefined && users < tier.minUsers) {
      throw validationError(
        `${tier.name} has a ${tier.minUsers}-user minimum; ${users} is below it.`,
        { minUsers: tier.minUsers, maxUsers: tier.maxUsers }
      );
    }
    if (users !== undefined && tier.maxUsers !== null && users > tier.maxUsers) {
      throw validationError(
        `${tier.name} is capped at ${tier.maxUsers} users; ${users} is above it.`,
        { minUsers: tier.minUsers, maxUsers: tier.maxUsers }
      );
    }

    const perUserUsd = billing === "annual" ? tier.annualUsd : tier.monthlyUsd;
    const perUserInr = billing === "annual" ? tier.annualInr : tier.monthlyInr;
    const perUser = amountFor(country, perUserUsd, perUserInr);
    const platform =
      tier.platformFeeUsd > 0 ? amountFor(country, tier.platformFeeUsd, tier.platformFeeInr ?? null) : null;

    const seats = users ?? tier.minUsers;
    const subtotalValue = perUser.value * seats + (platform?.value ?? 0);

    return ok({
      input: { tierId, billing, users: seats, assumedMinimumSeats: users === undefined },
      countryCode: country.code,
      currency: country.currency,
      perUserPerMonth: { ...perUser, display: formatAmount(country, perUser.value) },
      platformFeePerMonth: platform
        ? { ...platform, display: formatAmount(country, platform.value) }
        : null,
      monthlyTotal: {
        value: subtotalValue,
        exact: perUser.exact && (platform ? platform.exact : true),
        display: formatAmount(country, subtotalValue),
        arithmetic: `${formatAmount(country, perUser.value)} x ${seats} seats${
          platform ? ` + ${formatAmount(country, platform.value)} platform fee` : ""
        }`,
      },
      note:
        billing === "annual"
          ? `Annual billing is ${m.pricing.annualDiscountPct}% below the monthly rate and is charged for the year.`
          : "Monthly rate, billed monthly.",
      basis,
      source: { syncedAt: m.meta.syncedAt, ratesAsOf: m.markets.ratesAsOf },
    });
  },
};

export const marketTools: ToolDefinition[] = [
  listMarkets as ToolDefinition,
  convertPrice as ToolDefinition,
];
