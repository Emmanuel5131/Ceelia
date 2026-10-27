import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { toClaimRow } from '@/components/claims/claim-row';
import { ClaimDataTable } from '@/components/claims/ClaimDataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { listClaims } from '@/libs/Claims';
import { Link } from '@/libs/I18nNavigation';
import { parseAccount } from '@/utils/Account';
import { getI18nPath } from '@/utils/Helpers';

type ClaimsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ClaimsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ClaimList' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ClaimsPage(props: ClaimsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ClaimList' });
  const user = await currentUser();

  // Only people file claims; counsel take cases.
  if (!user || parseAccount(user.publicMetadata)?.accountType !== 'person') {
    redirect(getI18nPath('/dashboard', locale));
  }

  const claims = await listClaims(user.id);

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          claims.length > 0 && (
            <Button asChild size="lg">
              <Link href="/dashboard/claims/new">{t('new_claim')}</Link>
            </Button>
          )
        }
      />
      <ClaimDataTable claims={claims.map(toClaimRow)} />
    </>
  );
}
