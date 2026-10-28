import { NextResponse } from 'next/server';
import * as z from 'zod';
import { getCase, listAffectedCountries } from '@/libs/cases/Cases';
import { getReport } from '@/libs/cases/Reports';
import { identifyMcpCaller } from '@/libs/mcp/McpCaller';

/**
 * One case for the MCP server: its summary, where its victims are as counts, who is alleged to have run the platform, and the
 * headline of its report. The platform key stays here, and no claim is in it.
 * @param _request - The request (unused).
 * @param context - The route parameters.
 * @param context.params - The case id.
 * @returns The case, 401, or 404.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (!(await identifyMcpCaller())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const found = z.uuid().safeParse(id).success ? await getCase(id) : undefined;

  if (!found) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { platformKey: _platformKey, ...summary } = found;
  const [affected, report] = await Promise.all([
    listAffectedCountries(found.id),
    found.hasReport ? getReport(found.id) : null,
  ]);

  return NextResponse.json(
    { ...summary, victimsByCountry: affected, reportHeadline: report?.snapshot.headline ?? null },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
