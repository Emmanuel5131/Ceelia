import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { IdentityForm } from '@/components/verify/IdentityForm';
import { mustVerify } from '@/libs/accounts/Identity';
import { parseAccount } from '@/utils/accounts/Account';
import { getI18nPath } from '@/utils/Helpers';

type VerifyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: VerifyPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'VerifyPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function VerifyPage(props: VerifyPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'VerifyPage' });
  const user = await currentUser();

  // Only people report losses, so only they are checked. Someone who has passed, or a setup with no check, goes on.
  if (!user || parseAccount(user.publicMetadata)?.accountType !== 'person') {
    redirect(getI18nPath('/dashboard', locale));
  }

  if (!(await mustVerify(user.id))) {
    redirect(getI18nPath('/dashboard/claims/new', locale));
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <PageHeader centered compact title={t('title')} description={t('description')} />
      <IdentityForm />
    </div>
  );
}
