import { getJurisdiction, getRuleKind } from '@celia/jurisdictions';
import { NextResponse } from 'next/server';

/**
 * Returns one jurisdiction and the rule that applies there.
 * Example: `/api/jurisdictions/us-ny`, `/api/jurisdictions/ng`.
 * @param _request - The incoming request, unused.
 * @param context - The route context; `params.id` is a lowercase ISO 3166 code such as `ng` or `us-ny`.
 * @returns The jurisdiction with its rule, or a 404 when the id is unknown.
 */
export const GET = async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const jurisdiction = getJurisdiction(id);

  if (!jurisdiction) {
    return NextResponse.json({ error: 'Jurisdiction not found' }, { status: 404 });
  }

  return NextResponse.json(
    { ...jurisdiction, rule: jurisdiction.mode ? getRuleKind(jurisdiction.mode) : null },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } },
  );
};
