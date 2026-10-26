import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JurisdictionFinder } from '@/components/JurisdictionFinder';
import { PageHeader } from '@/components/layout/PageHeader';

type JurisdictionsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: JurisdictionsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Jurisdictions' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function JurisdictionsPage(props: JurisdictionsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Jurisdictions' });

  return (
    <>
      <PageHeader title={t('page_title')} description={t('page_description')} />
      <JurisdictionFinder />
    </>
  );
}
