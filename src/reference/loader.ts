/**
 * REFERENCE LOADER
 * ================
 *
 * The single way anything in this server reads the reference/ folder. Tools,
 * resources and prompts all go through here rather than embedding
 * documentation in their own source, so one edit to a reference document
 * changes every surface that quotes it.
 *
 * Guarantees:
 *   - Deterministic. The index is sorted by path, so two calls agree.
 *   - Bounded. Only .md and .json files, only under the reference root, and
 *     never a file over MAX_FILE_BYTES.
 *   - Traversal-safe. A requested path is normalised and then verified to
 *     resolve inside the root with fs.realpathSync, which also defeats a
 *     symlink pointing out of the tree.
 *   - Lazy. The index is built on first use and cached; file bodies are read
 *     on demand and cached individually.
 *   - Forgiving. A missing reference folder yields an empty index rather than
 *     a crash, so the server still serves the content mirror.
 */

import fs from "node:fs";
import path from "node:path";

import { packagePath } from "../utils/package-paths.js";
import { notFound, validationError } from "../errors.js";
import type { ReferenceDocument, ReferenceDocumentContent } from "./types.js";

/** Extensions that may be read. Anything else is invisible to the loader. */
const ALLOWED_EXTENSIONS = new Set([".md", ".json"]);

/** Directories never walked, whatever they contain. */
const SKIP_DIRS = new Set(["node_modules", ".git", ".github", "dist", "coverage"]);

/** A single document larger than this is skipped rather than served. */
const MAX_FILE_BYTES = 512 * 1024;

/** Default cap on the body returned by read(). Keeps a response under ~25k characters. */
export const DEFAULT_MAX_CHARS = 20_000;

/** Largest slice a caller may ask for. */
export const MAX_SLICE_CHARS = 22_000;

export class ReferenceLoader {
  private readonly root: string;
  private index: ReferenceDocument[] | null = null;
  private readonly bodies = new Map<string, string>();

  constructor(rootDir?: string | null) {
    this.root = rootDir ? path.resolve(rootDir) : packagePath("reference");
  }

  /** Absolute path of the reference root, whether or not it exists. */
  get rootDir(): string {
    return this.root;
  }

  get available(): boolean {
    return fs.existsSync(this.root) && fs.statSync(this.root).isDirectory();
  }

  /** Every readable document, sorted by path. Built once, then cached. */
  list(): ReferenceDocument[] {
    if (this.index) return this.index;
    if (!this.available) {
      this.index = [];
      return this.index;
    }

    const found: ReferenceDocument[] = [];
    const walk = (dir: string): void => {
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (SKIP_DIRS.has(entry.name)) continue;
          walk(abs);
          continue;
        }
        if (!entry.isFile()) continue; // symlinks and devices are not documents
        if (!ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

        const stat = fs.statSync(abs);
        if (stat.size > MAX_FILE_BYTES) continue;

        const rel = path.relative(this.root, abs).split(path.sep).join("/");
        const segments = rel.split("/");
        found.push({
          path: rel,
          title: this.readTitle(abs, entry.name),
          section: segments.length > 1 ? (segments[0] as string) : "root",
          bytes: stat.size,
          summary: this.readSummary(abs),
        });
      }
    };
    walk(this.root);

