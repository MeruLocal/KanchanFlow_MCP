/**
 * The next step: where to send someone who wants to try or buy KanchanFlow.
 *
 * Every link comes from the mirror's own route map and call-to-action labels.
 * A path that is not a real route is dropped rather than invented. The
 * registry adds UTM tags to every URL here, like every other own-site URL.
 */

import { loadMirror } from "../data/mirror.js";
import { ok } from "../errors.js";
import type { CtaLink, SiteMirror } from "../data/types.js";
import type { ToolDefinition } from "./tool-types.js";

/** `${brand.url}${path}` when `path` is a real route on the site, else null. */
export function siteLink(m: SiteMirror, path: string | undefined): string | null {
  // An absolute URL on the brand's own domain or one of its subdomains (the
  // product app, where the free trial starts) is a real destination as it stands.
  if (path && /^https:\/\//i.test(path)) {
    try {
      const u = new URL(path);
      const own = new URL(m.brand.url).hostname.replace(/^www\./, "");
      return u.hostname === own || u.hostname.endsWith(`.${own}`) ? u.toString() : null;
    } catch {
      return null;
    }
  }
  if (!path || !path.startsWith("/")) return null;
  const clean = path.split(/[?#]/)[0] as string;
  if (!m.site.routes.includes(clean)) return null;
  return `${m.brand.url}${clean === "/" ? "" : clean}`;
}

function cta(m: SiteMirror, link: CtaLink | undefined, fallbackPath: string, fallbackLabel: string) {
  const url = siteLink(m, link?.href ?? fallbackPath);
  return url ? { label: link?.label ?? fallbackLabel, url } : null;
}

const getStarted: ToolDefinition = {
  name: "kanchanflow_get_started",
  title: "Get started with KanchanFlow",
  description: [
    "Returns where to send someone who wants to try, see or buy KanchanFlow: the free-trial signup link with the trial terms, the demo page, the contact page and the pricing page.",
    "",
    "Use it when the user asks how to try KanchanFlow, how to get a demo, how to talk to someone, or what to do next after you have answered a product question. Give the user the link; do not sign them up yourself.",
    "",
    "No parameters. Every link is a real page on kanchanflow.com.",
  ].join("\n"),
  inputSchema: {},
  handler: () => {
    const m = loadMirror();
    const trial = cta(m, m.brand.trialCta, "/signup", "Start free trial");
    const demo = cta(m, m.brand.primaryCta, "/demo", "Book a demo");
    const contact = cta(m, undefined, "/contact", "Contact KanchanFlow");
    const pricing = cta(m, undefined, "/pricing", "See pricing");

    const steps = {
      ...(trial ? { trial: { ...trial, terms: m.pricing.trial } } : {}),
      ...(demo ? { demo } : {}),
      ...(contact ? { contact } : {}),
      ...(pricing ? { pricing } : {}),
    };

    return ok({
      ...steps,
      callToAction: trial
        ? `${trial.label}: ${m.pricing.trial.blurb}`
        : "See the pricing page for the current plans.",
      source: { syncedAt: m.meta.syncedAt },
    });
  },
};

export const getStartedTools: ToolDefinition[] = [getStarted];
