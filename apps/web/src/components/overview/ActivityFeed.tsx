'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Link } from '@/libs/I18nNavigation';
import type { ActivityItem, ActivityKind } from '@/utils/OverviewStats';

/**
 * The recent activity log: what happened, to which case and when, each line linking to its case. A sealed item gets a filled
 * marker, everything else a hollow one. Hashes are mono because they are evidence data.
 * @param props - The feed props.
 * @param props.items - The activity entries, newest first.
 * @returns The feed, or a line saying there is nothing yet.
 */
export function ActivityFeed(props: { items: ActivityItem[] }) {
  const t = useTranslations('Overview');
  const format = useFormatter();

  if (props.items.length === 0) {
    return <p className="text-ink-muted">{t('activity_empty')}</p>;
  }

  const text = (item: ActivityItem) => {
    const values = { case: item.case, count: item.count ?? 0 };
    const messages: Record<ActivityKind, string> = {
      case_opened: t('activity_case_opened', values),
      claims_added: t('activity_claims_added', values),
      report_saved: t('activity_report_saved', values),
      evidence_sealed: t('activity_evidence_sealed', values),
      case_taken: t('activity_case_taken', values),
    };

    return messages[item.kind];
  };

  return (
    <Card>
      <CardContent>
        <Timeline>
          {props.items.map((item) => (
            <TimelineItem
              key={item.id}
              marker={item.kind === 'evidence_sealed' ? 'filled' : 'hollow'}
            >
              <Link
                href={`/dashboard/cases/${item.caseId}`}
                className="underline-offset-4 focus-ring hover:underline"
              >
                {text(item)}
              </Link>
              <p className="text-sm text-ink-muted">
                {format.dateTime(new Date(item.at), { dateStyle: 'medium', timeStyle: 'short' })}
                {item.hash && <span className="ml-3 font-mono text-xs">{item.hash}</span>}
              </p>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
