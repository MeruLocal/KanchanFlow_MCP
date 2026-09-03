/**
 * The process-wide reference loader.
 *
 * One instance, so the index and the file bodies are parsed once per process
 * rather than once per tool call.
 */

import { loadConfig } from "../config.js";
import { ReferenceLoader } from "./loader.js";

export * from "./types.js";
export { ReferenceLoader, DEFAULT_MAX_CHARS } from "./loader.js";

let instance: ReferenceLoader | null = null;

export function referenceLoader(): ReferenceLoader {
  if (!instance) instance = new ReferenceLoader(loadConfig().referenceDir);
  return instance;
}

/** Test seam. */
export function setReferenceLoader(loader: ReferenceLoader | null): void {
  instance = loader;
}
