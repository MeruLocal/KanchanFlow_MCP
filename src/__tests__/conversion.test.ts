/** The trial CTA, kanchanflow_get_started, and UTM tags on own-site URLs. */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { loadMirror } from "../data/mirror.js";
import { tagUrls, withUtm } from "../utils/utm.js";
import { connect, textPayload } from "./helpers/client.js";

const UTM = "utm_source=mcp&utm_medium=ai_agent&utm_campaign=";

describe("withUtm", () => {
  it("tags a plain own-site URL", () => {
    expect(withUtm("https://kanchanflow.com/pricing", "t")).toBe(`https://kanchanflow.com/pricing?${UTM}t`);
    expect(withUtm("https://www.kanchanflow.com/demo", "t")).toBe(`https://www.kanchanflow.com/demo?${UTM}t`);
  });
  it("keeps an existing query string and fragment", () => {
    expect(withUtm("https://kanchanflow.com/pricing?plan=pro#faq", "t")).toBe(
      `https://kanchanflow.com/pricing?plan=pro&${UTM}t#faq`
    );
  });
  it("never tags twice", () => {
    const once = withUtm("https://kanchanflow.com/signup", "a");
    expect(withUtm(once, "b")).toBe(once);
  });
  it("leaves external, look-alike and relative URLs unchanged", () => {
    for (const u of [
      "https://example.com/x",
      "https://kanchanflow.com.example.net/x",
      "http://kanchanflow.com/x",
      "/features/quote-editor",
      "mailto:hello@example.test",
    ]) {
      expect(withUtm(u, "t")).toBe(u);
    }
  });
  it("walks payloads but leaves provenance alone", () => {
    const out = tagUrls(
      { url: "https://kanchanflow.com/a", list: ["https://kanchanflow.com/b", "/c"], source: { siteUrl: "https://kanchanflow.com" } },
      "t"
    );
    expect(out.url).toContain(UTM);
    expect(out.list[0]).toContain(UTM);
    expect(out.list[1]).toBe("/c");
    expect(out.source.siteUrl).toBe("https://kanchanflow.com");
  });
});

let client: Client;
beforeAll(async () => {
  client = await connect();
});
afterAll(async () => {
  await client.close();
});

describe("kanchanflow_get_pricing", () => {
  it("returns the trial and demo CTAs with UTM tags", async () => {
    const body = textPayload(await client.callTool({ name: "kanchanflow_get_pricing", arguments: {} }));
    const m = loadMirror();
    expect(body.data.cta.trial.url.startsWith("https://kanchanflow.com/signup?")).toBe(true);
    expect(body.data.cta.trial.url).toContain(`${UTM}kanchanflow_get_pricing`);
    expect(body.data.cta.trial.label).toBe(m.brand.trialCta?.label);
    expect(body.data.cta.demo.url.startsWith("https://kanchanflow.com/demo?")).toBe(true);
    expect(body.data.urls.signup).toContain("/signup?");
    expect(body.data.urls.pricing).toContain(UTM);
  });

  it("does not change any price", async () => {
    const body = textPayload(await client.callTool({ name: "kanchanflow_get_pricing", arguments: {} }));
    const m = loadMirror();
    for (const [i, t] of m.pricing.tiers.entries()) {
      expect(body.data.tiers[i].listPriceUsd).toEqual({ monthly: t.monthlyUsd, annual: t.annualUsd, platformFee: t.platformFeeUsd });
    }
  });
});

describe("kanchanflow_get_started", () => {
  it("is listed as read-only", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "kanchanflow_get_started");
    expect(tool?.annotations?.readOnlyHint).toBe(true);
    expect(tool?.annotations?.destructiveHint).toBe(false);
  });

  it("returns trial, demo, contact and pricing links: real routes, all tagged", async () => {
    const body = textPayload(await client.callTool({ name: "kanchanflow_get_started", arguments: {} }));
    const m = loadMirror();
    expect(body.success).toBe(true);
    const links = ["trial", "demo", "contact", "pricing"].map((k) => body.data[k]);
    for (const link of links) {
      expect(link?.url).toBeDefined();
      const u = new URL(link.url);
      expect(u.hostname).toBe("kanchanflow.com");
      expect(m.site.routes).toContain(u.pathname);
      expect(link.url).toContain(`${UTM}kanchanflow_get_started`);
    }
    expect(body.data.trial.terms).toEqual(m.pricing.trial);
    expect(body.data.callToAction).toContain(m.pricing.trial.blurb);
  });
});
