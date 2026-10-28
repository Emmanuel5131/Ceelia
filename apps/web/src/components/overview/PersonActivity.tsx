import { getFormatter, getTranslations } from 'next-intl/server';
import { PageSection } from '@/components/layout/PageSection';
import { Card, CardContent } from '@/components/ui/card';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Link } from '@/libs/I18nNavigation';
import { listInbox } from '@/libs/notifications/Inbox';
import { notificationPath } from '@/utils/notifications/NotificationLink';

/**
 * What has happened to a person's claims, newest first: each notification they got, such as the claim being sent, the wallet being
 * confirmed or the claim being validated, linking to where it happened. Unread ones have a filled marker.
 * @param props - The activity props.
 * @param props.userId - The Clerk user id.
 * @returns The section.
 */
export async function PersonActivity(props: { userId: string }) {
  const t = await getTranslations('Overview');
  const notifications = await getTranslations('Notifications');
  const email = await getTranslations('Email');
  const format = await getFormatter();
  const items = await listInbox(props.userId, 8);

  return (
    <PageSection
      title={t('person_activity_title')}
      description={t('person_activity_text')}
      action={
        <Link
          href="/dashboard/notifications"
          className="text-sm font-medium text-ink underline underline-offset-4 focus-ring hover:text-ink-muted"
        >
          {notifications('view_all')}
        </Link>
      }
    >
      {items.length === 0 ? (
        <p className="text-ink-muted">{t('person_activity_empty')}</p>
      ) : (
        <Card>
          <CardContent>
            <Timeline>
              {items.map((item) => (
                <TimelineItem key={item.id} marker={item.read ? 'hollow' : 'filled'}>
                  <Link
                    href={notificationPath(item.type, item.data)}
                    className="font-medium underline-offset-4 focus-ring hover:underline"
                  >
                    {email(`${item.type}_heading`)}
                  </Link>
                  <p className="text-sm text-ink-muted">
                    {format.dateTime(new Date(item.createdAt), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      )}
    </PageSection>
  );
}
