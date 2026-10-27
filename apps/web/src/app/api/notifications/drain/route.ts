import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { drain } from '@/libs/MailQueue';
import { matchesSecret } from '@/utils/Secret';

// The scheduler may take up to a minute to send a batch.
export const maxDuration = 60;

/**
 * Sends the emails that are due. A scheduler calls this every minute with `Authorization: Bearer <CRON_SECRET>`, which is how
 * Vercel Cron sends it. The route is under `/api`, which the proxy skips, so it checks the secret itself and does nothing
 * when none is set.
 * @param request - The request.
 * @returns The counts of what was sent, or 401.
 */
export async function GET(request: Request) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /u, '') ?? null;

  if (!matchesSecret(bearer, Env.CRON_SECRET)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const result = await drain({ limit: 50 });

  logger.info(`Mail drain: ${JSON.stringify(result)}`);

  return NextResponse.json(result);
}
