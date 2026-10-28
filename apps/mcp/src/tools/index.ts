import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Caller, Role } from '../auth.ts';
import { createWebClient } from '../web.ts';
import { registerCaseTools } from './cases.ts';

/**
 * Which tools each kind of caller gets. A role is a floor, not the check: the web app decides again on every request, so a tool
 * missing here is never reachable and a tool listed here never shows more than the caller may see. Add a tool set for a role here
 * when it exists, for example staff tools that act on the review queue.
 */
const toolSets: Record<Role, ((server: McpServer, web: ReturnType<typeof createWebClient>) => void)[]> = {
  staff: [registerCaseTools],
  counsel: [registerCaseTools],
  person: [registerCaseTools],
};

/**
 * Registers the tools the caller's role gets.
 * @param server - The MCP server for this request.
 * @param options - Who is calling and where the web app is.
 * @param options.caller - Who is calling.
 * @param options.webUrl - The Celia web app.
 */
export function registerTools(server: McpServer, options: { caller: Caller; webUrl: string }) {
  const web = createWebClient(options.webUrl, options.caller);

  for (const register of toolSets[options.caller.role]) {
    register(server, web);
  }
}
