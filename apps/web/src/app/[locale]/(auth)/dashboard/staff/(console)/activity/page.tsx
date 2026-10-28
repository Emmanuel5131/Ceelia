import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { StaffAuditTable } from '@/components/staff/StaffAuditTable';
import { requireStaff } from '@/libs/accounts/Staff';
import { listStaffAudit } from '@/libs/accounts/StaffAudit';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return {
    title: t('audit_title'),
  };
}

export default async function StaffActivityPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Staff' });
  await requireStaff();

  return (
    <>
      <PageHeader title={t('audit_title')} description={t('audit_description')} />
      <StaffAuditTable items={await listStaffAudit()} />
    </>
  );
}
