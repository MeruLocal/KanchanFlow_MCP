/**
 * Locating files that ship with the package.
 *
 * The compiled server runs from dist/, the test suite and `npm run dev` run
 * from src/, and a global install puts both somewhere else again. Rather than
 * hard-code a number of "..", walk up from this module until the package root
 * — the directory holding package.json — is found, then resolve from there.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let cachedRoot: string | null = null;

export function packageRoot(): string {
  if (cachedRoot) return cachedRoot;

  let dir = path.dirname(fileURLToPath(import.meta.url));
  const stopAt = path.parse(dir).root;

  while (true) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      cachedRoot = dir;
      return dir;
    }
    if (dir === stopAt) break;
    dir = path.dirname(dir);
  }

  throw new Error("Could not locate the kanchanflow-mcp package root.");
}

/** Resolve a path relative to the package root. */
export function packagePath(...segments: string[]): string {
  return path.join(packageRoot(), ...segments);
}
