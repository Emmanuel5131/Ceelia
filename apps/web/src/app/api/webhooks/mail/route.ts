import { NextResponse } from 'next/server';
import * as z from 'zod';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { suppress } from '@/libs/notifications/Suppression';
import { matchesSecret } from '@/utils/Secret';

/**
 * The events Celia acts on, in our own shape. The mail server's own payload is translated into this at the edge (see
 * docs/ops/mail.md), so nothing else in the app depends on which mail server runs.
 */
const MailEventValidation = z.object({
  type: z.enum(['hard_bounce', 'complaint']),
  email: z.email(),
});

/**
 * Receives bounce and complaint reports from the mail server and stops mail to those addresses. The route is under `/api`,
 * which the proxy skips, so it checks the shared secret itself and does nothing when none is set.
 * @param request - The request, with `Authorization: Bearer <MAIL_WEBHOOK_SECRET>` and a JSON body.
 * @returns 204 when recorded, 401 for a wrong secret, 422 for a body we do not understand.
 */
export async function POST(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /u, '') ?? null;

  if (!matchesSecret(bearer, Env.MAIL_WEBHOOK_SECRET)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const parsed = MailEventValidation.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(z.treeifyError(parsed.error), { status: 422 });
  }

  await suppress(parsed.data.email, parsed.data.type === 'complaint' ? 'complaint' : 'bounce');
  logger.info(`Mail ${parsed.data.type} recorded`);

  return new NextResponse(null, { status: 204 });
}
