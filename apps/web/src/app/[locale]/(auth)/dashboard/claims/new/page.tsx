import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { NewClaimForm } from '@/components/claims/NewClaimForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { parseAccount } from '@/utils/Account';
import { getI18nPath } from '@/utils/Helpers';

type NewClaimPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: NewClaimPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ClaimPage' });

  return {
    title: t('meta_title_new'),
    description: t('meta_description_new'),
  };
}

export default async function NewClaimPage(props: NewClaimPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ClaimPage' });
  const user = await currentUser();

  // Only people file claims; counsel take cases.
  if (parseAccount(user?.publicMetadata)?.accountType !== 'person') {
    redirect(getI18nPath('/dashboard', locale));
  }

  return (
    <>
      <PageHeader title={t('new_title')} description={t('new_description')} />
      <NewClaimForm />
    </>
  );
}
