'use client';

import { BellIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from '@/libs/I18nNavigation';
import type { InboxItem } from '@/libs/notifications/Inbox';
import { markAllRead } from '@/libs/notifications/InboxActions';
import { notificationPath } from '@/utils/notifications/NotificationLink';

/**
 * The notifications button in the header: a count of unread ones, and the latest few in a popover, each linking to where it
 * happened. They are marked read when the popover closes, so the unread dots are still there while the person looks.
 * @param props - The menu props.
 * @param props.items - The latest notifications.
 * @param props.unread - How many are unread.
 * @returns The bell and its popover.
 */
export function NotificationsMenu(props: { items: InboxItem[]; unread: number }) {
  const t = useTranslations('Notifications');
  const email = useTranslations('Email');
  const format = useFormatter();
  const [, startTransition] = React.useTransition();

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open && props.unread > 0) {
          startTransition(async () => {
            await markAllRead();
          });
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t('open_label')} className="relative">
          <BellIcon aria-hidden="true" />
          {props.unread > 0 && (
            <span className="absolute top-0 right-0 min-w-4 bg-seal px-1 text-[10px] leading-4 font-bold text-on-ink tabular-nums">
              <span aria-hidden="true">{props.unread > 9 ? '9+' : props.unread}</span>
              <span className="sr-only">{t('unread', { count: props.unread })}</span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-w-[calc(100vw-2rem)]">
        <p className="border-b border-line-soft px-4 py-3 text-sm font-medium">{t('title')}</p>
        {props.items.length === 0 ? (
          <div className="grid justify-items-center gap-2 px-6 py-8 text-center">
            <BellIcon className="size-6 text-ink-soft" aria-hidden="true" />
            <p className="text-base">{t('empty_title')}</p>
            <p className="text-sm text-ink-muted">{t('empty_description')}</p>
          </div>
        ) : (
          <>
            <ul>
              {props.items.map((item) => (
                <li key={item.id} className="border-b border-line-soft last:border-b-0">
                  <Link
                    href={notificationPath(item.type, item.data)}
                    className="grid gap-1 px-4 py-3 focus-ring hover:bg-paper"
                  >
                    <span className="flex items-start gap-2 text-sm font-medium">
                      {!item.read && (
                        <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 bg-seal" />
                      )}
                      {email(`${item.type}_heading`)}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {format.dateTime(new Date(item.createdAt), { dateStyle: 'medium' })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/notifications"
              className="block border-t border-line-soft px-4 py-3 text-sm font-medium underline underline-offset-4 focus-ring hover:text-ink-muted"
            >
              {t('view_all')}
            </Link>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
