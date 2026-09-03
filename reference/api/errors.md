# Errors

## Contract

A tool never throws at the transport. It returns MCP content with
`isError: true` and a body of:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "No KanchanFlow feature with slug \"quote-buildr\".",
    "details": { "didYouMean": ["quote-editor", "quote-revision-diff"] }
  }
}
```

`code` is machine-readable and stable. `message` is written for a model and is
safe to show a user. `details` is optional and carries whatever helps the caller
recover — close slugs on a miss, the supported values on a bad enum, the
available group names on an unknown matrix group.

## Codes

| Code | Means | Typical cause here |
|---|---|---|
| `NOT_FOUND` | The thing asked for does not exist | Unknown feature, integration, post, glossary or reference path; unknown matrix group |
| `VALIDATION_ERROR` | The arguments were understood but unusable | Country outside the seven display markets, seat count under a plan minimum, malformed date, a reference path trying to leave the folder |
| `UNAUTHORIZED` | No valid bearer token | HTTP transport with `KANCHANFLOW_MCP_AUTH_TOKEN` set |
| `RATE_LIMITED` | Too many requests in the window | HTTP transport over its per-minute allowance |
| `INTERNAL_ERROR` | An unmodelled failure | A bug, or a missing / corrupt content mirror |
| `FORBIDDEN` | Authenticated but not permitted | Defined, unused — no tool is gated today |
| `CONFLICT` | Conflicting state | Defined, unused — the server is read-only |

`FORBIDDEN` and `CONFLICT` exist so a future write path does not have to invent a
vocabulary. Nothing returns them now.

## Recovery, by code

- **NOT_FOUND** — read `details.didYouMean` and retry with one of those slugs, or
  run `kanchanflow_search` for the user's original wording. Do not answer from
  general knowledge as though it were a KanchanFlow fact.
- **VALIDATION_ERROR** — `details` names the supported values. Fix and retry.
- **RATE_LIMITED** — honour `Retry-After`.
- **INTERNAL_ERROR** — do not retry in a loop. The generic message is
  deliberate: the real one is logged server-side and withheld because it can
  carry a filesystem path.

## Empty results are not errors

A search that matches nothing returns `success: true` with `total: 0` and a note.
That is an answer: KanchanFlow publishes nothing on that term, and saying so is
correct. Treating it as a failure and improvising is the thing to avoid.
