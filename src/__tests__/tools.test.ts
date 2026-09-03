/**
 * Tool behaviour.
 *
 * Handlers are called directly — a tool file never imports the MCP SDK, which
 * is what makes this possible.
 */

import { describe, expect, it } from "vitest";

import { toolsByName } from "../tools/index.js";
import { ToolError } from "../errors.js";
import { loadMirror } from "../data/mirror.js";

const m = loadMirror();

/** Call a tool and assert it succeeded, returning the data payload. */
function call<T = Record<string, unknown>>(name: string, args: Record<string, unknown> = {}): T {
  const tool = toolsByName.get(name);
  if (!tool) throw new Error(`no such tool: ${name}`);
  const payload = tool.handler(args) as { success: boolean; data: T };
  expect(payload.success, name).toBe(true);
  return payload.data;
}

/** Call a tool expecting a ToolError, and return it. */
function callExpectingError(name: string, args: Record<string, unknown>): ToolError {
  const tool = toolsByName.get(name);
  if (!tool) throw new Error(`no such tool: ${name}`);
  try {
    tool.handler(args);
  } catch (err) {
    expect(err).toBeInstanceOf(ToolError);
    return err as ToolError;
  }
  throw new Error(`${name} should have thrown`);
}

describe("kanchanflow_get_company_profile", () => {
  it("returns the entity and separates verified from unverified compliance", () => {
    const data = call<{
      entity: { legalName: string };
      compliance: { verified: string[]; notVerified: { label: string; note: string | null }[] };
      evidenceNotes: string[];
    }>("kanchanflow_get_company_profile");

    expect(data.entity.legalName).toBe("Soor LLC");
    expect(data.compliance.verified).toContain("SOC 2 Type II");
    expect(data.compliance.notVerified.map((c) => c.label).join(" ")).toContain("ISO 27001");
    expect(data.evidenceNotes.join(" ")).toMatch(/no published customer/i);
  });
});

describe("kanchanflow_list_features", () => {
  it("filters by status", () => {
    const data = call<{ features: { status: string }[]; total: number }>("kanchanflow_list_features", {
      status: "live",
      limit: 200,
    });
    expect(data.total).toBe(m.features.statusCounts.live);
    expect(data.features.every((f) => f.status === "live")).toBe(true);
  });

  it("filters by category", () => {
    const category = m.features.categories[0]!.name;
    const data = call<{ features: { category: string }[] }>("kanchanflow_list_features", {
      category,
      limit: 200,
    });
    expect(data.features.every((f) => f.category === category)).toBe(true);
  });

  it("filters by free-text query", () => {
    const data = call<{ total: number }>("kanchanflow_list_features", { query: "quote" });
    expect(data.total).toBeGreaterThan(0);
  });

  it("paginates", () => {
    const first = call<{ features: { slug: string }[]; hasMore: boolean }>("kanchanflow_list_features", {
      limit: 3,
    });
    const second = call<{ features: { slug: string }[] }>("kanchanflow_list_features", {
      limit: 3,
      offset: 3,
    });
    expect(first.features).toHaveLength(3);
    expect(first.hasMore).toBe(true);
    expect(first.features[0]!.slug).not.toBe(second.features[0]!.slug);
  });

  it("always returns the status legend and counts", () => {
    const data = call<{ statusLegend: Record<string, string>; statusCounts: unknown }>(
      "kanchanflow_list_features"
    );
    expect(Object.keys(data.statusLegend).sort()).toEqual(["beta", "building", "live", "planned"]);
    expect(data.statusCounts).toBeDefined();
  });
});

