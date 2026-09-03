/**
 * The HTML homepage served at "/" by the HTTP transport.
 *
 * Everything on the page is generated from the same registries the MCP
 * protocol advertises — allTools, prompts, siteResources, referenceResources.
 * Nothing is hand-listed, so a tool added to the registry appears here on the
 * next boot and a page that drifts from the protocol is not a thing that can
 * happen.
 *
 * The page is built once and served from a cached string with an ETag,
 * because it only varies with the config it was rendered for.
 */

import { createHash } from "node:crypto";

import type { ZodTypeAny } from "zod";

import type { Config } from "./config.js";
import { prompts } from "./prompts/index.js";
import { referenceResources, siteResources } from "./resources/index.js";
import { allTools } from "./tools/index.js";
import { companyTools } from "./tools/company.js";
import { contentTools } from "./tools/content.js";
import { featureTools } from "./tools/features.js";
import { integrationTools } from "./tools/integrations.js";
import { marketTools } from "./tools/markets.js";
import { partnerTools } from "./tools/partners.js";
import { pricingTools } from "./tools/pricing.js";
import { referenceTools } from "./tools/reference.js";
import { searchTools } from "./tools/search.js";
import { siteTools } from "./tools/site.js";
import type { ToolDefinition } from "./tools/tool-types.js";
import {
  SERVER_DESCRIPTION,
  SERVER_NAME,
  SERVER_TITLE,
  SERVER_VERSION,
} from "./server-info.js";
import {
  ICON_URL,
  LOGO_DARK_URL,
  LOGO_LIGHT_URL,
  brandAssetsAvailable,
} from "./assets.js";

/* ---------------------------------------------------------------- escaping */

