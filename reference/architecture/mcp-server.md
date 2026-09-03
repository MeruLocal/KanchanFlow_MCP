# The MCP server

## Runtime

TypeScript compiled to ES2022 / NodeNext ESM, running on Node 20 or later.
Dependencies are deliberately two: the official `@modelcontextprotocol/sdk` and
`zod` for input schemas. Everything else is the Node standard library.

## Layout

```
kanchanflow-mcp/
├── data/site-mirror.json        generated — every fact the server serves
├── reference/                   this folder; loaded at runtime
├── scripts/sync-content.mjs     regenerates the mirror from the website repo
└── src/
    ├── index.ts                 entry point
    ├── server.ts                MCP assembly + stdio and HTTP transports
    ├── homepage.ts              the HTML page the HTTP transport serves at /
    ├── assets.ts                allowlisted brand artwork for that page
    ├── server-info.ts           advertised identity and client instructions
    ├── config.ts                environment configuration
    ├── errors.ts                the error vocabulary
    ├── data/
    │   ├── types.ts             types for the mirror
    │   └── mirror.ts            lazy load, cache, slug indexes, suggestions
    ├── reference/
    │   ├── types.ts
    │   ├── loader.ts            the only reader of reference/
    │   └── index.ts             process-wide loader instance
    ├── tools/
    │   ├── tool-types.ts        the ToolDefinition shape and shared helpers
    │   ├── index.ts             the registry, with convention checks
    │   ├── company.ts  features.ts  pricing.ts  integrations.ts
    │   ├── markets.ts  content.ts   partners.ts  site.ts
    │   └── search.ts   reference.ts
    ├── resources/index.ts       kanchanflow:// resources
    ├── prompts/index.ts         reusable prompts
    └── utils/
        ├── logger.ts            structured JSON logging to stderr
        ├── rate-limiter.ts      fixed-window limiter for the HTTP transport
        └── package-paths.ts     locating packaged files from src/ or dist/
```

## The tool pattern

A tool is data plus a handler:

```ts
export interface ToolDefinition<Args = Record<string, unknown>> {
  name: string;                 // kanchanflow_<action>_<resource>
  title: string;
  description: string;          // written for a model, not a changelog
  inputSchema: ZodRawShape;     // the SDK publishes this as JSON Schema
  handler: (args: Args) => unknown;
}
```

A handler returns the payload it wants wrapped in `{ success: true, data }`, or
throws a `ToolError`. It never formats MCP content and never catches its own
errors. `src/server.ts` does both, identically for every tool: it assigns a
request id, times the call, serialises the payload, logs the outcome, and turns
a thrown `ToolError` into a structured error envelope with `isError: true`.

Two consequences worth having:

- A tool file never imports the MCP SDK, so a unit test calls `handler` directly
  with a plain object and asserts on the returned data.
- Logging, error shaping and timing cannot drift between tools, because there is
  one copy of each.

`src/tools/index.ts` asserts at module load that every name matches
`kanchanflow_<action>_<resource>` and that no name repeats. A typo is a startup
failure rather than a silently shadowed tool.

## The mirror

`data/site-mirror.json` is read lazily on first use, parsed once, and cached for
the process lifetime, along with slug-keyed maps for features, integrations,
posts and glossary terms. A stdio session that only reads a reference document
never pays to parse it.

On a slug miss, `suggestSlugs()` returns the closest available slugs so the
`NOT_FOUND` payload tells the client what it probably meant.

## The reference loader

`src/reference/loader.ts` is the only code that reads this folder. It indexes
lazily, caches file bodies individually, serves only `.md` and `.json`, skips
anything over 512 KB, sorts deterministically, and confines every requested path
inside the reference root — checked by normalisation, by prefix, and finally by
`fs.realpathSync` so a symlink cannot point out of the tree.

A missing reference folder yields an empty index rather than a crash: the
content tools keep working.

## Transports

**stdio** (default) — the MCP host spawns the process and speaks MCP over
stdin/stdout. Logs go to stderr, because stdout is the protocol channel.

**Streamable HTTP** — a plain `node:http` server. It also serves a generated
homepage at `/` and the brand artwork that page references from a three-entry
allowlist; both are public, `GET`/`HEAD` only, and carry ETags. See
`api/endpoints.md`. Each request gets a fresh
`McpServer` and transport in stateless mode, so no state is shared between
callers and one session can never observe another. `/health` answers without a
token for orchestrators; everything else is served at the configured MCP path.

See `api/endpoints.md` and `mcp/security.md`.
