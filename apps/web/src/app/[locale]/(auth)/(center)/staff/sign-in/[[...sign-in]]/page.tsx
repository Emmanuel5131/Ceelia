import { SignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getI18nPath } from '@/utils/Helpers';

type StaffSignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: StaffSignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'StaffSignIn' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffSignInPage(props: StaffSignInPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const staffUrl = getI18nPath('/dashboard/staff', locale);

  // Someone who is already signed in has nothing to do here, and Clerk would show an error instead of the form.
  const { userId } = await auth();

  if (userId) {
    redirect(staffUrl);
  }

  // Staff accounts are made by us, so there is no sign-up here. Whether an account may open the area is decided on the server.
  return (
    <SignIn
      path={getI18nPath('/staff/sign-in', locale)}
      forceRedirectUrl={staffUrl}
      withSignUp={false}
    />
  );
}