    // Codepoint order, not locale order: the index must be identical on every
    // host, and localeCompare is not.
    found.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    this.index = found;
    return found;
  }

  /** The distinct top-level sections present, in sorted order. */
  sections(): string[] {
    return [...new Set(this.list().map((d) => d.section))].sort();
  }

  /**
   * Read one document. `relPath` is a path relative to the reference root; an
   * absolute path, a "..", or anything resolving outside the root is a
   * VALIDATION_ERROR rather than a read.
   */
  read(relPath: string, maxChars = DEFAULT_MAX_CHARS, offset = 0): ReferenceDocumentContent {
    const doc = this.resolve(relPath);
    const abs = path.join(this.root, doc.path);

    let body = this.bodies.get(doc.path);
    if (body === undefined) {
      body = fs.readFileSync(abs, "utf8");
      this.bodies.set(doc.path, body);
    }

    const limit = Math.max(1, Math.min(maxChars, MAX_FILE_BYTES));
    const start = Math.max(0, Math.min(Math.trunc(offset), body.length));
    const end = Math.min(body.length, start + limit);
    const truncated = end < body.length;
    return {
      ...doc,
      content: body.slice(start, end),
      truncated,
      offset: start,
      ...(truncated
        ? {
            nextOffset: end,
            note: `Truncated at ${limit} characters (characters ${start}–${end} of ${body.length}). Call again with offset ${end} for the rest.`,
          }
        : {}),
    };
  }

  /** Full-text search across document bodies. Returns matching lines. */
  search(query: string, limit = 20): { path: string; title: string; line: number; text: string }[] {
    return this.searchPage(query, limit, 0).matches;
  }

  /**
   * One page of matching lines, in document-path then line order. `hasMore`
   * says whether another page exists; `nextOffset` is where it starts.
   */
  searchPage(
    query: string,
    limit = 20,
    offset = 0
  ): { matches: { path: string; title: string; line: number; text: string }[]; offset: number; hasMore: boolean; nextOffset?: number } {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) {
      throw validationError("Reference search needs a query of at least 2 characters.");
    }
    const start = Math.max(0, Math.trunc(offset));
    const want = start + limit + 1; // one extra to know whether more exist
    const hits: { path: string; title: string; line: number; text: string }[] = [];
    for (const doc of this.list()) {
      if (hits.length >= want) break;
      const body = this.read(doc.path, MAX_FILE_BYTES).content;
      const lines = body.split("\n");
      for (let i = 0; i < lines.length && hits.length < want; i += 1) {
        const line = lines[i] as string;
        if (line.toLowerCase().includes(needle)) {
          hits.push({ path: doc.path, title: doc.title, line: i + 1, text: line.trim().slice(0, 300) });
        }
      }
    }
    const matches = hits.slice(start, start + limit);
    const hasMore = hits.length > start + limit;
    return { matches, offset: start, hasMore, ...(hasMore ? { nextOffset: start + limit } : {}) };
  }

  /** Drop cached index and bodies. Used by tests and by a future watch mode. */
  reset(): void {
    this.index = null;
    this.bodies.clear();
  }

  /* ---------------------------------------------------------------- */

  /**
   * Map a caller-supplied path onto an indexed document, refusing anything
   * that tries to leave the reference root.
   */
  private resolve(relPath: string): ReferenceDocument {
    const raw = String(relPath ?? "").trim();
    if (!raw) throw validationError("A reference document path is required.");
    if (raw.includes("\0")) throw validationError("Invalid reference document path.");
    if (path.isAbsolute(raw) || /^[a-zA-Z]:[\\/]/.test(raw)) {
      throw validationError(
        "Reference paths are relative to the reference root. Absolute paths are not accepted."
      );
    }

    const normalised = path.posix.normalize(raw.split(path.sep).join("/")).replace(/^\.\//, "");
    if (normalised === ".." || normalised.startsWith("../")) {
      throw validationError("Reference paths may not traverse outside the reference root.");
    }

    const candidate = path.resolve(this.root, normalised);
    const rootWithSep = this.root.endsWith(path.sep) ? this.root : this.root + path.sep;
    if (!candidate.startsWith(rootWithSep)) {
      throw validationError("Reference paths may not traverse outside the reference root.");
    }

    const doc = this.list().find((d) => d.path === normalised);
    if (!doc) {
      throw notFound(`No reference document at "${normalised}".`, {
        availablePaths: this.list()
          .map((d) => d.path)
          .slice(0, 40),
      });
    }

    // Final check against a symlink that points out of the tree. The index
    // only holds regular files, so this is belt and braces.
    const real = fs.realpathSync(candidate);
    const realRoot = fs.realpathSync(this.root);
    const realRootWithSep = realRoot.endsWith(path.sep) ? realRoot : realRoot + path.sep;
    if (!real.startsWith(realRootWithSep)) {
      throw validationError("Reference paths may not traverse outside the reference root.");
    }

    return doc;
  }

  private readTitle(abs: string, filename: string): string {
    if (path.extname(abs) === ".json") return filename;
    const head = this.head(abs);
    const h1 = head.split("\n").find((l) => l.startsWith("# "));
    return h1 ? h1.replace(/^#\s+/, "").trim() : filename;
  }

  private readSummary(abs: string): string {
    if (path.extname(abs) === ".json") return "Structured reference data.";
    const lines = this.head(abs).split("\n");
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      if (t.startsWith("#") || t.startsWith("<!--") || t.startsWith(">") || t.startsWith("---")) continue;
      if (t.startsWith("|") || t.startsWith("```")) continue;
      return t.replace(/\s+/g, " ").slice(0, 220);
    }
    return "";
  }

  /** First 4 KB of a file — enough for a title and a lead paragraph. */
  private head(abs: string): string {
    const fd = fs.openSync(abs, "r");
    try {
      const buf = Buffer.alloc(4096);
      const read = fs.readSync(fd, buf, 0, 4096, 0);
      return buf.subarray(0, read).toString("utf8");
    } finally {
      fs.closeSync(fd);
    }
  }
}
