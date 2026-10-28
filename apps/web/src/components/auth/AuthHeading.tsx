'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/libs/I18nNavigation';

/**
 * The title and one sentence at the top of the auth form. The link to the other page ("Don't have an account?") is
 * Clerk's own footer action under the form, which is the standard place for it.
 * @returns The heading for the current auth page.
 */
export function AuthHeading() {
  const t = useTranslations('AuthShell');
  const isSignUp = usePathname().startsWith('/sign-up');

  return (
    <header className="grid gap-2">
      <h2 className="text-2xl">{isSignUp ? t('sign_up_title') : t('sign_in_title')}</h2>
      <p className="text-base text-ink-muted">{isSignUp ? t('sign_up_text') : t('sign_in_text')}</p>
    </header>
  );
}