describe("kanchanflow_get_feature", () => {
  it("returns one feature with its status", () => {
    const slug = m.features.items[0]!.slug;
    const data = call<{ slug: string; status: string; url: string }>("kanchanflow_get_feature", { slug });
    expect(data.slug).toBe(slug);
    expect(data.url).toContain("/features/");
  });

  it("resolves a retired slug through the alias table", () => {
    const [alias, target] = Object.entries(m.features.aliases)[0]!;
    const data = call<{ slug: string; resolvedFromAlias: string }>("kanchanflow_get_feature", {
      slug: alias,
    });
    expect(data.slug).toBe(target);
    expect(data.resolvedFromAlias).toBe(alias);
  });

  it("accepts a full path as well as a slug", () => {
    const slug = m.features.items[0]!.slug;
    expect(call<{ slug: string }>("kanchanflow_get_feature", { slug: `/features/${slug}` }).slug).toBe(slug);
  });

  it("drops FAQs when asked", () => {
    const slug = m.features.items[0]!.slug;
    const data = call<Record<string, unknown>>("kanchanflow_get_feature", { slug, includeFaqs: false });
    expect(data).not.toHaveProperty("faqs");
  });

  it("reports NOT_FOUND with suggestions rather than inventing a feature", () => {
    const err = callExpectingError("kanchanflow_get_feature", { slug: "quote-buildr" });
    expect(err.code).toBe("NOT_FOUND");
    expect((err.details as { didYouMean: string[] }).didYouMean.length).toBeGreaterThan(0);
  });
});

describe("kanchanflow_get_pricing", () => {
  it("returns USD as contracted by default", () => {
    const data = call<{
      currency: { countryCode: string; contracted: boolean };
      tiers: { monthlyPerUser: { exact: boolean } }[];
      neverGated: string[];
    }>("kanchanflow_get_pricing");
    expect(data.currency.countryCode).toBe("US");
    expect(data.currency.contracted).toBe(true);
    expect(data.tiers.every((t) => t.monthlyPerUser.exact)).toBe(true);
    expect(data.neverGated).toHaveLength(3);
  });

  it("marks a converted currency as inexact and explains the basis", () => {
    const data = call<{
      currency: { basis: string };
      tiers: { monthlyPerUser: { exact: boolean; display: string } }[];
    }>("kanchanflow_get_pricing", { countryCode: "GB" });
    expect(data.tiers.every((t) => !t.monthlyPerUser.exact)).toBe(true);
    expect(data.currency.basis).toMatch(/indicative/i);
    expect(data.tiers[0]!.monthlyPerUser.display.startsWith("£")).toBe(true);
  });

  it("keeps INR contracted", () => {
    const data = call<{ tiers: { monthlyPerUser: { exact: boolean } }[] }>("kanchanflow_get_pricing", {
      countryCode: "IN",
    });
    expect(data.tiers.every((t) => t.monthlyPerUser.exact)).toBe(true);
  });

  it("rejects a country outside the display markets", () => {
    const err = callExpectingError("kanchanflow_get_pricing", { countryCode: "FR" });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect((err.details as { supported: string[] }).supported).toContain("US");
  });
});

describe("kanchanflow_compare_tiers", () => {
  it("returns the whole matrix by default", () => {
    const data = call<{ groups: unknown[]; columns: string[] }>("kanchanflow_compare_tiers");
    expect(data.groups.length).toBe(m.pricing.featureMatrix.length);
    expect(data.columns[0]).toBe("Capability");
  });

  it("narrows to one group", () => {
    const group = m.pricing.featureMatrix[0]!.group;
    const data = call<{ groups: { group: string }[] }>("kanchanflow_compare_tiers", { group });
    expect(data.groups).toHaveLength(1);
    expect(data.groups[0]!.group).toBe(group);
  });

  it("filters by capability", () => {
    const data = call<{ groups: { rows: string[][] }[]; rowCount: number }>("kanchanflow_compare_tiers", {
      capability: "users",
    });
    expect(data.rowCount).toBeGreaterThan(0);
    for (const g of data.groups) {
      for (const row of g.rows) expect(row[0]!.toLowerCase()).toContain("users");
    }
  });

  it("reports NOT_FOUND for an unknown group", () => {
    const err = callExpectingError("kanchanflow_compare_tiers", { group: "Teleportation" });
    expect(err.code).toBe("NOT_FOUND");
    expect((err.details as { availableGroups: string[] }).availableGroups.length).toBeGreaterThan(0);
  });
});

