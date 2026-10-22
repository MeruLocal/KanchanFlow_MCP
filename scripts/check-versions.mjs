#!/usr/bin/env node
/**
 * Version parity: package.json is the single version source. server.json (the
 * MCP Registry manifest) must carry the same version at the top level and on
 * every package entry. Exits non-zero on any mismatch.
 *
 *   npm run check:versions
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));

const pkg = read("package.json");
const server = read("server.json");

const problems = [];
if (server.version !== pkg.version) {
  problems.push(`server.json version ${server.version} != package.json ${pkg.version}`);
}
for (const [i, p] of (server.packages ?? []).entries()) {
  if (p.version !== pkg.version) {
    problems.push(`server.json packages[${i}].version ${p.version} != package.json ${pkg.version}`);
  }
  if (p.registryType === "npm" && p.identifier !== pkg.name) {
    problems.push(`server.json packages[${i}].identifier ${p.identifier} != package.json name ${pkg.name}`);
  }
}

if (problems.length > 0) {
  console.error(`Version parity failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`Version parity OK: ${pkg.version}`);
