import { maxOpenCasesPerLawyer } from '@celia/core';
import { getJurisdiction } from '@celia/jurisdictions';
import { currentUser } from '@clerk/nextjs/server';
import { ArrowLeftIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as z from 'zod';
import { CaseClaimantsTable } from '@/components/cases/CaseClaimantsTable';
import type { ClaimantRow } from '@/components/cases/CaseClaimantsTable';
import { CaseDescription } from '@/components/cases/CaseDescription';
import { ReportedPattern } from '@/components/cases/ReportedPattern';
import { ReportSummary } from '@/components/cases/ReportSummary';
import { TakeCaseDialog } from '@/components/cases/TakeCaseDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { StatCard } from '@/components/overview/StatCard';
import { StatusBadge } from '@/components/overview/StatusBadge';
import { Button } from '@/components/ui/button';
import { canViewCaseClaims, listCaseClaims, reportedPattern } from '@/libs/CaseClaims';
import { evaluateTake, getCase, leadsCase } from '@/libs/Cases';
import type { CaseDetail } from '@/libs/Cases';
import { claimantNames } from '@/libs/ClaimantNames';
import { Link } from '@/libs/I18nNavigation';
import { getReport } from '@/libs/Reports';
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

/**
 * The claims in a case as table rows, with each person's name from Clerk or a numbered label when there is none.
 * @param caseId - The case id.
 * @param label - Makes the label for a person with no name, from their number.
 * @returns The rows.
 */
async function loadClaimants(caseId: string, label: (number: number) => string) {
  const claims = await listCaseClaims(caseId);
  const names = await claimantNames(claims.map((claim) => claim.userId));

  return claims.map((claim, index): ClaimantRow => ({
    id: claim.id,
    caseId,
    name: names.get(claim.userId) ?? label(index + 1),
    fraudType: claim.fraudType,
    chain: claim.chain,
    reference: claim.walletAddress ?? claim.txHash ?? '',
    amountLost: claim.amountLost,
    country: claim.country,
    ownership: claim.ownership,
    submittedAt: claim.submittedAt?.toISOString() ?? null,
  }));
}

/**
 * What this viewer may do with this case: whether a lawyer's firm could take it now (and if not, why), whether they lead it, and
 * whether they may read its claims. Claimants are shown to Celia staff and the firm that leads the case, never to anyone else.
 * @param found - The case.
 * @param user - The signed-in person.
 * @returns The decision for a lawyer, whether they lead the case, and whether claims are visible.
 */
async function loadViewer(found: CaseDetail, user: Awaited<ReturnType<typeof currentUser>>) {
  const account = parseAccount(user?.publicMetadata);
  const profile = parseProfile('counsel', user?.privateMetadata);
  const counsel =
    user && account?.accountType === 'counsel' && profile?.accountType === 'counsel'
      ? { id: user.id, verified: account.review === 'verified', admittedIn: profile.jurisdictions }
      : undefined;

  // Ask as if the lawyer had confirmed conflicts: that is the one thing they do in the dialog, so what is left is why not.
  const decision = counsel
    ? await evaluateTake({
        userId: counsel.id,
        verified: counsel.verified,
        admittedIn: counsel.admittedIn,
        found,
        conflictsConfirmed: true,
      })
    : undefined;
  const yours = counsel ? await leadsCase(found.id, counsel.id) : false;
  const canSeeClaims = user
    ? await canViewCaseClaims({ userId: user.id, staff: account?.staff === true }, found.id)
    : false;

  return { decision, yours, canSeeClaims };
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
  const { decision, yours, canSeeClaims } = await loadViewer(found, user);
  const jurisdiction = getJurisdiction(found.jurisdiction);
  const report = found.hasReport ? await getReport(found.id) : null;
  const reported = await reportedPattern(found.id);

  const claimants = canSeeClaims
    ? await loadClaimants(found.id, (number) => t('claimant_number', { number }))
    : [];

  let team = t('team_open');

  if (found.status === 'counsel') {
    team = yours ? t('team_yours') : t('team_taken');
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3 justify-self-start">
        <Link href="/dashboard/cases">
          <ArrowLeftIcon aria-hidden="true" />
          {t('back')}
        </Link>
      </Button>
      <PageHeader
        title={found.name}
        description={<span className="font-mono text-base">{found.number}</span>}
        actions={decision?.ok ? <TakeCaseDialog caseId={found.id} /> : null}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
        <CaseDescription description={found.description} headline={report?.snapshot.headline} />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t('stat_jurisdiction')}
            value={jurisdiction ? jurisdictionName(jurisdiction) : found.jurisdiction}
          />
          {canSeeClaims ? (
            <a href="#claimants" className="focus-ring hover:opacity-80">
              <StatCard label={t('stat_claimants')} value={format.number(found.claimants)} />
            </a>
          ) : (
            <StatCard label={t('stat_claimants')} value={format.number(found.claimants)} />
          )}
          <StatCard
            label={t('stat_updated')}
            value={format.dateTime(new Date(found.updatedAt), { dateStyle: 'medium' })}
          />
        </div>
        <ReportedPattern pattern={reported} />
        <PageSection title={t('report_title')} description={t('report_description')}>
          {report ? (
            <ReportSummary report={report} caseId={found.id} />
          ) : (
            <p className="text-ink-muted">{t('report_none')}</p>
          )}
        </PageSection>
        {canSeeClaims && (
          <div id="claimants" className="scroll-mt-24">
            <PageSection title={t('claimants_title')} description={t('claimants_description')}>
              <CaseClaimantsTable claims={claimants} />
            </PageSection>
          </div>
        )}
        {decision && (
          <PageSection title={t('team_title')} description={t('team_description')}>
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status={found.status} />
              <p className="text-sm text-ink-muted">{team}</p>
            </div>
            {!decision.ok && (
              <p className="text-sm text-ink-muted">
                {t(`refusal_${decision.reason}`, { max: maxOpenCasesPerLawyer })}
              </p>
            )}
          </PageSection>
        )}
      </div>
    </>
  );
}
