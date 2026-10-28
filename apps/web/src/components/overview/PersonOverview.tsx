import { getTranslations } from 'next-intl/server';
import { ClaimMeta, OperatorName } from '@/components/claims/ClaimMeta';
import { PageSection } from '@/components/layout/PageSection';
import { PersonActivity } from '@/components/overview/PersonActivity';
import { StatCard } from '@/components/overview/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listClaims } from '@/libs/claims/Claims';
import { Link } from '@/libs/I18nNavigation';
import { claimSteps } from '@/utils/claims/ClaimSteps';

/**
 * A person's overview: the count of their claims by where they stand, each claim with how far along it is, and what has happened
 * to them, or an empty state with the one action that starts a claim. Nothing here is sample data.
 * @param props - The overview props.
 * @param props.userId - The Clerk user id.
 * @returns The claims section.
 */
export async function PersonOverview(props: { userId: string }) {
  const t = await getTranslations('Overview');
  const list = await getTranslations('ClaimList');
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

  const sent = claims.filter((claim) => claim.status === 'submitted');
  const stats = [
    { label: t('person_stat_claims'), value: claims.length },
    { label: t('person_stat_sent'), value: sent.length },
    {
      label: t('person_stat_signed'),
      value: claims.filter((claim) => claim.ownership === 'signed').length,
    },
    {
      label: list('confirmed'),
      value: claims.filter((claim) => claim.validatedAt !== null).length,
    },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={String(stat.value)} />
        ))}
      </div>
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
                    <OperatorName name={claim.platformName} />
                    <span className="flex items-center gap-2">
                      {claim.ownership === 'signed' && (
                        <Badge variant="solid">{list('confirmed')}</Badge>
                      )}
                      {claim.validatedAt ? (
                        <Badge variant="solid">{list('confirmed')}</Badge>
                      ) : (
                        <Badge variant={claim.status === 'submitted' ? 'default' : 'dashed'}>
                          {claim.status === 'submitted' ? t('claim_sent') : t('claim_draft')}
                        </Badge>
                      )}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <ClaimMeta claim={claim} />
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
      <PersonActivity userId={props.userId} />
    </div>
  );
}