describe("kanchanflow_convert_price", () => {
  it("converts a raw USD amount", () => {
    const data = call<{ value: number; exact: boolean; display: string }>("kanchanflow_convert_price", {
      countryCode: "US",
      amountUsd: 49,
    });
    expect(data.value).toBe(49);
    expect(data.exact).toBe(true);
    expect(data.display).toBe("$49");
  });

  it("prices a plan for a seat count and shows the arithmetic", () => {
    const data = call<{ monthlyTotal: { value: number; arithmetic: string } }>(
      "kanchanflow_convert_price",
      { countryCode: "US", tierId: "professional", users: 12 }
    );
    const pro = m.pricing.tiers.find((t) => t.id === "professional")!;
    expect(data.monthlyTotal.value).toBe(pro.monthlyUsd * 12);
    expect(data.monthlyTotal.arithmetic).toContain("12 seats");
  });

  it("adds the Enterprise platform fee", () => {
    const ent = m.pricing.tiers.find((t) => t.id === "enterprise")!;
    const data = call<{ monthlyTotal: { value: number } }>("kanchanflow_convert_price", {
      countryCode: "US",
      tierId: "enterprise",
      users: 10,
    });
    expect(data.monthlyTotal.value).toBe(ent.monthlyUsd * 10 + ent.platformFeeUsd);
  });

  it("refuses a seat count below the plan minimum", () => {
    const err = callExpectingError("kanchanflow_convert_price", {
      countryCode: "US",
      tierId: "starter",
      users: 1,
    });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toMatch(/minimum/i);
  });

  it("refuses a seat count above the plan cap", () => {
    const err = callExpectingError("kanchanflow_convert_price", {
      countryCode: "US",
      tierId: "starter",
      users: 5000,
    });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toMatch(/capped/i);
  });

  it("requires either an amount or a plan", () => {
    expect(callExpectingError("kanchanflow_convert_price", { countryCode: "US" }).code).toBe(
      "VALIDATION_ERROR"
    );
  });

  it("rounds a conversion the way the website rounds it", () => {
    // roundLocal: >= 10000 to the nearest 100, >= 1000 to the nearest 10.
    const data = call<{ value: number }>("kanchanflow_convert_price", {
      countryCode: "GB",
      amountUsd: 49,
    });
    expect(Number.isInteger(data.value)).toBe(true);
  });
});

describe("kanchanflow_list_integrations / kanchanflow_get_integration", () => {
  it("filters by category", () => {
    const category = m.integrations.categories[0]!;
    const data = call<{ integrations: { category: string }[] }>("kanchanflow_list_integrations", {
      category,
      limit: 200,
    });
    expect(data.integrations.every((i) => i.category === category)).toBe(true);
  });

  it("returns the last-tested date on every summary", () => {
    const data = call<{ integrations: { lastTested: string }[] }>("kanchanflow_list_integrations", {
      limit: 200,
    });
    expect(data.integrations.every((i) => /^\d{4}-\d{2}-\d{2}$/.test(i.lastTested))).toBe(true);
  });

  it("returns the limitations with a connector", () => {
    const slug = m.integrations.items[0]!.slug;
    const data = call<{ limitations: string[] }>("kanchanflow_get_integration", { slug });
    expect(Array.isArray(data.limitations)).toBe(true);
  });

  it("trims to requested sections", () => {
    const slug = m.integrations.items[0]!.slug;
    const data = call<Record<string, unknown>>("kanchanflow_get_integration", {
      slug,
      sections: ["setup"],
    });
    expect(data).toHaveProperty("setup");
    expect(data).not.toHaveProperty("troubleshooting");
  });

  it("reports NOT_FOUND with suggestions", () => {
    const err = callExpectingError("kanchanflow_get_integration", { slug: "tallyy" });
    expect(err.code).toBe("NOT_FOUND");
    expect((err.details as { didYouMean: string[] }).didYouMean).toContain("tally");
  });
});

