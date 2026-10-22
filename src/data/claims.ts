/**
 * Fixed claims this server states in its own words.
 *
 * Almost everything a tool returns is copied from data/site-mirror.json, which
 * `npm run sync` regenerates from the website. A few sentences are not in the
 * website's content modules, so they are written here — once — with the
 * website file each one restates. pricing.ts, markets.ts, site.ts and
 * server-info.ts import them instead of typing their own copies.
 *
 * When the website exports one of these as data, delete it here and read it
 * from the mirror instead. Nothing here is a price, a plan name or a term.
 */

import type { Country, Markets, Tier } from "./types.js";

/**
 * Never gated on any plan.
 * Restates SPEC-CONTRACT.md §0 guardrails 7 and 8 (reference/site/spec-contract.md).
 * The website's content/pricing.js does not export this list.
 */
export const NEVER_GATED: readonly string[] = [
  "RFQ line items — unlimited on every plan.",
  "Quote revision history — unlimited retention on every plan.",
  "India GST, e-Invoice IRN and MSMED Section 43B(h) — included on every plan, never an add-on.",
];

/**
 * Content guardrails for any KanchanFlow page.
 * Restates SPEC-CONTRACT.md §0 guardrails 4, 5, 7, 8, 9 and the page rules
 * (reference/site/spec-contract.md).
 */
export const CONTENT_GUARDRAILS: readonly string[] = [
  "Never fabricate a customer name, logo, testimonial, count or case study. There are none.",
  "Never claim a certification without an audit. Quote compliance.basis from the company tool for what is verified.",
  "Feature status must be truthful: live means production today; building carries a visible target; planned promises nothing.",
  "Never cap RFQ line items or quote revision history in pricing copy.",
  "Never gate the India GST, e-Invoice IRN or 43B(h) features behind a plan.",
  "Every page carries a 40-to-60-word quotable answer block within the first 100 words after the H1.",
  "FAQs are visible on the page and are never structured data only.",
];

/**
 * Certifications the company has confirmed to us directly, so they are not
 * presented as "stated on the website" only. Matched against compliance labels
 * (the wording itself, e.g. "SOC 2 Type II", comes from the website mirror).
 * Founder confirmation, 15 Oct 2026. The report itself is still obtained from sales.
 */
export const COMPANY_CONFIRMED_CERTIFICATION = /^SOC\s*2\b/i;
export const COMPANY_CONFIRMED_ON = "15 Oct 2026";

/** Restates SPEC-CONTRACT.md §0 guardrail 6. The hreflang set itself comes from the mirror. */
export const HREFLANG_POLICY =
  "en-US and x-default only. Wave 1 is a single USA-market .com root — never add en-GB, en-CA, en-AU, en-IN, de, ja or nl.";

/** Restates SPEC-CONTRACT.md §0 guardrails 1 and 2. The forbidden list itself comes from the mirror. */
export const FORBIDDEN_SCHEMA_REASON: Readonly<Record<string, string>> = {
  FAQPage: "Retired site-wide. FAQs render visibly through the FAQ accordion and emit no structured data.",
  Review: "No third-party review data exists yet.",
  AggregateRating: "No third-party review data exists yet.",
};

/* ------------------------------------------------------------------ */
/* Sentences derived from the mirror rather than typed                 */
/* ------------------------------------------------------------------ */

/** The default display market (the one whose currency is the list price). */
export function defaultMarket(markets: Markets): Country | undefined {
  return markets.countries.find((c) => c.code === markets.defaultCountry);
}

/** The display-market codes, in mirror order. */
export function marketCodes(markets: Markets): string[] {
  return markets.countries.map((c) => c.code);
}

/** Currencies with contracted (locked) prices, in mirror order, de-duplicated. */
export function contractedCurrencies(markets: Markets): string[] {
  return [...new Set(markets.countries.filter((c) => c.locked).map((c) => c.billedIn))];
}

/** "A, B or C" / "A and B". */
export function joinList(items: readonly string[], conj: "and" | "or"): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${conj} ${items[items.length - 1]}`;
}

/** Plan names in mirror order. */
export function planNames(tiers: readonly Tier[]): string[] {
  return tiers.map((t) => t.name);
}

/**
 * The basis sentence for prices shown in `country`, built from its `locked`
 * and `billedIn` flags rather than from hard-coded country codes.
 */
export function basisFor(country: Country, markets: Markets): string {
  const home = defaultMarket(markets);
  const listCurrency = home?.billedIn ?? "USD";
  if (country.locked && country.code === markets.defaultCountry) {
    return `${country.billedIn} is the contract currency.`;
  }
  if (country.locked) {
    return `${country.name} pricing is contracted in ${country.billedIn}. ${listCurrency} remains the contract currency everywhere else.`;
  }
  return `${country.currency} figures are indicative, converted from the ${listCurrency} list price at a fixed reference rate set ${markets.ratesAsOf}. Contracts and invoices are in ${country.billedIn}.`;
}

/** The instruction line about contracted vs indicative currencies. */
export function currencyInstruction(markets: Markets): string {
  const contracted = contractedCurrencies(markets);
  return `${joinList(contracted, "and")} prices are contracted. Every other currency is an indicative conversion at a fixed dated rate — quote the basis sentence that comes with it.`;
}
