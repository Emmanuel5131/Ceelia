import { NextResponse } from 'next/server';
import { listCases } from '@/libs/cases/Cases';
import { identifyMcpCaller } from '@/libs/mcp/McpCaller';

/**
 * The case bank for the MCP server: every case with its stage and counts. A summary only, as in the case bank itself, so nobody's
 * claim is in it.
 * @returns The cases, or 401.
 */
export async function GET() {
  if (!(await identifyMcpCaller())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.json(await listCases(), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