describe("kanchanflow_get_changelog", () => {
  it("returns releases newest first", () => {
    const data = call<{ releases: { date: string }[] }>("kanchanflow_get_changelog", { limit: 100 });
    const dates = data.releases.map((r) => r.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("filters by date", () => {
    const data = call<{ releases: { date: string }[] }>("kanchanflow_get_changelog", {
      since: "2026-08-01",
      limit: 100,
    });
    expect(data.releases.every((r) => r.date >= "2026-08-01")).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(callExpectingError("kanchanflow_get_changelog", { since: "last August" }).code).toBe(
      "VALIDATION_ERROR"
    );
  });
});

describe("kanchanflow_get_roadmap", () => {
  it("returns buckets and never dates a planned feature", () => {
    const data = call<{ planned: { name: string }[]; buckets: Record<string, unknown[]> }>(
      "kanchanflow_get_roadmap"
    );
    expect(Object.keys(data.buckets).length).toBeGreaterThan(0);
    for (const item of data.planned) expect(item).not.toHaveProperty("target");
  });
});

describe("kanchanflow_search", () => {
  it("ranks a name match above a body match", () => {
    const data = call<{ results: { score: number }[] }>("kanchanflow_search", { query: "quote" });
    const scores = data.results.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("names the follow-up tool on every result", () => {
    const data = call<{ results: { followUpTool: string }[] }>("kanchanflow_search", { query: "rfq" });
    for (const r of data.results) expect(toolsByName.has(r.followUpTool)).toBe(true);
  });

  it("restricts to requested types", () => {
    const data = call<{ results: { type: string }[] }>("kanchanflow_search", {
      query: "quote",
      types: ["glossary"],
    });
    expect(data.results.every((r) => r.type === "glossary")).toBe(true);
  });

  it("says so plainly when nothing matches", () => {
    const data = call<{ total: number; note?: string }>("kanchanflow_search", { query: "zzzqqqxyz" });
    expect(data.total).toBe(0);
    expect(data.note).toMatch(/publishes nothing/i);
  });
});

describe("kanchanflow_list_pages / kanchanflow_get_seo_rules", () => {
  it("lists only real routes", () => {
    const data = call<{ routes: string[]; absoluteUrls: string[] }>("kanchanflow_list_pages", {
      prefix: "/features",
      limit: 500,
    });
    expect(data.routes.length).toBeGreaterThan(0);
    expect(data.routes.every((r) => r.startsWith("/features"))).toBe(true);
    expect(data.absoluteUrls[0]!.startsWith("https://kanchanflow.com/")).toBe(true);
  });

  it("publishes the forbidden schema types", () => {
    const data = call<{ schemaTypesForbidden: string[]; contentGuardrails: string[] }>(
      "kanchanflow_get_seo_rules"
    );
    expect(data.schemaTypesForbidden).toContain("FAQPage");
    expect(data.contentGuardrails.length).toBeGreaterThan(4);
  });
});

describe("every tool", () => {
  it("stamps the sync date on a successful response", () => {
    const noArgTools = [
      "kanchanflow_get_company_profile",
      "kanchanflow_get_ai_credits",
      "kanchanflow_list_markets",
      "kanchanflow_get_roadmap",
      "kanchanflow_get_seo_rules",
      "kanchanflow_get_partner_program",
      "kanchanflow_list_glossary_terms",
      "kanchanflow_list_blog_posts",
      "kanchanflow_get_pricing",
      "kanchanflow_compare_tiers",
      "kanchanflow_get_addons",
      "kanchanflow_list_features",
      "kanchanflow_list_integrations",
      "kanchanflow_list_pages",
      "kanchanflow_get_changelog",
    ];
    for (const name of noArgTools) {
      const data = call<{ source?: { syncedAt: string } }>(name);
      expect(data.source?.syncedAt, name).toBe(m.meta.syncedAt);
    }
  });
});
