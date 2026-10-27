'use client';

import { BellIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Link } from '@/libs/I18nNavigation';
import type { InboxItem } from '@/libs/Inbox';
import { markAllRead } from '@/libs/InboxActions';
import { notificationPath } from '@/utils/NotificationLink';

/**
 * The full list of a person's notifications as a timeline: a filled marker for unread, an outlined one for read, with each
 * heading linking to where it happened.
 * @param props - The list props.
 * @param props.items - The notifications, newest first.
 * @returns The list, or the empty state.
 */
export function NotificationsList(props: { items: InboxItem[] }) {
  const t = useTranslations('Notifications');
  const email = useTranslations('Email');
  const format = useFormatter();
  const [pending, startTransition] = React.useTransition();
  const unread = props.items.some((item) => !item.read);

  if (props.items.length === 0) {
    return (
      <Empty className="border border-border bg-surface">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BellIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{t('empty_page_title')}</EmptyTitle>
          <EmptyDescription>{t('empty_page_text')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-6">
      {unread && (
        <Button
          variant="outline"
          size="sm"
          className="justify-self-start"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await markAllRead();
            });
          }}
        >
          {t('mark_all')}
        </Button>
      )}
      <Timeline>
        {props.items.map((item) => (
          <TimelineItem key={item.id} marker={item.read ? 'hollow' : 'filled'}>
            <Link
              href={notificationPath(item.type, item.data)}
              className="font-medium underline-offset-4 focus-ring hover:underline"
            >
              {email(`${item.type}_heading`)}
            </Link>
            <p className="text-sm text-ink-muted">{email(`${item.type}_body`)}</p>
            <p className="text-xs text-ink-muted">
              {format.dateTime(new Date(item.createdAt), {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
