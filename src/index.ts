#!/usr/bin/env node
/**
 * KanchanFlow MCP server entry point.
 *
 * Transport is chosen by KANCHANFLOW_MCP_TRANSPORT: stdio (default) or http.
 * See .env.example and reference/mcp/overview.md.
 */

import { runServer } from "./server.js";
import { logger } from "./utils/logger.js";

runServer().catch((err: unknown) => {
  logger.error("server.fatal", { internal: (err as Error)?.message });
  process.exitCode = 1;
});
