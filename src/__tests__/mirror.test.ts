/**
 * Content mirror integrity.
 *
 * These assert the invariants the KanchanFlow website itself is held to. If one
 * fails after a sync, the website changed in a way that needs attention, not
 * the server.
 */

import { describe, expect, it } from "vitest";

import { getFeature, getIntegration, loadMirror, suggestSlugs } from "../data/mirror.js";

const m = loadMirror();

describe("mirror provenance", () => {
  it("records where and when it came from", () => {
    expect(m.meta.mirrorVersion).toBe(1);
    expect(Date.parse(m.meta.syncedAt)).not.toBeNaN();
    expect(m.meta.siteUrl).toBe("https://kanchanflow.com");
  });
});

describe("features", () => {
  it("has a catalog with unique slugs", () => {
    expect(m.features.items.length).toBeGreaterThan(0);
    const slugs = m.features.items.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every feature a status from the published vocabulary", () => {
    for (const f of m.features.items) {
      expect(["live", "beta", "building", "planned"], f.slug).toContain(f.status);
    }
  });

  it("never puts a target date on a planned feature", () => {
    for (const f of m.features.items) {
      if (f.status === "planned") expect(f.target, f.slug).toBeNull();
    }
  });

  it("gives every building feature a visible target", () => {
    for (const f of m.features.items) {
      if (f.status === "building") expect(f.target, f.slug).toBeTruthy();
    }
  });

  it("keeps the derived status counts consistent", () => {
    const { live, building, planned, total } = m.features.statusCounts;
    expect(m.features.items.filter((f) => f.status === "live")).toHaveLength(live);
    expect(m.features.items.filter((f) => f.status === "building")).toHaveLength(building);
    expect(m.features.items.filter((f) => f.status === "planned")).toHaveLength(planned);
    expect(total).toBe(m.features.items.length);
  });

  it("points every alias at a real feature", () => {
    for (const [from, to] of Object.entries(m.features.aliases)) {
      expect(getFeature(to), `${from} -> ${to}`).toBeDefined();
      expect(getFeature(from), `${from} should not also be a feature`).toBeUndefined();
    }
  });

  it("gives every feature a quotable answer paragraph", () => {
    for (const f of m.features.items) {
      expect(f.answer.length, f.slug).toBeGreaterThan(40);
    }
  });
});

describe("pricing", () => {
  it("carries three plans in ascending price order", () => {
    expect(m.pricing.tiers).toHaveLength(3);
    const monthly = m.pricing.tiers.map((t) => t.monthlyUsd);
    expect(monthly).toEqual([...monthly].sort((a, b) => a - b));
  });

  it("prices annual below monthly on every plan", () => {
    for (const t of m.pricing.tiers) {
      expect(t.annualUsd, t.id).toBeLessThan(t.monthlyUsd);
    }
  });

  it("keeps every matrix row aligned with the plan columns", () => {
    for (const group of m.pricing.featureMatrix) {
      for (const row of group.rows) {
        expect(row.length, `${group.group}: ${row[0]}`).toBe(m.pricing.tiers.length + 1);
      }
    }
  });

  it("never caps revision history or RFQ line items in the matrix", () => {
    // Three things are permanently ungated. A number appearing against one of
    // them in any plan column is a contract violation on the website.
    const guarded = /revision history|rfq line item/i;
    for (const group of m.pricing.featureMatrix) {
      for (const row of group.rows) {
        if (!guarded.test(row[0] ?? "")) continue;
        for (const cell of row.slice(1)) {
          expect(String(cell), row[0]).toMatch(/unlimited/i);
        }
      }
    }
  });
});

describe("integrations", () => {
  it("has unique slugs and a category for each", () => {
    const slugs = m.integrations.items.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const i of m.integrations.items) {
      expect(m.integrations.categories, i.slug).toContain(i.category);
    }
  });

  it("dates the last end-to-end test of every connector", () => {
    for (const i of m.integrations.items) {
      expect(i.lastTested, i.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("points every related slug at a real connector", () => {
    for (const i of m.integrations.items) {
      for (const related of i.related ?? []) {
        expect(getIntegration(related), `${i.slug} -> ${related}`).toBeDefined();
      }
    }
  });
});

describe("markets", () => {
  it("carries the seven display markets with US as the default", () => {
    expect(m.markets.countries).toHaveLength(7);
    expect(m.markets.defaultCountry).toBe("US");
    expect(m.markets.countries.map((c) => c.code)).toContain("US");
  });

  it("locks only the contracted currencies", () => {
    const locked = m.markets.countries.filter((c) => c.locked).map((c) => c.code);
    expect(locked.sort()).toEqual(["IN", "US"]);
  });

  it("dates the reference rates", () => {
    expect(m.markets.ratesAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("site contract", () => {
  it("forbids FAQPage, Review and AggregateRating", () => {
    expect(m.site.forbiddenSchemaTypes).toEqual(
      expect.arrayContaining(["FAQPage", "Review", "AggregateRating"])
    );
    for (const forbidden of m.site.forbiddenSchemaTypes) {
      expect(m.site.schemaTypes).not.toContain(forbidden);
    }
  });

  it("emits en-US and x-default only", () => {
    expect(m.site.hreflang.map((h) => h.hreflang).sort()).toEqual(["en-US", "x-default"]);
  });

  it("lists real, absolute routes", () => {
    expect(m.site.routeCount).toBe(m.site.routes.length);
    expect(m.site.routes).toContain("/");
    expect(m.site.routes).toContain("/pricing");
    for (const route of m.site.routes) expect(route.startsWith("/"), route).toBe(true);
  });
});

describe("evidence guardrails", () => {
  it("names no customer in the changelog", () => {
    for (const r of m.changelog.releases) {
      expect(r.body, r.title).not.toMatch(/\bcustomers (are|love|report)\b/i);
    }
  });

  it("publishes no partner directory listings yet", () => {
    expect(m.partners.directoryListings).toEqual([]);
  });

  it("marks unaudited certifications as unverified", () => {
    const iso = m.brand.compliance.find((c) => c.label.includes("ISO 27001"));
    expect(iso?.verified).toBe(false);
    expect(iso?.note).toBeTruthy();
  });
});

describe("suggestSlugs", () => {
  it("suggests a near miss", () => {
    expect(suggestSlugs("quote-buildr", ["quote-editor", "quote-revision-diff", "po-ocr"])).toContain(
      "quote-editor"
    );
  });

  it("returns nothing for an unrelated term", () => {
    expect(suggestSlugs("zzzzzz", ["quote-editor", "po-ocr"])).toEqual([]);
  });
});
