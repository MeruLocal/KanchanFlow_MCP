/**
 * Types for the reference document set.
 */

export interface ReferenceDocument {
  /** POSIX-style path relative to the reference root, e.g. "mcp/tools.md". */
  path: string;
  /** First markdown H1 in the file, or the filename when there is none. */
  title: string;
  /** Top-level folder: architecture, api, mcp, data-model, examples, site. */
  section: string;
  bytes: number;
  /** First non-heading paragraph, trimmed to a single line. */
  summary: string;
}

export interface ReferenceDocumentContent extends ReferenceDocument {
  content: string;
  /** True when `content` was cut to the requested maximum length. */
  truncated: boolean;
}
