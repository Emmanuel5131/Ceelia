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
import { ClaimMeta, OperatorName } from '@/components/claims/ClaimMeta';
import { ClaimSteps } from '@/components/claims/ClaimSteps';
import { OwnershipCard } from '@/components/claims/OwnershipCard';
import { StatementCard } from '@/components/claims/StatementCard';
import { SubmitClaimCard } from '@/components/claims/SubmitClaimCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { countOthersOnOperator, getClaim } from '@/libs/Claims';
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
  const others = await countOthersOnOperator(claim);
  const canSign = claim.paymentMethod === 'wallet' && claim.walletAddress !== null;
  const message = canSign
    ? ownershipMessage({ chain, address: claim.walletAddress ?? '', nonce: claim.nonce })
    : '';

  return (
    <>
      <PageHeader
        title={<OperatorName name={claim.platformName} />}
        description={<ClaimMeta claim={claim} />}
      />
      <div className="grid max-w-3xl gap-8">
        <Card>
          <CardContent className="grid gap-6">
            <ClaimSteps states={claimSteps(claim)} signed={canSign} />
            <p className="text-sm text-ink-muted">
              {claim.platformName
                ? t('others', { count: others, platform: claim.platformName })
                : t('others_unnamed', { count: others })}
            </p>
          </CardContent>
        </Card>
        {canSign && (
          <OwnershipCard
            message={message}
            signed={claim.ownership === 'signed'}
            canVerify={canVerifyOwnership(chain)}
            action={verifyClaimOwnership.bind(null, claim.id)}
          />
        )}
        <StatementCard
          statement={claim.statement}
          fraudType={claim.fraudType}
          action={saveStatement.bind(null, claim.id)}
        />
        <SubmitClaimCard
          sent={claim.status === 'submitted'}
          action={submitClaim.bind(null, claim.id)}
        />
      </div>
    </>
  );
}
