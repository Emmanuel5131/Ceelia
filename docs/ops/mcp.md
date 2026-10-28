# The Celia MCP server

`apps/mcp` lets an AI assistant review cases in the case bank. It is modelled on Sandworm's MCP server: a small standalone Node
server that is **stateless** (each request gets its own MCP server) and holds no data and no Clerk secret.

## How a request flows

1. The assistant calls `POST /mcp`. With no token it gets a `401` and a `WWW-Authenticate` header pointing at
   `/.well-known/oauth-protected-resource`, which names Clerk as the sign-in server. The assistant signs the person in with
   Clerk's OAuth and comes back with a token.
2. The MCP server asks the web app who the token belongs to (`GET /api/mcp/me`). The web app has Clerk check the OAuth token,
   then works out the role: `staff` (only if the person passes the same rules as the staff area), `counsel` or `person`.
3. The role chooses the tool set (`apps/mcp/src/tools/index.ts`). Each tool calls a route under `/api/mcp/*` with the same token.
   **The web app decides what the person may see on every request**, so the MCP server can never show more than the app does.

## Tools in this first version (read only)

| Tool | Route | Who |
|---|---|---|
| `list_cases` | `GET /api/mcp/cases` | staff, counsel, person |
| `get_case` | `GET /api/mcp/cases/:id` | staff, counsel, person |
| `get_report` | `GET /api/mcp/cases/:id/report` | staff, counsel, person |

They return the same summary the case bank shows: stage, victims and confirmed victims, where the victims are, the alleged
operators and the report. **No claim, name, wallet or statement is ever returned.**

## Setting it up

1. In the Clerk dashboard, turn on OAuth applications and **dynamic client registration** (assistants register themselves).
2. Copy `apps/mcp/.env.example` to `apps/mcp/.env`. `AUTH_SERVER_URL` is the Clerk Frontend API URL of the instance.
3. Run the web app, then `pnpm run dev:mcp`. Try it with `pnpm dlx @modelcontextprotocol/inspector` against
   `http://localhost:6790/mcp`.

This has not been run against a live Clerk instance yet. The first sign-in is the real test of steps 1 and 2.

## Adding a tool

Add a route under `apps/web/src/app/api/mcp/`, start it with `identifyMcpCaller()` and check the role it needs, then register the
tool in `apps/mcp/src/tools/` and add it to the right role in `toolSets`. A tool that changes anything must also write a
`staff_audit` row on the web side.
