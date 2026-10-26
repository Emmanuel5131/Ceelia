'use client';

import { SignOutButton } from '@clerk/nextjs';
import { SignOutIcon } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { getI18nPath } from '@/utils/Helpers';

/**
 * Signs the person out and returns them to the sign-in page. Red, because it ends the session.
 * @returns The sign-out button.
 */
export function SignOutAction() {
  const t = useTranslations('AppShell');
  const locale = useLocale();

  return (
    <SignOutButton redirectUrl={getI18nPath('/sign-in', locale)}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t('sign_out')}
        className="text-seal-on-dark hover:bg-sidebar-accent hover:text-seal-on-dark focus-visible:outline-sidebar-ring"
      >
        <SignOutIcon aria-hidden="true" />
      </Button>
    </SignOutButton>
  );
}
