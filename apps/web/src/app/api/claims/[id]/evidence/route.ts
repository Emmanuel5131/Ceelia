import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { buildClaimEvidence } from '@/libs/claims/ClaimEvidence';
import { getClaim } from '@/libs/claims/Claims';
import { renderEvidenceHtml } from '@/utils/claims/EvidenceRecord';

const query = z.object({
  format: z.enum(['html', 'json']).default('html'),
  download: z.enum(['1']).optional(),
});

/**
 * Gives the person their own evidence record for a claim, as a page to read, print or save, or as JSON. Only the person can have
 * it: the route is under `/api`, which the proxy skips, so it checks who is asking itself, and a claim that is not theirs looks
 * the same as one that does not exist.
 * @param request - The request.
 * @param context - The route parameters.
 * @param context.params - The claim id.
 * @returns The record, or 404.
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await context.params;
  const options = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  const claim = userId && z.uuid().safeParse(id).success ? await getClaim(userId, id) : undefined;

  if (!claim || !options.success) {
    return new NextResponse('Not found', { status: 404 });
  }

  const record = await buildClaimEvidence(claim, new Date());
  const json = options.data.format === 'json';
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    ...(options.data.download && {
      'Content-Disposition': `attachment; filename="celia-evidence-${claim.id}.${json ? 'json' : 'html'}"`,
    }),
  };

  if (json) {
    return NextResponse.json(record, { headers });
  }

  return new NextResponse(renderEvidenceHtml(record), {
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
  });
}
