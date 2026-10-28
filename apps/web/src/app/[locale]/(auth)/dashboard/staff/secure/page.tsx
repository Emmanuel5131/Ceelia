import { UserProfile } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireStaff } from '@/libs/accounts/Staff';
import { getI18nPath } from '@/utils/Helpers';

type SecurePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SecurePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return {
    title: t('secure_meta_title'),
    description: t('secure_meta_description'),
  };
}

export default async function StaffSecurePage(props: SecurePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Staff' });
  const user = await requireStaff({ twoFactor: false });

  // Once two-step sign-in is on there is nothing left to do here.
  if (user.twoFactorEnabled) {
    redirect(getI18nPath('/dashboard/staff', locale));
  }

  return (
    <>
      <PageHeader title={t('secure_title')} description={t('secure_description')} />
      <UserProfile routing="hash" />
    </>
  );
}
