import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { CaseDataTable } from '@/components/overview/CaseDataTable';
import { SampleNotice } from '@/components/overview/SampleNotice';
import { sampleCases } from '@/libs/OverviewSample';

type CaseBankPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: CaseBankPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CaseBank' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function CaseBankPage(props: CaseBankPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'CaseBank' });

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <SampleNotice />
      <CaseDataTable cases={sampleCases} />
    </>
  );
}
