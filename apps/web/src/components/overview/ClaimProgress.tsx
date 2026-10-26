import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { sampleClaim } from '@/libs/OverviewSample';

const markers = { done: 'filled', current: 'dashed', todo: 'muted' } as const;

/**
 * A victim's claim, step by step. The marker carries the state: filled = done, dashed = the step you are on, muted = not yet.
 * @returns The claim progress card.
 */
export async function ClaimProgress() {
  const t = await getTranslations('Overview');
  const labels = [
    t('claim_step_wallet'),
    t('claim_step_video'),
    t('claim_step_ownership'),
    t('claim_step_pooled'),
    t('claim_step_counsel'),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('claim_title')}</CardTitle>
        <CardDescription>{t('claim_description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Timeline>
          {sampleClaim.steps.map((state, i) => (
            <TimelineItem key={labels[i]} marker={markers[state]}>
              <p className={state === 'todo' ? 'text-ink-muted' : undefined}>{labels[i]}</p>
            </TimelineItem>
          ))}
        </Timeline>
        <CardDescription>
          {t('claim_others', { count: sampleClaim.claimantsInCase })}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
