import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import type { WebClient } from '../web.ts';
import { handle } from './shared.ts';

/**
 * The tools for reviewing cases in the case bank. They read what the case bank shows the caller and change nothing. A case is
 * summarised by its stage, its victims and confirmed victims, the jurisdictions its victims are in, the alleged operators and its
 * report. Nobody's claim is in it.
 * @param server - The MCP server.
 * @param web - Asks the Celia web app as the caller.
 */
export function registerCaseTools(server: McpServer, web: WebClient) {
  server.registerTool(
    'list_cases',
    {
      description:
        'List the cases in the case bank, with their stage (collecting claims, building evidence or enough evidence), victims and confirmed victims. Stages are decided by Celia. A case states what is alleged and proven, never that fraud happened.',
      inputSchema: {},
    },
    handle(async () => await web('/api/mcp/cases')),
  );

  server.registerTool(
    'get_case',
    {
      description:
        'Read one case: its stage, how many victims and where they are, who is alleged to have run the platform, and the headline of its report.',
      inputSchema: { caseId: z.uuid().describe('The case id from list_cases') },
    },
    handle(async ({ caseId }) => await web(`/api/mcp/cases/${caseId}`)),
  );

  server.registerTool(
    'get_report',
    {
      description:
        'Read the newest research report of a case: what the chain shows, with each finding marked proven or not proven, and the tests behind it. It names no victim.',
      inputSchema: { caseId: z.uuid().describe('The case id from list_cases') },
    },
    handle(async ({ caseId }) => await web(`/api/mcp/cases/${caseId}/report`)),
  );
}
