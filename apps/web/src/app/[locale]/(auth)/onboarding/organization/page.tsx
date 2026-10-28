import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OrganizationChoice } from '@/components/onboarding/OrganizationChoice';
import { getI18nPath } from '@/utils/Helpers';

type OrganizationStepPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: OrganizationStepPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'OrganizationStep' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    robots: { index: false, follow: false },
  };
}

export default async function OrganizationStepPage(props: OrganizationStepPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('OrganizationStep');
  // A session that has not chosen an organization yet is pending, and is still the person this page is for.
  const { userId } = await auth({ treatPendingAsSignedOut: false });

  if (!userId) {
    redirect(getI18nPath('/sign-in', locale));
  }

  return (
    <OnboardingShell userMenu={<UserButton />} title={t('title')} subtitle={t('subtitle')}>
      <OrganizationChoice next={getI18nPath('/onboarding', locale)} />
    </OnboardingShell>
  );
}
