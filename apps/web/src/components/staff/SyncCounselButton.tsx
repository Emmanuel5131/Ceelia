'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { syncCounsel } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { Button } from '@/components/ui/button';

/**
 * Copies the lawyers in Clerk into our own table. Needed once, for lawyers who signed up before the table existed.
 * @returns The button.
 */
export function SyncCounselButton() {
  const t = useTranslations('Staff');
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await syncCounsel();
        });
      }}
    >
      {t('sync')}
    </Button>
  );
}
