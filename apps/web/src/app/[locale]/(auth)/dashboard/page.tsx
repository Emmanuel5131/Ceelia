import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OverviewContent } from '@/components/overview/OverviewContent';
import { parseRole } from '@/utils/Role';

type OverviewPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: OverviewPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Overview' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function OverviewPage(props: OverviewPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const user = await currentUser();

  return (
    <OverviewContent userRole={parseRole(user?.publicMetadata.role)} firstName={user?.firstName} />
  );
}
