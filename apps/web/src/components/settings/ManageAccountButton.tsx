'use client';

import { useClerk } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

/**
 * Opens Clerk's account modal, where the person manages their login, security and profile or deletes their account.
 * @returns The button.
 */
export function ManageAccountButton() {
  const t = useTranslations('Settings');
  const clerk = useClerk();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        clerk.openUserProfile();
      }}
    >
      {t('account_action')}
    </Button>
  );
}
