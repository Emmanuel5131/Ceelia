import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { OverviewContent } from '@/components/overview/OverviewContent';
import { parseAccount } from '@/utils/accounts/Account';
import { parseProfile } from '@/utils/accounts/Profile';
import { getI18nPath } from '@/utils/Helpers';

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

  const account = parseAccount(user?.publicMetadata);

  if (!user || !account) {
    redirect(getI18nPath('/onboarding', locale));
  }

  const profile = parseProfile(account.accountType, user.privateMetadata);

  return (
    <OverviewContent
      accountType={account.accountType}
      userId={user.id}
      admittedIn={profile?.accountType === 'counsel' ? profile.jurisdictions : []}
      firstName={user.firstName}
    />
  );
}
