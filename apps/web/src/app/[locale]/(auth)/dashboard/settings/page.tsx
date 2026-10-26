import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ManageAccountButton } from '@/components/settings/ManageAccountButton';
import { SettingsContent } from '@/components/settings/SettingsContent';

type SettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SettingsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Settings' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SettingsPage(props: SettingsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <SettingsContent manageAccount={<ManageAccountButton />} />;
}
