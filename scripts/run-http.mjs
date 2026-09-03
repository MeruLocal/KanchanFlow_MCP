/**
 * Launch the server with the HTTP transport selected.
 *
 * This exists instead of an `--env-file=.env.http` flag because .gitignore
 * ignores `.env.*`, so that file could never be committed — a fresh clone
 * would have hit a hard ENOENT from Node before the server even started.
 * Setting the variable here keeps `npm run dev` working from a clean checkout
 * and on any shell, without adding a cross-env dependency.
 *
 *   node scripts/run-http.mjs ../dist/index.js     (built)
 *   tsx  scripts/run-http.mjs ../src/index.ts      (dev)
 *
 * An explicit KANCHANFLOW_MCP_TRANSPORT in the environment still wins, so
 * this is a default and not an override.
 */

process.env.KANCHANFLOW_MCP_TRANSPORT ??= "http";

const target = process.argv[2];
if (!target) {
  console.error("Usage: run-http.mjs <entry>   e.g. ../src/index.ts");
  process.exit(1);
}

await import(new URL(target, import.meta.url).href);
