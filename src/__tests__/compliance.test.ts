/**
 * Compliance entries are served as the company's stated position, with
 * evidence notes when the website publishes them.
 */

import { describe, expect, it } from "vitest";

import { loadMirror } from "../data/mirror.js";
import { readSiteResource } from "../resources/index.js";
import { complianceView } from "../tools/company.js";
import { toolsByName } from "../tools/index.js";

describe("complianceView", () => {
  it("returns evidence when present and lists certifications without it", () => {
    const view = complianceView([
      { label: "SOC 2 Type II", verified: true, evidence: "Report available under NDA." },
      { label: "ISO 27001", verified: true },
      { label: "Example Data Centers", verified: true },
      { label: "AS9100", verified: false, note: "Not held." },
    ]);
    expect(view.verified).toEqual(["SOC 2 Type II", "ISO 27001", "Example Data Centers"]);
    expect(view.evidence).toEqual({ "SOC 2 Type II": "Report available under NDA." });
    expect(view.evidencePending).toEqual(["ISO 27001"]);
    expect(view.notVerified).toEqual([{ label: "AS9100", note: "Not held." }]);
    expect(view.basis).toMatch(/states/);
    expect(view.basis).toContain("ISO 27001");
  });

  it("has nothing pending when every certification carries evidence", () => {
    const view = complianceView([{ label: "SOC 2 Type II", verified: true, evidence: "On request." }]);
    expect(view.evidencePending).toEqual([]);
    expect(view.basis).not.toMatch(/No evidence note/);
  });
});

describe("kanchanflow_get_company_profile", () => {
  const tool = toolsByName.get("kanchanflow_get_company_profile")!;

  it("no longer tells agents that verified means an achieved audit", () => {
    expect(tool.description).not.toMatch(/verified[^.]*achieved audit/i);
    expect(tool.description).toMatch(/not proof of an audit/);
  });

  it("serves the basis, and flags every verified certification without evidence", () => {
    const data = (tool.handler({}) as { data: any }).data;
    const m = loadMirror();
    const certs = m.brand.compliance.filter((c) => c.verified && /\b(SOC|ISO|AS)\s*\d/i.test(c.label) && !c.evidence);
    expect(data.compliance.basis).toMatch(/not as independently confirmed/);
    expect(data.compliance.evidencePending).toEqual(certs.map((c) => c.label));
  });

  it("the company resource carries the same basis", () => {
    const read = readSiteResource("kanchanflow://site/company");
    expect(JSON.parse(read!.text).data.complianceBasis).toMatch(/states on its website/);
  });
});
