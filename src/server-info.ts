/**
 * Server identity, advertised in the MCP initialize handshake.
 *
 * The description must describe what this server actually serves. It is a
 * read-only window onto the published KanchanFlow website content — not an
 * API into a customer's workspace, and not something that can create or
 * change anything.
 */

export const SERVER_NAME = "kanchanflow";
export const SERVER_TITLE = "KanchanFlow";
export const SERVER_VERSION = "1.0.0";
export const SERVER_DESCRIPTION =
  "Read-only access to what KanchanFlow — the RFQ-to-Order manufacturing CRM by Soor LLC — publishes: the feature catalog with truthful status, pricing and the feature-gate matrix, the connector catalog, the glossary, the changelog and roadmap, and the project's reference documentation. It holds no customer data and cannot create, change or delete anything.";

export const SERVER_INSTRUCTIONS = [
  "This server answers questions about the KanchanFlow product from its published content. It is read-only: there are no write tools, and it holds no workspace, customer, quote or RFQ data.",
  "",
  "Start with kanchanflow_search when you do not know which collection holds the answer; each result names the tool to call next.",
  "",
  "Feature status is the thing to get right. Every feature carries live, beta, building or planned. Only 'live' means the product does it today. Check with kanchanflow_list_features or kanchanflow_get_feature before describing a capability as available.",
  "",
  "KanchanFlow has no named customers, testimonials, case studies or review scores. If a tool returns nothing on a point, say the product does not publish it rather than answering from general CRM knowledge.",
  "",
  "USD and INR prices are contracted. Every other currency is an indicative conversion at a fixed dated rate — quote the basis sentence that comes with it.",
].join("\n");