/** Escape for HTML text and double-quoted attribute values. */
function esc(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Embed a value in a <script> without letting a "</script>" close the tag. */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/* ----------------------------------------------------------------- schemas */

interface ParamView {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

/** Peel ZodOptional/ZodDefault/ZodNullable down to the type a caller passes. */
function unwrap(schema: ZodTypeAny): ZodTypeAny {
  let current = schema;
  for (let i = 0; i < 10; i += 1) {
    const inner = (current as { _def?: { innerType?: ZodTypeAny } })._def?.innerType;
    if (!inner) return current;
    current = inner;
  }
  return current;
}

function typeLabel(schema: ZodTypeAny): string {
  const def = unwrap(schema)._def as { typeName?: string; values?: unknown[] } | undefined;
  const name = def?.typeName ?? "";
  if (name === "ZodEnum" && Array.isArray(def?.values)) {
    return def.values.map((v) => String(v)).join(" | ");
  }
  return name.replace(/^Zod/, "").toLowerCase() || "any";
}

function paramsOf(tool: ToolDefinition): ParamView[] {
  return Object.entries(tool.inputSchema).map(([name, schema]) => {
    const zod = schema as ZodTypeAny;
    return {
      name,
      type: typeLabel(zod),
      required: !zod.isOptional(),
      description: zod.description ?? "",
    };
  });
}

/* -------------------------------------------------------------- categories */

interface Category {
  title: string;
  blurb: string;
  tools: ToolDefinition[];
}

const CATEGORIES: Category[] = [
  { title: "Company", blurb: "Who KanchanFlow is and what it claims.", tools: companyTools },
  {
    title: "Features",
    blurb: "The catalog, with live / beta / building / planned status.",
    tools: featureTools,
  },
  {
    title: "Pricing",
    blurb: "Plans, add-ons, AI credits and the feature-gate matrix.",
    tools: pricingTools,
  },
  {
    title: "Integrations",
    blurb: "The connector catalog and the limits on each connector.",
    tools: integrationTools,
  },
  { title: "Markets", blurb: "Display markets and dated currency conversion.", tools: marketTools },
  { title: "Content", blurb: "Blog, glossary, changelog and roadmap.", tools: contentTools },
  { title: "Partners", blurb: "The partner program.", tools: partnerTools },
  { title: "Site", blurb: "Published pages and the SEO content contract.", tools: siteTools },
  { title: "Search", blurb: "One entry point across every collection.", tools: searchTools },
  { title: "Reference", blurb: "The packaged reference documentation set.", tools: referenceTools },
];

/** Categories, plus any tool a category forgot, so the page cannot under-report. */
function categorised(): Category[] {
  const grouped = new Set(CATEGORIES.flatMap((c) => c.tools.map((t) => t.name)));
  const orphans = allTools.filter((t) => !grouped.has(t.name));
  const groups = CATEGORIES.filter((c) => c.tools.length > 0);
  if (orphans.length > 0) {
    groups.push({ title: "Other", blurb: "Registered tools not yet categorised.", tools: orphans });
  }
  return groups;
}

/* ---------------------------------------------------------------- partials */

function paramsHtml(params: ParamView[]): string {
  if (params.length === 0) return `<p class="noargs">No arguments.</p>`;
  const rows = params
    .map(
      (p) =>
        `<li><code class="pname">${esc(p.name)}</code>` +
        `<span class="ptype">${esc(p.type)}</span>` +
        (p.required ? `<span class="req">required</span>` : `<span class="opt">optional</span>`) +
        (p.description ? `<span class="pdesc">${esc(p.description)}</span>` : "") +
        `</li>`
    )
    .join("");
  return `<ul class="params">${rows}</ul>`;
}

function toolHtml(tool: ToolDefinition): string {
  const search = `${tool.name} ${tool.title} ${tool.description}`.toLowerCase();
  return (
    `<article class="tool" data-search="${esc(search)}">` +
    `<header><h4>${esc(tool.title)}</h4><code class="tname">${esc(tool.name)}</code></header>` +
    `<p class="tdesc">${esc(tool.description)}</p>` +
    paramsHtml(paramsOf(tool)) +
    `<button class="try" type="button" data-tool="${esc(tool.name)}">Try it</button>` +
    `</article>`
  );
}

function promptHtml(prompt: (typeof prompts)[number]): string {
  const args = Object.entries(prompt.argsSchema)
    .map(([name, schema]) => {
      const zod = schema as ZodTypeAny;
      return (
        `<li><code class="pname">${esc(name)}</code>` +
        (zod.isOptional() ? `<span class="opt">optional</span>` : `<span class="req">required</span>`) +
        (zod.description ? `<span class="pdesc">${esc(zod.description)}</span>` : "") +
        `</li>`
      );
    })
    .join("");
  const search = `${prompt.name} ${prompt.title} ${prompt.description}`.toLowerCase();
  return (
    `<article class="tool" data-search="${esc(search)}">` +
    `<header><h4>${esc(prompt.title)}</h4><code class="tname">${esc(prompt.name)}</code></header>` +
    `<p class="tdesc">${esc(prompt.description)}</p>` +
    (args ? `<ul class="params">${args}</ul>` : `<p class="noargs">No arguments.</p>`) +
    `</article>`
  );
}

/* ------------------------------------------------------------------ styles */

const STYLES = `
:root{
  color-scheme: light dark;
  --bg:#fbfaf8; --panel:#ffffff; --text:#1b1a17; --muted:#6d6a63;
  --border:#e6e3dd; --accent:#b45309; --accent-soft:#fdf3e7; --on-accent:#ffffff;
  --ok:#15803d; --ok-soft:#eaf6ee; --code:#f6f4f0; --radius:10px;
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#161513; --panel:#1e1d1a; --text:#eceae5; --muted:#9c968c;
    --border:#312f2b; --accent:#f0a044; --accent-soft:#2a2016; --on-accent:#161513;
    --ok:#6ee7a8; --ok-soft:#14261b; --code:#131211;
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
  font:15px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased}
code,pre,.tname,.pname{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
a{color:var(--accent)}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}

header.top{border-bottom:1px solid var(--border);background:var(--panel);position:sticky;top:0;z-index:20}
.topin{display:flex;align-items:center;gap:14px;height:60px}
/* The real lockup, served from /assets/brand/. Two files, swapped on the
   colour scheme rather than tinted: the artwork carries deep maroons that go
   muddy on a dark ground, and the dark file lifts them. Both are in the DOM
   and only one is ever painted, so the correct one is right at first paint
   with no script. */
.logo{height:26px;width:auto;display:block;flex:none}
.logo.dark{display:none}
@media (prefers-color-scheme: dark){
  .logo.light{display:none}
  .logo.dark{display:block}
}
/* Fallback tile, used only when the brand artwork has not been synced. */
.logomark{width:28px;height:28px;border-radius:7px;background:var(--accent);color:var(--on-accent);
  display:grid;place-items:center;font-weight:700;font-size:14px;flex:none}
.brand{font-weight:650;letter-spacing:-.01em}
.brand span{color:var(--muted);font-weight:450}
.brand.withlogo{font-weight:450;color:var(--muted);letter-spacing:0}
.brandlink{display:inline-flex;align-items:center;text-decoration:none;flex:none}
.pill{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:12.5px;
  color:var(--ok);background:var(--ok-soft);border:1px solid var(--border);padding:4px 11px;border-radius:999px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--ok)}

.hero{padding:56px 0 40px;border-bottom:1px solid var(--border)}
.hero h1{font-size:clamp(28px,4vw,40px);line-height:1.15;letter-spacing:-.025em;margin:0 0 16px;max-width:20ch}
.lede{font-size:17px;color:var(--muted);max-width:68ch;margin:0 0 28px}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px}
.badge{font-size:12.5px;border:1px solid var(--border);background:var(--panel);
  padding:5px 11px;border-radius:999px;color:var(--muted)}
.badge.ro{color:var(--accent);background:var(--accent-soft);border-color:transparent}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.stat{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px}
.stat b{display:block;font-size:26px;letter-spacing:-.02em;line-height:1.2}
.stat span{font-size:12.5px;color:var(--muted)}

section.block{padding:44px 0;border-bottom:1px solid var(--border)}
h2{font-size:19px;letter-spacing:-.015em;margin:0 0 6px}
.sub{color:var(--muted);font-size:14px;margin:0 0 22px;max-width:70ch}
h3{font-size:15.5px;margin:0 0 4px;letter-spacing:-.01em}

.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
.card h3{margin-bottom:8px}
.card p{color:var(--muted);font-size:13.5px;margin:0 0 14px}
pre{background:var(--code);border:1px solid var(--border);border-radius:8px;padding:13px 15px;
  overflow-x:auto;font-size:12.5px;line-height:1.55;margin:0}
.copy{margin-top:10px;font-size:12.5px;background:none;border:1px solid var(--border);
  color:var(--muted);padding:5px 11px;border-radius:7px;cursor:pointer}
.copy:hover{color:var(--text);border-color:var(--accent)}

.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:20px}
#q{flex:1;min-width:220px;padding:10px 14px;border:1px solid var(--border);border-radius:9px;
  background:var(--panel);color:var(--text);font-size:14px}
.toc{display:flex;flex-wrap:wrap;gap:6px}
.toc a{font-size:12.5px;text-decoration:none;color:var(--muted);border:1px solid var(--border);
  padding:4px 10px;border-radius:999px;background:var(--panel)}
.toc a:hover{color:var(--accent);border-color:var(--accent)}
.toc a span{opacity:.6}

.cat{margin-bottom:34px}
.cathead{margin-bottom:14px}
.cathead p{color:var(--muted);font-size:13.5px;margin:0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}
.tool{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);
  padding:17px 18px;display:flex;flex-direction:column}
.tool header{margin-bottom:9px}
.tool h4{margin:0 0 4px;font-size:14.5px;letter-spacing:-.01em}
.tname{font-size:12px;color:var(--accent);word-break:break-all}
.tdesc{font-size:13px;color:var(--muted);margin:0 0 12px;flex:1}
.params{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-direction:column;gap:7px}
.params li{font-size:12.5px;display:flex;flex-wrap:wrap;gap:6px;align-items:baseline}
.pname{font-size:12px}
.ptype{font-size:11px;color:var(--muted);background:var(--code);border:1px solid var(--border);
  padding:1px 6px;border-radius:5px}
.req{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--accent)}
.opt{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.pdesc{flex-basis:100%;color:var(--muted);font-size:12px;line-height:1.45}
.noargs{font-size:12.5px;color:var(--muted);margin:0 0 12px}
.try{align-self:flex-start;font-size:12.5px;background:none;border:1px solid var(--border);
  color:var(--muted);padding:5px 12px;border-radius:7px;cursor:pointer}
.try:hover{color:var(--accent);border-color:var(--accent)}

.reslist{list-style:none;padding:0;margin:0;display:grid;
  grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:8px}
.reslist li{background:var(--panel);border:1px solid var(--border);border-radius:8px;
  padding:10px 13px;font-size:12.5px;display:flex;flex-direction:column;gap:3px}
.reslist code{color:var(--accent);font-size:11.5px;word-break:break-all}
.reslist span{color:var(--muted)}
details.more summary{cursor:pointer;color:var(--muted);font-size:13px;margin-top:12px}

.console{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
.crow{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px}
.crow label{font-size:12px;color:var(--muted);display:flex;flex-direction:column;gap:5px;flex:1;min-width:200px}
select,textarea,input[type=password]{width:100%;padding:9px 12px;border:1px solid var(--border);
  border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;font-family:inherit}
textarea{font-family:ui-monospace,Menlo,Consolas,monospace;min-height:78px;resize:vertical}
#q:focus,select:focus,textarea:focus,input:focus{outline:2px solid var(--accent);outline-offset:-1px}
.run{background:var(--accent);color:var(--on-accent);border:none;padding:10px 20px;
  border-radius:8px;font-size:13.5px;font-weight:550;cursor:pointer}
.run:disabled{opacity:.55;cursor:default}
#out{margin-top:14px;max-height:420px;overflow:auto;white-space:pre-wrap;word-break:break-word}
#out.err{border-color:var(--accent)}

footer{padding:32px 0 48px;color:var(--muted);font-size:12.5px}
footer a{color:var(--muted)}
.hidden{display:none!important}
.empty{color:var(--muted);font-size:13.5px;padding:20px 0}
`;

/* ------------------------------------------------------------------ script */

function clientScript(config: Config, authRequired: boolean): string {
  return `
(function(){
  "use strict";
  var ENDPOINT = ${jsonForScript(config.path)};
  var AUTH = ${jsonForScript(authRequired)};

  document.querySelectorAll(".copy").forEach(function(btn){
    btn.addEventListener("click", function(){
      var el = document.getElementById(btn.dataset.copy);
      if (!el) return;
      navigator.clipboard.writeText(el.textContent).then(function(){
        var was = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function(){ btn.textContent = was; }, 1400);
      }).catch(function(){ btn.textContent = "Copy failed"; });
    });
  });

  var q = document.getElementById("q");
  var none = document.getElementById("noresults");
  q.addEventListener("input", function(){
    var term = q.value.trim().toLowerCase();
    var anyTool = false;
    document.querySelectorAll(".cat").forEach(function(cat){
      var shown = 0;
      cat.querySelectorAll(".tool").forEach(function(card){
        var hit = !term || (card.dataset.search || "").indexOf(term) !== -1;
        card.classList.toggle("hidden", !hit);
        if (hit) shown++;
      });
      cat.classList.toggle("hidden", shown === 0);
      if (shown) anyTool = true;
    });
    document.querySelectorAll(".reslist li").forEach(function(li){
      li.classList.toggle("hidden", !!term && (li.dataset.search || "").indexOf(term) === -1);
    });
    none.classList.toggle("hidden", anyTool);
  });

  var sel = document.getElementById("tool");
  var args = document.getElementById("args");
  var out = document.getElementById("out");
  var run = document.getElementById("run");
  var tokenEl = document.getElementById("token");

  document.querySelectorAll(".try").forEach(function(btn){
    btn.addEventListener("click", function(){
      sel.value = btn.dataset.tool;
      document.querySelector(".console").scrollIntoView({ behavior: "smooth", block: "center" });
      args.focus();
    });
  });

  // The endpoint answers as SSE ("event: message" / "data: {...}"), so read the
  // JSON out of the last data: line rather than assuming a plain JSON body.
  function parseBody(text, contentType){
    if (contentType.indexOf("text/event-stream") !== -1){
      var payload = null;
      text.split(/\\r?\\n/).forEach(function(line){
        if (line.indexOf("data:") === 0) payload = line.slice(5).trim();
      });
      if (payload === null) throw new Error("No data frame in the SSE response.");
      return JSON.parse(payload);
    }
    return JSON.parse(text);
  }

  function show(text, isError){
    out.textContent = text;
    out.classList.remove("hidden");
    out.classList.toggle("err", !!isError);
  }

  run.addEventListener("click", function(){
    var parsed;
    try {
      parsed = JSON.parse(args.value.trim() || "{}");
    } catch (e) {
      show("Arguments are not valid JSON:\\n" + e.message, true);
      return;
    }

    var headers = {
      "content-type": "application/json",
      "accept": "application/json, text/event-stream"
    };
    if (AUTH && tokenEl && tokenEl.value.trim()){
      headers.authorization = "Bearer " + tokenEl.value.trim();
    }

    run.disabled = true;
    show("Running " + sel.value + "\\u2026", false);

    fetch(ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: sel.value, arguments: parsed }
      })
    }).then(function(res){
      return res.text().then(function(text){
        return { status: res.status, type: res.headers.get("content-type") || "", text: text };
      });
    }).then(function(r){
      var body = parseBody(r.text, r.type);
      var content = body && body.result && body.result.content;
      if (content && content[0] && typeof content[0].text === "string"){
        show(content[0].text, !!body.result.isError);
      } else {
        show(JSON.stringify(body, null, 2), r.status >= 400);
      }
    }).catch(function(e){
      show("Request failed: " + e.message, true);
    }).finally(function(){
      run.disabled = false;
    });
  });
})();
`;
}

/* ------------------------------------------------------------------ render */

export function renderHomepage(config: Config): string {
  const groups = categorised();
  const refDocs = referenceResources();
  const resourceCount = siteResources.length + refDocs.length;
  const authRequired = config.authToken !== null;

  const stdioConfig = JSON.stringify(
    { mcpServers: { [SERVER_NAME]: { command: "npx", args: ["-y", "kanchanflow-mcp"] } } },
    null,
    2
  );
  const httpUrl = `http://localhost:${config.port}${config.path}`;

  const toc = groups
    .map(
      (g) =>
        `<a href="#cat-${esc(g.title.toLowerCase())}">${esc(g.title)} <span>${g.tools.length}</span></a>`
    )
    .join("");

  const toolSections = groups
    .map(
      (g) =>
        `<section class="cat" id="cat-${esc(g.title.toLowerCase())}">` +
        `<div class="cathead"><h3>${esc(g.title)}</h3><p>${esc(g.blurb)}</p></div>` +
        `<div class="grid">${g.tools.map(toolHtml).join("")}</div>` +
        `</section>`
    )
    .join("");

  const siteResHtml = siteResources
    .map(
      (r) =>
        `<li data-search="${esc(`${r.name} ${r.uri} ${r.description ?? ""}`.toLowerCase())}">` +
        `<code>${esc(r.uri)}</code><span>${esc(r.title ?? r.name)}</span></li>`
    )
    .join("");

  const refResHtml = refDocs
    .map(
      (r) =>
        `<li data-search="${esc(`${r.name} ${r.uri}`.toLowerCase())}">` +
        `<code>${esc(r.uri)}</code><span>${esc(r.title ?? r.name)}</span></li>`
    )
    .join("");

  const rateLimitLabel =
    config.rateLimitPerMinute === 0 ? "off" : `${esc(config.rateLimitPerMinute)}/min`;

  /*
   * The masthead. With the artwork synced this is the real lockup, which
   * already reads "Kanchan Flow", so the text beside it is only the "MCP"
   * qualifier. Without it — a checkout where `npm run sync` has not run — it
   * falls back to the typographic tile and the full name, so the header is
   * never empty and the page never links a broken image.
   */
  const brandHeader = brandAssetsAvailable()
    ? `<a class="brandlink" href="/" aria-label="${esc(SERVER_TITLE)} MCP server">` +
      `<img class="logo light" src="${LOGO_LIGHT_URL}" alt="${esc(SERVER_TITLE)}" width="1200" height="261" decoding="async">` +
      `<img class="logo dark" src="${LOGO_DARK_URL}" alt="" aria-hidden="true" width="1200" height="261" decoding="async">` +
      `</a>` +
      `<div class="brand withlogo">MCP server</div>`
    : `<div class="logomark">K</div>` +
      `<div class="brand">${esc(SERVER_TITLE)} <span>MCP</span></div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(SERVER_TITLE)} MCP Server</title>
<meta name="description" content="${esc(SERVER_DESCRIPTION.slice(0, 180))}">
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="${ICON_URL}">
<link rel="apple-touch-icon" href="${ICON_URL}">
<style>${STYLES}</style>
</head>
<body>

<header class="top">
  <div class="wrap topin">
    ${brandHeader}
    <div class="pill"><span class="dot"></span> running &middot; v${esc(SERVER_VERSION)}</div>
  </div>
</header>

<div class="wrap">

  <div class="hero">
    <h1>Model Context Protocol server for ${esc(SERVER_TITLE)}</h1>
    <p class="lede">${esc(SERVER_DESCRIPTION)}</p>
    <div class="badges">
      <span class="badge ro">Read-only</span>
      <span class="badge">No customer data</span>
      <span class="badge">stdio + Streamable HTTP</span>
      <span class="badge">${authRequired ? "Bearer token required" : "Open endpoint"}</span>
      <span class="badge">Rate limit ${rateLimitLabel}</span>
    </div>
    <div class="stats">
      <div class="stat"><b>${allTools.length}</b><span>Tools</span></div>
      <div class="stat"><b>${resourceCount}</b><span>Resources</span></div>
      <div class="stat"><b>${prompts.length}</b><span>Prompts</span></div>
      <div class="stat"><b>0</b><span>Write operations</span></div>
    </div>
  </div>

  <section class="block">
    <h2>Connect a client</h2>
    <p class="sub">Two transports, the same tools. stdio is the normal desktop setup; HTTP is for a hosted or shared endpoint.</p>
    <div class="cols">
      <div class="card">
        <h3>stdio &mdash; Claude Desktop</h3>
        <p>Add this to <code>claude_desktop_config.json</code>. The host spawns the process and speaks MCP over stdin/stdout.</p>
        <pre id="cfg-stdio">${esc(stdioConfig)}</pre>
        <button class="copy" type="button" data-copy="cfg-stdio">Copy</button>
      </div>
      <div class="card">
        <h3>Streamable HTTP</h3>
        <p>This endpoint, running now. ${
          authRequired
            ? "Send <code>Authorization: Bearer &lt;token&gt;</code> with every request."
            : "No token is configured, so the endpoint is open."
        }</p>
        <pre id="cfg-http">${esc(httpUrl)}</pre>
        <button class="copy" type="button" data-copy="cfg-http">Copy</button>
      </div>
    </div>
  </section>

  <section class="block">
    <h2>Try a tool</h2>
    <p class="sub">Calls this server over the live MCP endpoint at <code>${esc(config.path)}</code>. Every tool is read-only, so nothing here can change anything.</p>
    <div class="console">
      <div class="crow">
        <label>Tool
          <select id="tool">${allTools
            .map((t) => `<option value="${esc(t.name)}">${esc(t.name)}</option>`)
            .join("")}</select>
        </label>
        ${
          authRequired
            ? `<label>Bearer token<input type="password" id="token" placeholder="required by this server" autocomplete="off"></label>`
            : ""
        }
      </div>
      <div class="crow">
        <label>Arguments (JSON)
          <textarea id="args" spellcheck="false">{}</textarea>
        </label>
      </div>
      <button class="run" type="button" id="run">Run tool</button>
      <pre id="out" class="hidden"></pre>
    </div>
  </section>

  <section class="block">
    <h2>Tools</h2>
    <p class="sub">${allTools.length} read-only tools. Names follow <code>kanchanflow_&lt;action&gt;_&lt;resource&gt;</code>.</p>
    <div class="toolbar">
      <input id="q" type="search" placeholder="Filter tools, resources and prompts&hellip;" autocomplete="off">
      <div class="toc">${toc}</div>
    </div>
    <div id="cats">${toolSections}</div>
    <p class="empty hidden" id="noresults">No tools match that filter.</p>
  </section>

  <section class="block">
    <h2>Resources</h2>
    <p class="sub">${resourceCount} readable resources &mdash; ${siteResources.length} site collections and ${refDocs.length} reference documents, addressed by URI.</p>
    <ul class="reslist">${siteResHtml}</ul>
    <details class="more">
      <summary>Reference documents (${refDocs.length})</summary>
      <ul class="reslist" style="margin-top:12px">${refResHtml}</ul>
    </details>
  </section>

  <section class="block">
    <h2>Prompts</h2>
    <p class="sub">${prompts.length} operating procedures. Each one names the tools that hold the truth before it answers.</p>
    <div class="grid">${prompts.map(promptHtml).join("")}</div>
  </section>

  <footer>
    <p>${esc(SERVER_TITLE)} MCP ${esc(SERVER_VERSION)} &middot; Soor LLC &middot;
      <a href="/health">/health</a> &middot; <code>${esc(config.path)}</code></p>
    <p>Read-only over published content. Feature status is load-bearing: only <b>live</b> means the product does it today.</p>
  </footer>

</div>

<script>${clientScript(config, authRequired)}</script>
</body>
</html>`;
}

/* ------------------------------------------------------------------- cache */

let cached: { config: Config; html: string; etag: string } | null = null;

/** The rendered page plus its ETag, built once per config. */
export function homepage(config: Config): { html: string; etag: string } {
  if (!cached || cached.config !== config) {
    const html = renderHomepage(config);
    const etag = `"${createHash("sha256").update(html).digest("hex").slice(0, 32)}"`;
    cached = { config, html, etag };
  }
  return { html: cached.html, etag: cached.etag };
}
