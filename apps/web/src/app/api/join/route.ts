import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';
import { routing } from '@/libs/I18nRouting';
import { intentCookie } from '@/utils/accounts/Intent';
import { getI18nPath } from '@/utils/Helpers';

/**
 * Starts an application from the join page: it remembers that the person came to apply as a professional, then sends them to
 * create their account. A cookie carries the intent because it survives every step of Clerk's sign-up, which a query string may
 * not. The onboarding page reads it and opens on the professional application.
 * @param request - The request, with the page language as `locale`.
 * @returns A redirect to sign-up.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const asked = url.searchParams.get('locale');
  const locale = routing.locales.find((candidate) => candidate === asked) ?? routing.defaultLocale;
  const response = NextResponse.redirect(new URL(getI18nPath('/sign-up', locale), url));

  response.cookies.set(intentCookie, 'professional', {
    httpOnly: true,
    sameSite: 'lax',
    secure: Env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  });

  return response;
}
