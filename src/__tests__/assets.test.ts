/**
 * Brand assets and the homepage masthead.
 *
 * The asset route is the one place the HTTP server returns bytes from disk, so
 * the tests that matter are: the allowlist really is an allowlist, and the
 * homepage references only URLs the route will actually serve.
 */

import { describe, expect, it } from "vitest";

import {
  ASSET_URL_PREFIX,
  ICON_URL,
  LOGO_DARK_URL,
  LOGO_LIGHT_URL,
  assetFor,
  brandAssetsAvailable,
} from "../assets.js";
import { renderHomepage } from "../homepage.js";
import { loadConfig } from "../config.js";

describe("brand assets", () => {
  it("has the artwork synced from the website repository", () => {
    expect(brandAssetsAvailable()).toBe(true);
  });

  it("serves each allowlisted file as a PNG with an ETag", () => {
    for (const url of [LOGO_LIGHT_URL, LOGO_DARK_URL, ICON_URL]) {
      const asset = assetFor(url);
      expect(asset, url).not.toBeNull();
      expect(asset!.contentType).toBe("image/png");
      expect(asset!.bytes.length).toBeGreaterThan(1000);
      expect(asset!.etag).toMatch(/^"[0-9a-f]{24}"$/);
      // A real PNG, not an HTML error page that happened to be saved there.
      expect(asset!.bytes.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
    }
  });

  it("gives each file a distinct ETag", () => {
    const etags = [LOGO_LIGHT_URL, LOGO_DARK_URL, ICON_URL].map((u) => assetFor(u)!.etag);
    expect(new Set(etags).size).toBe(3);
  });

  it("refuses anything outside the allowlist", () => {
    const misses = [
      `${ASSET_URL_PREFIX}../../.env`,
      `${ASSET_URL_PREFIX}../../package.json`,
      `${ASSET_URL_PREFIX}../data/site-mirror.json`,
      `${ASSET_URL_PREFIX}kanchanflow-logo-light.png.bak`,
      `${ASSET_URL_PREFIX}`,
      "/assets/brand",
      "/etc/passwd",
      "/data/site-mirror.json",
      "/.env",
    ];
    for (const attempt of misses) {
      expect(assetFor(attempt), attempt).toBeNull();
    }
  });

  it("does not resolve inherited Object properties as filenames", () => {
    // A naive `ALLOWED[filename]` lookup would hand back Object.prototype
    // members for these. The allowlist uses hasOwnProperty for that reason.
    for (const key of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
      expect(assetFor(`${ASSET_URL_PREFIX}${key}`), key).toBeNull();
    }
  });
});

describe("homepage masthead", () => {
  const html = renderHomepage(loadConfig({}));

  it("shows the real lockup rather than the placeholder tile", () => {
    expect(html).toContain(LOGO_LIGHT_URL);
    expect(html).toContain(LOGO_DARK_URL);
    expect(html).not.toContain('class="logomark"');
  });

  it("links a browser-tab icon", () => {
    expect(html).toContain(`<link rel="icon" type="image/png" href="${ICON_URL}">`);
  });

  it("references only asset URLs the server will serve", () => {
    // Anchored on a real file extension: prose in a CSS comment mentions the
    // prefix, and matching that would assert against a URL nothing requests.
    const referenced = [...html.matchAll(/\/assets\/brand\/[A-Za-z0-9_-]+\.(?:png|svg|ico)/g)].map(
      (m) => m[0]
    );
    expect(referenced.length).toBeGreaterThan(0);
    for (const url of new Set(referenced)) {
      expect(assetFor(url), `homepage references unservable ${url}`).not.toBeNull();
    }
  });

  it("gives the light lockup alt text and hides the dark duplicate from AT", () => {
    expect(html).toMatch(/<img class="logo light"[^>]*alt="KanchanFlow"/);
    expect(html).toMatch(/<img class="logo dark"[^>]*aria-hidden="true"/);
  });

  it("sets intrinsic dimensions so the masthead does not shift on load", () => {
    const imgs = [...html.matchAll(/<img class="logo [^>]*>/g)].map((m) => m[0]);
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img).toContain('width="1200"');
      expect(img).toContain('height="261"');
    }
  });
});
