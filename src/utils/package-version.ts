/**
 * The package version, read from package.json — the single version source.
 * server.json is held to it by scripts/check-versions.mjs. "0.0.0" means
 * package.json could not be read, which only happens in a broken install.
 */

import fs from "node:fs";

import { packagePath } from "./package-paths.js";

function readVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath("package.json"), "utf8")) as { version?: unknown };
    return typeof pkg.version === "string" && pkg.version ? pkg.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export const PACKAGE_VERSION = readVersion();
