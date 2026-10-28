import { getTranslations } from 'next-intl/server';
import { ReportedPattern } from '@/components/cases/ReportedPattern';
import { PageSection } from '@/components/layout/PageSection';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import type { ReportedPattern as Pattern } from '@/libs/cases/CaseClaims';
import type { Report } from '@/validations/ReportValidation';

/**
 * What may have happened, told in the order it happened: what claimants report, what the platform said beside what the chain
 * shows, and how far it reaches. A hollow marker is the claimants' own account; a filled one is what the chain shows. It closes
 * with the note that none of this is a finding of fraud. Without a report it falls back to the claimants' account alone.
 * @param props - The section props.
 * @param props.pattern - The most reported kind of loss, or null when there are too few claims to count.
 * @param props.report - The case's report, or null when it has none yet.
 * @returns The section, or nothing when there is nothing to tell.
 */
export async function CaseStory(props: { pattern: Pattern | null; report: Report | null }) {
  const t = await getTranslations('CaseStory');
  const note = await getTranslations('ReportedPattern');
  const { report } = props;
  const proven = report?.checks.filter((check) => check.result === 'proven').slice(0, 2) ?? [];
  const estimate = report?.estimate;

  if (!props.pattern && proven.length === 0 && !estimate && !report) {
    return null;
  }

  const told = props.pattern !== null || proven.length > 0 || estimate !== undefined;
  // A count lets the sentence say "1 wallet" or "2,040 wallets"; a figure the report gave in words is shown as written.
  const wallets = estimate && /^\d+$/u.test(estimate.wallets) ? Number(estimate.wallets) : null;
  let scale: string | null = null;

  if (estimate && wallets !== null) {
    scale = t('scale_count', { count: wallets, losses: estimate.losses });
  } else if (estimate) {
    scale = t('scale_text', { wallets: estimate.wallets, losses: estimate.losses });
  }

  return (
    <PageSection title={t('title')}>
      <div className="grid max-w-3xl gap-6 pl-6">
        {told ? (
          <Timeline>
            {props.pattern && (
              <TimelineItem marker="hollow">
                <p className="text-sm text-ink-muted">{t('claimants_label')}</p>
                <ReportedPattern pattern={props.pattern} bare />
              </TimelineItem>
            )}
            {proven.map((check) => (
              <TimelineItem key={check.claim} marker="filled">
                <p className="text-sm text-ink-muted">{t('platform_label')}</p>
                <p>{check.claim}</p>
                <p className="mt-3 text-sm text-ink-muted">{t('chain_label')}</p>
                <p>{check.evidence}</p>
              </TimelineItem>
            ))}
            {scale && (
              <TimelineItem marker="filled">
                <p className="text-sm text-ink-muted">{t('scale_label')}</p>
                <p>{scale}</p>
              </TimelineItem>
            )}
          </Timeline>
        ) : (
          <p>{report?.headline}</p>
        )}
        <p className="text-sm text-ink-muted">{note('note')}</p>
      </div>
    </PageSection>
  );
}
