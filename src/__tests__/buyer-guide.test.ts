/** kanchanflow_get_buyer_guide: every topic resolves from the mirror and nothing is invented. */

import { describe, expect, it } from "vitest";

import { loadMirror } from "../data/mirror.js";
import { BUYER_TOPICS } from "../tools/buyer-guide.js";
import { toolsByName } from "../tools/index.js";

const tool = toolsByName.get("kanchanflow_get_buyer_guide")!;
const m = loadMirror();

describe("buyer topic table", () => {
  for (const [id, topic] of Object.entries(BUYER_TOPICS)) {
    it(`${id}: every page, feature, glossary term and post exists in the mirror`, () => {
      for (const p of topic.pages) expect(m.site.routes, p).toContain(p);
      for (const s of topic.features) expect(m.features.items.map((f) => f.slug), s).toContain(s);
      for (const s of topic.glossary) expect(m.glossary.terms.map((t) => t.slug), s).toContain(s);
      for (const s of topic.blog) expect(m.blog.posts.map((p) => p.slug), s).toContain(s);
    });
  }
});

describe("kanchanflow_get_buyer_guide", () => {
  it("returns canonical URLs and the real status of every feature", () => {
    const data = (tool.handler({ topic: "rfq" }) as { data: any }).data;
    expect(data.pages.length).toBeGreaterThan(0);
    for (const u of data.pages) expect(u.startsWith(m.brand.url)).toBe(true);
    for (const f of data.features) {
      const source = m.features.items.find((x) => x.slug === f.slug)!;
      expect(f.status).toBe(source.status);
    }
  });

  it("is read-only in its description and tells agents not to oversell non-live features", () => {
    expect(tool.description).toMatch(/Only 'live' means the product does it today/);
    const data = (tool.handler({ topic: "cpq" }) as { data: any }).data;
    expect(data.guidance.join(" ")).toMatch(/not available today/);
  });
});
