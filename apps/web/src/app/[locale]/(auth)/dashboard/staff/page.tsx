import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { StatCard } from '@/components/overview/StatCard';
import { CaseAdmin } from '@/components/staff/CaseAdmin';
import { CounselQueue } from '@/components/staff/CounselQueue';
import { MailPanel } from '@/components/staff/MailPanel';
import { SyncCounselButton } from '@/components/staff/SyncCounselButton';
import { listCases } from '@/libs/Cases';
import { mailStatus } from '@/libs/MailStatus';
import { listPendingCounsel, requireStaff } from '@/libs/Staff';

type StaffPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: StaffPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function StaffPage(props: StaffPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Staff' });
  await requireStaff();
  const [lawyers, cases, mail] = await Promise.all([
    listPendingCounsel(),
    listCases(),
    mailStatus(),
  ]);

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
        <PageSection
          title={t('queue_title')}
          description={t('queue_description')}
          action={<SyncCounselButton />}
        >
          <CounselQueue lawyers={lawyers} />
        </PageSection>
        <PageSection title={t('cases_title')} description={t('cases_description')}>
          <CaseAdmin cases={cases} />
        </PageSection>
        <PageSection title={t('mail_title')} description={t('mail_description')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label={t('mail_pending')} value={String(mail.pending + mail.sending)} />
            <StatCard label={t('mail_failed')} value={String(mail.failed)} />
            <StatCard label={t('mail_suppressed')} value={String(mail.suppressed.length)} />
          </div>
          <MailPanel failures={mail.failures} suppressed={mail.suppressed} />
        </PageSection>
      </div>
    </>
  );
}
