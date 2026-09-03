# API overview

This server's public surface is the Model Context Protocol. There is no REST
API here, no GraphQL and no bespoke JSON contract — a client speaks MCP over one
of two transports and gets tools, resources and prompts.

## Protocol

MCP over JSON-RPC 2.0, using the official `@modelcontextprotocol/sdk`. The
server declares three capabilities:

| Capability | What it offers |
|---|---|
| `tools` | 24 read-only query tools over the KanchanFlow content mirror and reference set |
| `resources` | Whole collections as JSON, plus every reference document as markdown |
| `prompts` | Five reusable procedures for answering KanchanFlow questions accurately |

Protocol version negotiation is handled by the SDK. This server pins no version
of its own.

## Transports

| Transport | Selected by | Use it for |
|---|---|---|
| stdio | default, or `KANCHANFLOW_MCP_TRANSPORT=stdio` | Desktop MCP hosts that spawn the process — Claude Desktop, Claude Code, IDE clients |
| Streamable HTTP | `KANCHANFLOW_MCP_TRANSPORT=http` | A hosted endpoint several clients share |

## Server identity

Sent in the initialize handshake:

- name `kanchanflow`
- title `KanchanFlow`
- version `1.0.0`

The handshake also carries client instructions (`src/server-info.ts`) covering
the three things that most often go wrong when an AI answers a KanchanFlow
question: start with `kanchanflow_search`, check feature status before calling
something available, and say the product does not publish it rather than filling
a gap from general CRM knowledge.

## Shape of every tool result

Success:

```json
{ "success": true, "data": { "...": "...", "source": { "syncedAt": "2026-09-03T09:57:50.537Z" } } }
```

Failure — returned as tool content with `isError: true`, never as a transport
error:

```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "...", "details": { "didYouMean": ["..."] } } }
```

`api/errors.md` has the full code list.

## What this API does not do

- It does not write. There is no create, update, delete, publish or execute tool.
- It does not reach a customer's KanchanFlow workspace. There is no such
  integration, and no tool implies one.
- It does not call out to the network at request time. Every answer comes from
  the packaged mirror and reference folder.
- It does not submit the website's forms. Those endpoints are not built.
