import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';
import { setEmailPreference } from '@/libs/notifications/Preferences';
import { getBaseUrl } from '@/utils/Helpers';
import { verifyUnsubscribe } from '@/utils/notifications/Unsubscribe';

/**
 * One-click unsubscribe (RFC 8058): the mail app sends a POST to the link in the `List-Unsubscribe` header and the person does
 * nothing else. It needs no sign-in, because the signed token names the person and the category.
 * @param request - The request, with `token` in the query string.
 * @returns 200 when done, 400 when the token is not valid.
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const claim = Env.UNSUBSCRIBE_SECRET ? verifyUnsubscribe(Env.UNSUBSCRIBE_SECRET, token) : null;

  if (!claim) {
    return new NextResponse('Invalid link', { status: 400 });
  }

  await setEmailPreference(claim.userId, claim.category, false);

  return new NextResponse('Unsubscribed', { status: 200 });
}

/**
 * The link people click in the footer. It never unsubscribes by itself, because mail scanners open links to check them and
 * would unsubscribe everyone; it sends the person to a page where they confirm.
 * @param request - The request, with `token` in the query string.
 * @returns A redirect to the confirmation page.
 */
export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';

  return NextResponse.redirect(`${getBaseUrl()}/unsubscribe?token=${encodeURIComponent(token)}`);
}
