# KanchanFlow MCP server — HTTP transport image.
#
#   docker build -t kanchanflow-mcp .
#   docker run --rm -p 3010:3010 -e KANCHANFLOW_MCP_PUBLIC_URL=https://mcp.kanchanflow.com kanchanflow-mcp
#
# Behind reverse proxies that append X-Forwarded-For, also set
# KANCHANFLOW_MCP_TRUST_PROXY to the number of proxy hops (2 behind
# Cloudflare then Apache) so the rate limit is per visitor.

# ---- build ---------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---- runtime -------------------------------------------------------------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    KANCHANFLOW_MCP_TRANSPORT=http \
    HOST=0.0.0.0 \
    KANCHANFLOW_MCP_PORT=3010
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node data/site-mirror.json ./data/site-mirror.json
COPY --chown=node:node assets ./assets
COPY --chown=node:node reference ./reference
USER node
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${KANCHANFLOW_MCP_PORT:-3010}/health" >/dev/null || exit 1
CMD ["node", "dist/index.js"]
