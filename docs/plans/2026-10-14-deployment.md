# Plan: container image, registry manifest and a single version source

- **Severity:** P2
- **Effort:** S
- **Status:** plan only. Implementation follows after approval.

## Finding

1. **No container definition.** There is no Dockerfile, so the HTTP endpoint (`mcp.kanchanflow.com`) has no reproducible, non-root build.
2. **No registry manifest.** There is no `server.json`, so the server cannot be listed in the MCP Registry, and nothing advertises the remote endpoint.
3. **Version is hard-coded.** `SERVER_VERSION` is `"1.0.0"` in src/server-info.ts:12. It is used in the initialize handshake, `/health` and the homepage, and package.json carries its own copy. The two will drift on the first release.

**Audit baseline** (local :3010, path `/mcp`): 3 fail · 3 warn · 11 pass.
- Two of the FAILs, `GET /version` and `/.well-known/mcp.json`, are checks written for another server and are not part of this server's contract. Adding them is optional and out of scope here.

**Not checked:**
- whether `mcp.kanchanflow.com` resolves or is deployed
- registry namespace ownership

## Proposed fix

1. **`Dockerfile`, multi-stage:**
   - **build stage** (`node:22-alpine`): `npm ci`, `npm run build`, `npm prune --omit=dev`.
   - **runtime stage** (`node:22-alpine`):
     - copy `dist`, `node_modules`, `data/site-mirror.json`, `assets`, `reference`, `package.json`
     - `ENV NODE_ENV=production KANCHANFLOW_MCP_TRANSPORT=http HOST=0.0.0.0 KANCHANFLOW_MCP_PORT=3010`
     - `USER node`, `EXPOSE 3010`
     - `HEALTHCHECK` using `wget -qO- http://127.0.0.1:3010/health`, or a node one-liner, since alpine has busybox wget
     - `CMD ["node","dist/index.js"]`
2. **`.dockerignore`:** node_modules, dist, coverage, .git, .env*.
3. **`server.json`:**
   - Schema `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`.
   - Name: `com.kanchanflow/mcp`. This is a DNS namespace and needs a TXT record on kanchanflow.com. A GitHub namespace would publish the GitHub org name, which conflicts with brand isolation.
   - Description. Leave out `repository` unless the founder decides otherwise; see below.
   - `websiteUrl` `https://kanchanflow.com`.
   - `version` equal to the package.json version.
   - `packages[0]`: npm `kanchanflow-mcp`, stdio transport, with optional env vars documented.
   - `remotes`: `[{ "type": "streamable-http", "url": "https://mcp.kanchanflow.com/mcp" }]`.
   - The text must not name any brand other than KanchanFlow/Soor LLC.
4. **Version source.** In `src/server-info.ts`, read `version` from `packagePath("package.json")` at module load, through the existing src/utils/package-paths.ts helper (works from src/ and dist/). Fall back to `"0.0.0"` if it cannot be read.
5. **Version-parity check.** Add `scripts/check-versions.mjs`, which asserts that the package.json version equals the `server.json` `version` and `packages[0].version`. Wire it into `npm run verify`.

## Tests to add

- `SERVER_VERSION` equals the package.json version.
- `server.json`:
  - parses
  - its `version` and `packages[0].version` equal package.json's
  - `remotes[0].url` equals `https://mcp.kanchanflow.com/mcp`
  - it contains no forbidden brand strings
- Docker: a CI job (optional) that builds the image and curls `/health` from the running container. The build was not run in the sandbox.

## Risks, rollout and founder decisions

- **Depends on the HTTP-hardening plan.** The bind address is loopback by default in that plan, so `HOST=0.0.0.0` in the image is required.
- **Founder decision: registry namespace and publish.** `server.json` is public, so the registry `name` and `repository.url` must not reveal a non-KanchanFlow org. Choose one:
  - (a) DNS namespace `com.kanchanflow/*` and no repository field (recommended)
  - (b) move the repo to a KanchanFlow/Soor-named GitHub org first
  - (c) accept the org name

  The same applies to package.json `repository`, if one is added. Publishing to the MCP Registry and npm is a separate step after that.
- **Author.** The author stays "Soor LLC".
