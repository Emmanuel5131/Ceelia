import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { ActivityFeed } from '@/components/overview/ActivityFeed';
import { CaseDataTable } from '@/components/overview/CaseDataTable';
import { PersonOverview } from '@/components/overview/PersonOverview';
import { SampleNotice } from '@/components/overview/SampleNotice';
import { StatCard } from '@/components/overview/StatCard';
import { Button } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';
import { sampleActivity, sampleCases, sampleStats } from '@/libs/OverviewSample';
import type { AccountType } from '@/utils/Account';

// Sealed cases are ready for counsel, then cases still being built, then cases still collecting claims.
const priority = { sealed: 0, building: 1, collecting: 2, counsel: 3 } as const;

/**
 * The overview: what needs the person's attention today. Lawyers, researchers and analysts get headline numbers, the cases that
 * need them and recent activity; a victim gets the progress of their claim.
 * @param props - The content props.
 * @param props.accountType - The signed-in person's account type: a person sees their claim, counsel see the case bank numbers.
 * @param props.userId - The Clerk user id, to find their claims.
 * @param props.firstName - Their first name, for the greeting.
 * @returns The overview page content.
 */
export async function OverviewContent(props: {
  accountType: AccountType;
  userId: string;
  firstName?: string | null;
}) {
  const t = await getTranslations('Overview');
  const s = sampleStats;

  const attention = sampleCases
    .filter((c) => c.status !== 'counsel')
    .toSorted(
      (a, b) => priority[a.status] - priority[b.status] || b.updatedAt.localeCompare(a.updatedAt),
    )
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={props.firstName ? t('greeting', { name: props.firstName }) : t('greeting_anonymous')}
        description={props.accountType === 'person' ? t('subtitle_person') : t('subtitle')}
        actions={
          props.accountType === 'person' ? null : (
            <Button asChild size="lg">
              <Link href="/dashboard/cases">{t('primary_action')}</Link>
            </Button>
          )
        }
      />
      {props.accountType === 'person' ? null : <SampleNotice />}

      {props.accountType === 'person' ? (
        <PersonOverview userId={props.userId} />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t('stat_new_cases')}
              value={String(s.newCases)}
              hint={t('stat_new_cases_hint', { count: s.newThisWeek })}
            />
            <StatCard
              label={t('stat_open_cases')}
              value={String(s.openCases)}
              hint={t('stat_open_cases_hint', { count: s.needResponse })}
            />
            <StatCard
              label={t('stat_claimants')}
              value={String(s.waitingClaimants)}
              hint={t('stat_claimants_hint', { count: s.acrossCases })}
            />
            <StatCard
              label={t('stat_sealed')}
              value={String(s.sealedFiles)}
              hint={t('stat_sealed_hint', { count: s.sealedThisMonth })}
            />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <PageSection
              title={t('attention_title')}
              description={t('attention_description')}
              action={
                <Link
                  href="/dashboard/cases"
                  className="text-sm font-medium text-ink underline underline-offset-4 focus-ring hover:text-ink-muted"
                >
                  {t('view_all')}
                </Link>
              }
            >
              <CaseDataTable cases={attention} variant="compact" />
            </PageSection>
            <PageSection title={t('activity_title')}>
              <ActivityFeed items={sampleActivity} />
            </PageSection>
          </div>
        </div>
      )}
    </>
  );
}
