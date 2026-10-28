import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { ClaimsTable } from '@/components/staff/ClaimsTable';
import { listClaimsToValidate, requireStaff } from '@/libs/accounts/Staff';
import { staffCounts } from '@/libs/accounts/StaffCounts';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return {
    title: t('validate_title'),
  };
}

export default async function StaffClaimsPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Staff' });
  await requireStaff();
  const [items, counts] = await Promise.all([listClaimsToValidate(), staffCounts()]);

  return (
    <>
      <PageHeader title={t('validate_title')} description={t('validate_description')} />
      <ClaimsTable items={items} total={counts.claims} />
    </>
  );
}
