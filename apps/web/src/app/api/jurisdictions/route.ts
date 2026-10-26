import { getRuleKind, searchJurisdictions } from '@celia/jurisdictions';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { JurisdictionSearchValidation } from '@/validations/JurisdictionValidation';

// The data is static, so answers can be cached for an hour.
const cacheControl = 'public, max-age=3600, stale-while-revalidate=86400';

/**
 * Searches every country, state, province and region by name, code or abbreviation.
 * Example: `/api/jurisdictions?q=new%20york&limit=5`.
 * @param request - The incoming request; `q` is required, `limit` (1 to 50) and `kind` (`country` or `subdivision`) are optional.
 * @returns The best matches first, each with the rule that applies there.
 */
export const GET = (request: Request) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parse = JurisdictionSearchValidation.safeParse(params);

  if (!parse.success) {
    return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
  }

  const results = searchJurisdictions(parse.data.q, {
    limit: parse.data.limit,
    kind: parse.data.kind,
  }).map((j) => ({
    ...j,
    rule: j.mode ? getRuleKind(j.mode) : null,
  }));

  return NextResponse.json({ results }, { headers: { 'Cache-Control': cacheControl } });
};
