import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/overview/StatCard';
import { MailPanel } from '@/components/staff/MailPanel';
import { requireStaff } from '@/libs/accounts/Staff';
import { mailStatus } from '@/libs/notifications/MailStatus';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return {
    title: t('mail_title'),
  };
}

export default async function StaffMailPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Staff' });
  await requireStaff();
  const mail = await mailStatus();

  return (
    <>
      <PageHeader title={t('mail_title')} description={t('mail_description')} />
      <div className="grid gap-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={t('mail_pending')} value={String(mail.pending + mail.sending)} />
          <StatCard label={t('mail_failed')} value={String(mail.failed)} />
          <StatCard label={t('mail_suppressed')} value={String(mail.suppressed.length)} />
        </div>
        <MailPanel failures={mail.failures} suppressed={mail.suppressed} />
      </div>
    </>
  );
}
