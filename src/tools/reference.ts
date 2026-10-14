/**
 * Reference-folder tools.
 *
 * The reference set is the written record behind everything else this server
 * serves: architecture, the API surface, how MCP is wired in, the data model,
 * worked examples, and a synced copy of the website's own build contract.
 *
 * All three tools go through the shared ReferenceLoader, so the traversal and
 * size limits are enforced in one place rather than per tool.
 */

import { z } from "zod";

import { DEFAULT_MAX_CHARS, referenceLoader } from "../reference/index.js";
import { ok } from "../errors.js";
import type { ToolDefinition } from "./tool-types.js";

const listReferenceDocuments: ToolDefinition<{ section?: string }> = {
  name: "kanchanflow_list_reference_documents",
  title: "List KanchanFlow reference documents",
  description: [
    "Lists the reference documentation shipped with this MCP server: path, title, section, size and a one-line summary for each document.",
    "",
    "Sections cover the KanchanFlow architecture, the API surface, the MCP integration itself (tools, resources, prompts, security), the data model, worked examples, and a synced copy of the website's own build contract and README.",
    "",
    "Use it to find the right document, then read it with kanchanflow_get_reference_document. Optional `section` narrows the list.",
  ].join("\n"),
  inputSchema: {
    section: z
      .string()
      .optional()
      .describe("Top-level section, e.g. 'mcp', 'architecture', 'api', 'site'."),
  },
  handler: ({ section }) => {
    const loader = referenceLoader();
    const all = loader.list();
    const wanted = section?.toLowerCase().trim();
    const documents = wanted ? all.filter((d) => d.section.toLowerCase() === wanted) : all;
    return ok({
      total: documents.length,
      sections: loader.sections(),
      available: loader.available,
      documents,
      ...(loader.available
        ? {}
        : { note: "No reference folder is present in this installation. The content tools are unaffected." }),
    });
  },
};

const getReferenceDocument: ToolDefinition<{ path: string; maxChars?: number }> = {
  name: "kanchanflow_get_reference_document",
  title: "Read one KanchanFlow reference document",
  description: [
    "Returns the full text of one reference document.",
    "",
    "Required: `path`, relative to the reference root, exactly as kanchanflow_list_reference_documents reported it (for example 'mcp/tools.md' or 'site/spec-contract.md'). Optional `maxChars` caps the body; the response reports whether it was truncated.",
    "",
    "Paths are confined to the reference folder. An absolute path, a '..' segment, or anything resolving outside the folder is rejected with VALIDATION_ERROR — this tool is not a general file reader and cannot be used to read anything else on the host.",
    "Errors: NOT_FOUND with the available paths when the document does not exist.",
  ].join("\n"),
  inputSchema: {
    path: z.string().min(1).describe("Document path relative to the reference root, e.g. 'mcp/tools.md'."),
    maxChars: z
      .number()
      .int()
      .min(200)
      .max(200_000)
      .optional()
      .describe(`Maximum characters of body to return. Default ${DEFAULT_MAX_CHARS}.`),
  },
  handler: ({ path, maxChars }) => ok(referenceLoader().read(path, maxChars ?? DEFAULT_MAX_CHARS)),
};

const searchReference: ToolDefinition<{ query: string; limit?: number }> = {
  name: "kanchanflow_search_reference",
  title: "Search the KanchanFlow reference documents",
  description: [
    "Full-text search across the reference documentation. Returns each matching line with its document path, title and line number, so you can jump straight to the right document.",
    "",
    "Required: `query`, at least two characters. Optional `limit` defaults to 20 and caps at 100.",
    "Use it when you know the concept but not which document covers it.",
  ].join("\n"),
  inputSchema: {
    query: z.string().min(2).describe("Search term, at least two characters."),
    limit: z.number().int().min(1).max(100).optional().describe("Maximum matching lines. Default 20."),
  },
  handler: ({ query, limit }) => {
    const matches = referenceLoader().search(query, limit ?? 20);
    return ok({ query, total: matches.length, matches });
  },
};

export const referenceTools: ToolDefinition[] = [
  listReferenceDocuments as ToolDefinition,
  getReferenceDocument as ToolDefinition,
  searchReference as ToolDefinition,
];
