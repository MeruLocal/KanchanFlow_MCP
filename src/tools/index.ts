/**
 * The tool registry.
 *
 * Every tool in one array, so the server, the documentation generator and the
 * test suite all read the same list. Uniqueness and the naming convention are
 * asserted at module load: a typo becomes a startup failure rather than a
 * silently shadowed tool.
 */

import { companyTools } from "./company.js";
import { contentTools } from "./content.js";
import { featureTools } from "./features.js";
import { integrationTools } from "./integrations.js";
import { marketTools } from "./markets.js";
import { partnerTools } from "./partners.js";
import { pricingTools } from "./pricing.js";
import { referenceTools } from "./reference.js";
import { searchTools } from "./search.js";
import { siteTools } from "./site.js";
import type { ToolDefinition } from "./tool-types.js";

export * from "./tool-types.js";

export const allTools: ToolDefinition[] = [
  ...companyTools,
  ...featureTools,
  ...pricingTools,
  ...integrationTools,
  ...marketTools,
  ...contentTools,
  ...partnerTools,
  ...siteTools,
  ...searchTools,
  ...referenceTools,
];

export const NAME_PATTERN = /^kanchanflow_[a-z]+(?:_[a-z0-9]+)*$/;

const seen = new Set<string>();
for (const tool of allTools) {
  if (!NAME_PATTERN.test(tool.name)) {
    throw new Error(`Tool "${tool.name}" does not follow the kanchanflow_<action>_<resource> convention.`);
  }
  if (seen.has(tool.name)) throw new Error(`Duplicate tool name: ${tool.name}`);
  seen.add(tool.name);
}

export const toolsByName: ReadonlyMap<string, ToolDefinition> = new Map(
  allTools.map((t) => [t.name, t])
);
