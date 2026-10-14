/**
 * BRAND GUARD
 * ===========
 *
 * KanchanFlow names exactly one company: Soor LLC. The website contract
 * (reference/site/spec-contract.md, guardrail 3) forbids naming any other
 * company or brand in shipped copy, and everything this server serves is
 * shipped copy.
 *
 * The forbidden names are held here only as SHA-256 digests of lower-case
 * tokens, so this file, the test suite and the published package can enforce
 * the rule without repeating the names they forbid.
 *
 * How a match works:
 *   - Text is lower-cased and split on anything that is not a-z or 0-9.
 *   - A token whose digest is in FORBIDDEN_TOKEN_DIGESTS is a hit.
 *   - Longer forbidden names (8+ characters) are also found inside a longer
 *     token, so a domain or a run-together name is still caught.
 *
 * To add a name: append sha256(lowercase name) below and, if it is 8+
 * characters, its length to SUBSTRING_LENGTHS. Never add the name itself.
 *
 * Used by scripts/sync-content.mjs (aborts a sync that would copy a forbidden
 * name) and by src/__tests__/brand-isolation.test.ts.
 */

import { createHash } from "node:crypto";

/** sha256 of each forbidden lower-case token. */
const FORBIDDEN_TOKEN_DIGESTS = new Set([
  "d76b1c0238909666ea081d2ae9b1316888661c62056ed54bde5f4150b783aa39",
  "9f8d596684d09b5628640c0ef1e31b71f3dd5ece30335efce9d168fb6fb9ac38",
  "6526904459a746a19773adb207f58373a84e5d161d84f453a3875b5191ca0bf6",
  "5662de66ee2093f2db0709bb81f8d6f88833a6700de539b0d3aa10f49c5484f0",
  "ec951ca760626a28b95c47fde66f49db81a702e0dcc717187fddb2168dc4e504",
  "c57581984fd65479415aa89c7769c58d78098ab9e4f23c85c17716a7b02c8325",
  "f14e43c1f07c5173e457d3b68a0fd5ac1b187da0922fa55098873e94fabb9c85",
  "0c10e0c1c9def3fff447b82f2e428b76e49b8604ad73ba05381e08e51ed8b830",
  "808f42d855f263da10ae0cf46cbe17429d681cccaefae90859400516d05c9c7b",
]);

/** Lengths of the forbidden names that are also searched for inside tokens. */
const SUBSTRING_LENGTHS = [8, 9, 10, 11, 14];

const digest = (s) => createHash("sha256").update(s).digest("hex");

/**
 * Every forbidden match in `text`, as `{ index, token }` where `token` is the
 * lower-case token that contained it. Empty when the text is clean.
 */
export function findBrandHits(text) {
  const hits = [];
  const lower = String(text ?? "").toLowerCase();
  const re = /[a-z0-9]+/g;
  const seen = new Map();
  let m;
  while ((m = re.exec(lower)) !== null) {
    const token = m[0];
    let hit = seen.get(token);
    if (hit === undefined) {
      hit = FORBIDDEN_TOKEN_DIGESTS.has(digest(token));
      if (!hit) {
        outer: for (const len of SUBSTRING_LENGTHS) {
          if (token.length <= len) continue;
          for (let i = 0; i + len <= token.length; i += 1) {
            if (FORBIDDEN_TOKEN_DIGESTS.has(digest(token.slice(i, i + len)))) {
              hit = true;
              break outer;
            }
          }
        }
      }
      seen.set(token, hit);
    }
    if (hit) hits.push({ index: m.index, token });
  }
  return hits;
}

/** True when `text` names no forbidden company or brand. */
export function isBrandClean(text) {
  return findBrandHits(text).length === 0;
}

/**
 * Throw when `text` names a forbidden company or brand. The error gives the
 * label and the character offset, never the matched word, so a CI log does
 * not repeat it either.
 */
export function assertBrandClean(label, text) {
  const hits = findBrandHits(text);
  if (hits.length > 0) {
    const where = hits
      .slice(0, 5)
      .map((h) => `offset ${h.index}`)
      .join(", ");
    throw new Error(
      `Brand guard: ${label} names a company or brand other than Soor LLC ` +
        `(${hits.length} match${hits.length === 1 ? "" : "es"} at ${where}). ` +
        "Fix the source in the website repository, then re-run the sync."
    );
  }
}

/**
 * The website contract's guardrail 3 states the rule by listing the names it
 * forbids. Rewrite it to state the same rule without them. Any other mention
 * is left for assertBrandClean to stop.
 */
export function redactBrandGuardrail(text) {
  return String(text).replace(
    /^(\s*\d+\.\s+)\*\*NEVER mention "[^*]*\*\*[\s\S]*?site is \*\*Soor LLC\*\*\./m,
    "$1**NEVER name any company other than Soor LLC** anywhere in shipped copy.\n" +
      "   The only company named on this site is **Soor LLC**."
  );
}
