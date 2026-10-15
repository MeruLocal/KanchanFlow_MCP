/**
 * Pricing and market claims come from the mirror or from src/data/claims.ts,
 * never from sentences typed into each tool.
 */

import { describe, expect, it } from "vitest";

import { basisFor, contractedCurrencies, CONTENT_GUARDRAILS, NEVER_GATED } from "../data/claims.js";
import { loadMirror } from "../data/mirror.js";
import type { Markets } from "../data/types.js";
import { SERVER_INSTRUCTIONS } from "../server-info.js";
import { toolsByName } from "../tools/index.js";

const m = loadMirror();
const call = (name: string, args: Record<string, unknown> = {}) =>
  (toolsByName.get(name)!.handler(args) as { data: any }).data;

describe("basis sentences", () => {
  it("a locked market never says indicative; an unlocked one always does", () => {
    for (const c of m.markets.countries) {
      const basis = basisFor(c, m.markets);
      if (c.locked) expect(basis, c.code).not.toMatch(/indicative/i);
      else expect(basis, c.code).toMatch(/indicative/i);
      expect(basis, c.code).toContain(c.billedIn);
    }
  });

  it("follows the flags, not the country code", () => {
    const fake: Markets = {
      ratesAsOf: "2026-01-01",
      defaultCountry: "US",
      countries: [
        { code: "US", name: "United States", short: "US", currency: "USD", symbol: "$", rate: 1, locked: true, billedIn: "USD" },
        { code: "IN", name: "India", short: "IN", currency: "INR", symbol: "₹", rate: 80, locked: false, billedIn: "USD" },
        { code: "ZZ", name: "Testland", short: "ZZ", currency: "ZZD", symbol: "Z", rate: 2, locked: true, billedIn: "ZZD" },
      ] as Markets["countries"],
    };
    expect(basisFor(fake.countries[1]!, fake)).toMatch(/INR figures are indicative/);
    expect(basisFor(fake.countries[2]!, fake)).toBe("Testland pricing is contracted in ZZD. USD remains the contract currency everywhere else.");
  });

  it("matches what the tools return", () => {
    for (const c of m.markets.countries) {
      expect(call("kanchanflow_get_pricing", { countryCode: c.code }).currency.basis).toBe(basisFor(c, m.markets));
      expect(call("kanchanflow_convert_price", { countryCode: c.code, amountUsd: 10 }).basis).toBe(basisFor(c, m.markets));
    }
  });
});

describe("generated descriptions", () => {
  it("the pricing description lists exactly the mirror's market codes and plan names", () => {
    const d = toolsByName.get("kanchanflow_get_pricing")!.description;
    const codes = m.markets.countries.map((c) => c.code);
    expect(d).toContain(`(${codes.join(", ")})`);
    expect(d).toContain(`${codes.length} KanchanFlow display markets`);
    for (const t of m.pricing.tiers) expect(d).toContain(t.name);
    expect(d).toContain(`${m.pricing.tiers.length} KanchanFlow plans`);
  });

  it("the instructions name the contracted currencies from the mirror", () => {
    const contracted = contractedCurrencies(m.markets);
    expect(contracted.length).toBeGreaterThan(0);
    for (const c of contracted) expect(SERVER_INSTRUCTIONS).toContain(c);
  });
});

describe("one source for fixed sentences", () => {
  it("get_pricing returns the never-gated list (from the mirror when it carries one)", () => {
    const fromMirror = (m.pricing as unknown as { neverGated?: string[] }).neverGated;
    expect(call("kanchanflow_get_pricing").neverGated).toEqual(fromMirror ?? [...NEVER_GATED]);
  });

  it("get_seo_rules returns the shared guardrails and a reason for every forbidden type", () => {
    const data = call("kanchanflow_get_seo_rules");
    expect(data.contentGuardrails).toEqual([...CONTENT_GUARDRAILS]);
    for (const t of m.site.forbiddenSchemaTypes) expect(typeof data.forbiddenSchemaReason[t]).toBe("string");
  });
});
