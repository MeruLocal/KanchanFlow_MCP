/**
 * Reference loader — indexing, reading and the traversal guard.
 *
 * The traversal tests are the important ones: this loader is the only code in
 * the server that touches the filesystem with a caller-supplied string.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ReferenceLoader } from "../reference/loader.js";
import { ToolError } from "../errors.js";
import { packagePath } from "../utils/package-paths.js";

describe("ReferenceLoader against the packaged reference folder", () => {
  const loader = new ReferenceLoader(packagePath("reference"));

  it("finds the reference folder", () => {
    expect(loader.available).toBe(true);
  });

  it("indexes the authored documents", () => {
    const paths = loader.list().map((d) => d.path);
    expect(paths).toContain("README.md");
    expect(paths).toContain("mcp/tools.md");
    expect(paths).toContain("mcp/security.md");
    expect(paths).toContain("architecture/overview.md");
    expect(paths).toContain("api/errors.md");
    expect(paths).toContain("data-model/entities.md");
    expect(paths).toContain("examples/workflows.md");
  });

  it("is deterministic", () => {
    const a = new ReferenceLoader(packagePath("reference")).list().map((d) => d.path);
    const b = new ReferenceLoader(packagePath("reference")).list().map((d) => d.path);
    expect(a).toEqual(b);
    expect(a).toEqual([...a].sort());
  });

  it("only exposes markdown and json", () => {
    for (const doc of loader.list()) {
      expect([".md", ".json"]).toContain(path.extname(doc.path));
    }
  });

  it("derives a title and a summary for each document", () => {
    const doc = loader.list().find((d) => d.path === "mcp/tools.md");
    expect(doc?.title).toBe("Tools");
    expect(doc?.section).toBe("mcp");
    expect(doc?.summary.length).toBeGreaterThan(10);
    expect(doc?.bytes).toBeGreaterThan(0);
  });

  it("reads a document body", () => {
    const doc = loader.read("mcp/security.md");
    expect(doc.content).toContain("Threat model");
    expect(doc.truncated).toBe(false);
  });

  it("truncates when asked and says so", () => {
    const doc = loader.read("mcp/security.md", 200);
    expect(doc.truncated).toBe(true);
    expect(doc.content).toHaveLength(200);
    expect(doc.nextOffset).toBe(200);
    expect(doc.note).toContain("offset 200");
  });

  it("caches a body rather than re-reading it", () => {
    const first = loader.read("api/errors.md").content;
    const second = loader.read("api/errors.md").content;
    expect(second).toBe(first);
  });

  it("lists sections", () => {
    expect(loader.sections()).toEqual(expect.arrayContaining(["api", "architecture", "mcp"]));
  });

  it("searches document bodies", () => {
    const hits = loader.search("rate limit", 10);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]).toHaveProperty("line");
    expect(hits.every((h) => h.text.toLowerCase().includes("rate limit"))).toBe(true);
  });

  it("refuses a one-character search", () => {
    expect(() => loader.search("a")).toThrow(ToolError);
  });

  it("reports NOT_FOUND for an unknown document", () => {
    try {
      loader.read("mcp/does-not-exist.md");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ToolError);
      expect((err as ToolError).code).toBe("NOT_FOUND");
    }
  });
});

describe("ReferenceLoader path confinement", () => {
  const loader = new ReferenceLoader(packagePath("reference"));

  const traversals = [
    "../package.json",
    "../../package.json",
    "../.env",
    "../../../../etc/passwd",
    "mcp/../../package.json",
    "./../../data/site-mirror.json",
    "..",
    "../",
  ];

  for (const attempt of traversals) {
    it(`refuses "${attempt}"`, () => {
      try {
        loader.read(attempt);
        throw new Error("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ToolError);
        // Either it never resolves inside the root (VALIDATION_ERROR) or it
        // resolves but is not an indexed document (NOT_FOUND). Both refuse the
        // read; neither returns file content.
        expect(["VALIDATION_ERROR", "NOT_FOUND"]).toContain((err as ToolError).code);
      }
    });
  }

  it("refuses an absolute POSIX path", () => {
    try {
      loader.read("/etc/passwd");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as ToolError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("refuses an absolute Windows path", () => {
    try {
      loader.read("C:\\Windows\\win.ini");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as ToolError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("refuses a NUL byte", () => {
    try {
      loader.read("mcp/tools.md\0.png");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as ToolError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("refuses an empty path", () => {
    try {
      loader.read("   ");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as ToolError).code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("ReferenceLoader in awkward conditions", () => {
  let tmp: string;

  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kf-ref-test-"));
    fs.mkdirSync(path.join(tmp, "nested"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "a.md"), "# A\n\nThe first document.\n");
    fs.writeFileSync(path.join(tmp, "nested", "b.md"), "# B\n\nThe nested one.\n");
    fs.writeFileSync(path.join(tmp, "c.txt"), "not a reference format");
    fs.writeFileSync(path.join(tmp, "d.json"), '{"ok":true}');
    fs.mkdirSync(path.join(tmp, "node_modules"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "node_modules", "e.md"), "# E\n");
    fs.writeFileSync(path.join(tmp, ".hidden.md"), "# hidden\n");
  });

  afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it("skips unsupported extensions, node_modules and dotfiles", () => {
    const paths = new ReferenceLoader(tmp).list().map((d) => d.path);
    expect(paths).toEqual(["a.md", "d.json", "nested/b.md"]);
  });

  it("returns an empty index rather than throwing when the folder is missing", () => {
    const loader = new ReferenceLoader(path.join(tmp, "nope"));
    expect(loader.available).toBe(false);
    expect(loader.list()).toEqual([]);
    expect(loader.sections()).toEqual([]);
  });

  it("re-indexes after reset", () => {
    const loader = new ReferenceLoader(tmp);
    expect(loader.list()).toHaveLength(3);
    fs.writeFileSync(path.join(tmp, "f.md"), "# F\n");
    expect(loader.list()).toHaveLength(3); // cached
    loader.reset();
    expect(loader.list()).toHaveLength(4);
    fs.rmSync(path.join(tmp, "f.md"));
  });
});
