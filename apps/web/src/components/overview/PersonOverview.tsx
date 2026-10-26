import { getTranslations } from 'next-intl/server';
import { PageSection } from '@/components/layout/PageSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listClaims } from '@/libs/Claims';
import { Link } from '@/libs/I18nNavigation';
import { claimSteps } from '@/utils/ClaimSteps';

/**
 * A person's overview: their own claims, each with how far along it is, or an empty state with the one action that starts a
 * claim. Nothing here is sample data.
 * @param props - The overview props.
 * @param props.userId - The Clerk user id.
 * @returns The claims section.
 */
export async function PersonOverview(props: { userId: string }) {
  const t = await getTranslations('Overview');
  const claims = await listClaims(props.userId);

  if (claims.length === 0) {
    return (
      <Card variant="outline">
        <CardHeader>
          <CardTitle>{t('person_empty_title')}</CardTitle>
          <CardDescription>{t('person_empty_text')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/claims/new">{t('person_action')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <PageSection
      title={t('person_claims_title')}
      description={t('person_claims_text')}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/claims/new">{t('person_action')}</Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {claims.map((claim) => {
          const steps = claimSteps(claim).slice(0, 4);

          return (
            <Card key={claim.id} variant="outline">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  {claim.platformName}
                  <Badge variant={claim.status === 'submitted' ? 'solid' : 'dashed'}>
                    {claim.status === 'submitted' ? t('claim_sent') : t('claim_draft')}
                  </Badge>
                </CardTitle>
                <CardDescription className="font-mono">
                  {claim.walletAddress.slice(0, 8)}…{claim.walletAddress.slice(-6)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-ink-muted">
                  {t('claim_progress', {
                    done: steps.filter((s) => s === 'done').length,
                    total: steps.length,
                  })}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/claims/${claim.id}`}>{t('claim_open')}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageSection>
  );
}
