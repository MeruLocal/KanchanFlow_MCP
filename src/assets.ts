/**
 * Static brand assets for the HTTP homepage.
 *
 * The homepage needs the real KanchanFlow lockup and a browser-tab icon. Two
 * ways to get them into the page: inline them as data: URIs, or serve them.
 * Serving wins here — the light and dark lockups are ~166 KB together, and
 * inlining both would put that in every HTML response, defeating the ETag the
 * homepage already sets and paying the cost again on every render.
 *
 * This is deliberately not a static file server. It is a fixed allowlist of
 * three filenames resolved inside one directory: there is no path parameter
 * that reaches the filesystem, so there is no traversal to guard against. A
 * request for anything not on the list is a miss, not a read.
 *
 * Files arrive via `npm run sync`, copied from the website repository. A
 * missing assets folder degrades to "no asset found", and the homepage falls
 * back to its typographic mark rather than the server failing to boot.
 */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { packagePath } from "./utils/package-paths.js";

export interface BrandAsset {
  /** Public URL path this asset is served from. */
  urlPath: string;
  bytes: Buffer;
  contentType: string;
  etag: string;
}

/** filename -> content type. The whole allowlist; nothing else is reachable. */
const ALLOWED: Record<string, string> = {
  "kanchanflow-logo-light.png": "image/png",
  "kanchanflow-logo-dark.png": "image/png",
  "icon-192.png": "image/png",
};

export const ASSET_URL_PREFIX = "/assets/brand/";

/** Where the icon is served from, for <link rel="icon"> and /favicon.ico. */
export const ICON_URL = `${ASSET_URL_PREFIX}icon-192.png`;
export const LOGO_LIGHT_URL = `${ASSET_URL_PREFIX}kanchanflow-logo-light.png`;
export const LOGO_DARK_URL = `${ASSET_URL_PREFIX}kanchanflow-logo-dark.png`;

let cache: Map<string, BrandAsset> | null = null;

function load(): Map<string, BrandAsset> {
  if (cache) return cache;

  const dir = packagePath("assets", "brand");
  const loaded = new Map<string, BrandAsset>();

  for (const [filename, contentType] of Object.entries(ALLOWED)) {
    const file = path.join(dir, filename);
    let bytes: Buffer;
    try {
      bytes = fs.readFileSync(file);
    } catch {
      continue; // Not synced. The homepage falls back.
    }
    loaded.set(filename, {
      urlPath: `${ASSET_URL_PREFIX}${filename}`,
      bytes,
      contentType,
      etag: `"${createHash("sha256").update(bytes).digest("hex").slice(0, 24)}"`,
    });
  }

  cache = loaded;
  return loaded;
}

/** True when the brand artwork is present, so the homepage can pick a header. */
export function brandAssetsAvailable(): boolean {
  return load().has("kanchanflow-logo-light.png") && load().has("kanchanflow-logo-dark.png");
}

/**
 * Resolve a request path to an asset. Returns null for anything that is not
 * one of the allowlisted names — including any path that tries to be clever,
 * because the filename is matched against the allowlist rather than joined
 * onto a directory and read.
 */
export function assetFor(urlPath: string): BrandAsset | null {
  if (!urlPath.startsWith(ASSET_URL_PREFIX)) return null;
  const filename = urlPath.slice(ASSET_URL_PREFIX.length);
  if (!Object.prototype.hasOwnProperty.call(ALLOWED, filename)) return null;
  return load().get(filename) ?? null;
}

/** Test seam. */
export function resetAssetCache(): void {
  cache = null;
}
