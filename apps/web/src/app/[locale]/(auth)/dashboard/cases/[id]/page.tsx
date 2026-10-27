import { maxOpenCasesPerLawyer } from '@celia/core';
import { getJurisdiction } from '@celia/jurisdictions';
import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as z from 'zod';
import { ReportSummary } from '@/components/cases/ReportSummary';
import { TakeCaseDialog } from '@/components/cases/TakeCaseDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { StatCard } from '@/components/overview/StatCard';
import { StatusBadge } from '@/components/overview/StatusBadge';
import { evaluateTake, getCase, leadsCase } from '@/libs/Cases';
import { getLatestReport } from '@/libs/Reports';
import { parseAccount } from '@/utils/Account';
import { jurisdictionName } from '@/utils/JurisdictionName';
import { parseProfile } from '@/utils/Profile';

type CasePageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: CasePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CaseDetail' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function CasePage(props: CasePageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'CaseDetail' });
  const format = await getFormatter({ locale });
  const found = z.uuid().safeParse(id).success ? await getCase(id) : undefined;

  if (!found) {
    notFound();
  }

  const user = await currentUser();
  const account = parseAccount(user?.publicMetadata);
  const profile = parseProfile('counsel', user?.privateMetadata);
  const jurisdiction = getJurisdiction(found.jurisdiction);
  const isCounsel =
    user && account?.accountType === 'counsel' && profile?.accountType === 'counsel';

  // Ask as if the lawyer had confirmed conflicts: that is the one thing they do in the dialog, so what is left is why not.
  const decision = isCounsel
    ? await evaluateTake({
        userId: user.id,
        verified: account.review === 'verified',
        admittedIn: profile.jurisdictions,
        found,
        conflictsConfirmed: true,
      })
    : undefined;
  const yours = isCounsel && (await leadsCase(found.id, user.id));
  const report = found.hasReport ? await getLatestReport(found.id) : null;

  let team = t('team_open');

  if (found.status === 'counsel') {
    team = yours ? t('team_yours') : t('team_taken');
  }

  return (
    <>
      <PageHeader
        title={found.name}
        description={<span className="font-mono text-base">{found.number}</span>}
        actions={decision?.ok ? <TakeCaseDialog caseId={found.id} /> : null}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t('stat_jurisdiction')}
            value={jurisdiction ? jurisdictionName(jurisdiction) : found.jurisdiction}
          />
          <StatCard label={t('stat_claimants')} value={format.number(found.claimants)} />
          <StatCard
            label={t('stat_updated')}
            value={format.dateTime(new Date(found.updatedAt), { dateStyle: 'medium' })}
          />
        </div>
        <PageSection title={t('report_title')} description={t('report_description')}>
          {report ? (
            <ReportSummary report={report} />
          ) : (
            <p className="text-ink-muted">{t('report_none')}</p>
          )}
        </PageSection>
        <PageSection title={t('team_title')} description={t('team_description')}>
          <div className="flex flex-wrap items-center gap-4">
            <StatusBadge status={found.status} />
            <p className="text-sm text-ink-muted">{team}</p>
          </div>
          {decision && !decision.ok && (
            <p className="text-sm text-ink-muted">
              {t(`refusal_${decision.reason}`, { max: maxOpenCasesPerLawyer })}
            </p>
          )}
        </PageSection>
      </div>
    </>
  );
}
