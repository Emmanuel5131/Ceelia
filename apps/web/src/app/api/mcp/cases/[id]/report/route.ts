import { NextResponse } from 'next/server';
import * as z from 'zod';
import { getReport } from '@/libs/cases/Reports';
import { identifyMcpCaller } from '@/libs/mcp/McpCaller';

/**
 * The newest research report of a case for the MCP server: the findings with what is proven and what is not, the tests behind
 * them, and the hash and time it was saved. The report names no victim.
 * @param _request - The request (unused).
 * @param context - The route parameters.
 * @param context.params - The case id.
 * @returns The report, 401, or 404.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (!(await identifyMcpCaller())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const report = z.uuid().safeParse(id).success ? await getReport(id) : null;

  if (!report) {
    return new NextResponse('Not found', { status: 404 });
  }

  return NextResponse.json(report, { headers: { 'Cache-Control': 'private, no-store' } });
}
