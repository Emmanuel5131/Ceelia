import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReapplyForm } from '@/components/onboarding/ReapplyForm';
import { getApplication, getApplicationForm } from '@/libs/accounts/Applications';
import { getI18nPath } from '@/utils/Helpers';

type ApplyAgainPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ApplyAgainPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ApplyAgainPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ApplyAgainPage(props: ApplyAgainPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ApplyAgainPage' });
  const user = await currentUser();
  const application = user ? await getApplication(user.id) : undefined;
  const defaults = user ? await getApplicationForm(user.id) : undefined;

  // Only a rejected applicant whose waiting period has passed can apply again.
  if (!application?.canReapply || !defaults) {
    redirect(getI18nPath('/dashboard', locale));
  }

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <ReapplyForm defaults={defaults} />
    </>
  );
}
