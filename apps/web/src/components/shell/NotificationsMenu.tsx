'use client';

import { BellIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * The notifications button in the header. It opens an empty state for now: there is nothing to notify about until cases
 * and claims are connected, and a bell with a made-up count would say otherwise.
 * @returns The bell and its popover.
 */
export function NotificationsMenu() {
  const t = useTranslations('Notifications');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t('open_label')}>
          <BellIcon aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="border-b border-line-soft px-4 py-3 text-sm font-medium">{t('title')}</p>
        <div className="grid justify-items-center gap-2 px-6 py-8 text-center">
          <BellIcon className="size-6 text-ink-soft" aria-hidden="true" />
          <p className="text-base">{t('empty_title')}</p>
          <p className="text-sm text-ink-muted">{t('empty_description')}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
