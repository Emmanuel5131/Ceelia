import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { StaffOverviewCards } from '@/components/staff/StaffOverviewCards';
import { staffCounts } from '@/libs/accounts/StaffCounts';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return {
    title: t('meta_title'),
  };
}

export default async function StaffOverviewPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <StaffOverviewCards counts={await staffCounts()} />
    </>
  );
}
