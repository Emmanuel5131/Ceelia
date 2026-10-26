'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import type { ActivityKind, SampleActivity } from '@/libs/OverviewSample';

/**
 * The recent activity log: what happened, to which case and when. A sealed item gets a filled marker, everything else a
 * hollow one. Hashes are mono because they are evidence data.
 * @param props - The feed props.
 * @param props.items - The activity entries, newest first.
 * @returns The feed.
 */
export function ActivityFeed(props: { items: SampleActivity[] }) {
  const t = useTranslations('Overview');
  const format = useFormatter();

  const text = (item: SampleActivity) => {
    const values = { case: item.case, count: item.count ?? 0 };
    const messages: Record<ActivityKind, string> = {
      claims_added: t('activity_claims_added', values),
      evidence_sealed: t('activity_evidence_sealed', values),
      case_taken: t('activity_case_taken', values),
      method_reviewed: t('activity_method_reviewed', values),
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
              <p>{text(item)}</p>
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
