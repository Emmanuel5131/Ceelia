import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { parseAccount } from '@/utils/accounts/Account';
import { getI18nPath } from '@/utils/Helpers';

type OnboardingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: OnboardingPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'OnboardingPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    robots: { index: false, follow: false },
  };
}

export default async function OnboardingPage(props: OnboardingPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Someone who has already chosen has nothing to do here, and the choice cannot be changed by coming back.
  const user = await currentUser();

  if (parseAccount(user?.publicMetadata)) {
    redirect(getI18nPath('/dashboard', locale));
  }

  return (
    <OnboardingShell userMenu={<UserButton />}>
      <OnboardingForm />
    </OnboardingShell>
  );
}
