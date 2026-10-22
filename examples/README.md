# Client configuration examples

The `https://mcp.kanchanflow.com/mcp` URL in these files is the intended public endpoint and works only once that host is deployed. Until then use the local stdio setup in `claude-desktop.json` after `npm run build`.

| File | Client |
|---|---|
| `claude-desktop.json` | Claude Desktop (local stdio) |
| `cursor-mcp.json` | Cursor `.cursor/mcp.json` (hosted URL) |
| `vscode-mcp.json` | VS Code `.vscode/mcp.json` (hosted URL) |

Claude Code: `claude mcp add --transport http kanchanflow https://mcp.kanchanflow.com/mcp`

Try first: ask the assistant "What is an RFQ and how does a machine shop handle one?" (calls `kanchanflow_get_buyer_guide`), then "What does KanchanFlow cost?" (calls `kanchanflow_get_pricing`).
