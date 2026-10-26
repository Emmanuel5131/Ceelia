import { canVerifyOwnership, ownershipMessage } from '@celia/core';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as z from 'zod';
import {
  saveStatement,
  submitClaim,
  verifyClaimOwnership,
} from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { ClaimSteps } from '@/components/claims/ClaimSteps';
import { OwnershipCard } from '@/components/claims/OwnershipCard';
import { StatementCard } from '@/components/claims/StatementCard';
import { SubmitClaimCard } from '@/components/claims/SubmitClaimCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { countOthersOnPlatform, getClaim } from '@/libs/Claims';
import { claimSteps } from '@/utils/ClaimSteps';

type ClaimPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: ClaimPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ClaimPage' });

  return {
    title: t('meta_title_detail'),
    description: t('meta_description_detail'),
  };
}

export default async function ClaimPage(props: ClaimPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ClaimPage' });
  const { userId } = await auth();

  // A claim that is not yours looks the same as one that does not exist.
  const claim = z.uuid().safeParse(id).success && userId ? await getClaim(userId, id) : undefined;

  if (!claim) {
    notFound();
  }

  const { chain } = claim;
  const others = await countOthersOnPlatform(claim);
  const message = ownershipMessage({ chain, address: claim.walletAddress, nonce: claim.nonce });

  return (
    <>
      <PageHeader
        title={claim.platformName}
        description={`${claim.walletAddress.slice(0, 8)}…${claim.walletAddress.slice(-6)}`}
      />
      <div className="grid max-w-3xl gap-8">
        <Card>
          <CardContent className="grid gap-6">
            <ClaimSteps states={claimSteps(claim)} />
            <p className="text-sm text-ink-muted">
              {t('others', { count: others, platform: claim.platformName })}
            </p>
          </CardContent>
        </Card>
        <OwnershipCard
          message={message}
          signed={claim.ownership === 'signed'}
          canVerify={canVerifyOwnership(chain)}
          action={verifyClaimOwnership.bind(null, claim.id)}
        />
        <StatementCard statement={claim.statement} action={saveStatement.bind(null, claim.id)} />
        <SubmitClaimCard
          sent={claim.status === 'submitted'}
          action={submitClaim.bind(null, claim.id)}
        />
      </div>
    </>
  );
}
