import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { WalletTable } from '@/components/staff/WalletTable';
import { listOwnershipQueue, requireStaff } from '@/libs/accounts/Staff';
import { staffCounts } from '@/libs/accounts/StaffCounts';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Staff' });

  return {
    title: t('wallets_title'),
  };
}

export default async function StaffWalletsPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Staff' });
  await requireStaff();
  const [items, counts] = await Promise.all([listOwnershipQueue(), staffCounts()]);

  return (
    <>
      <PageHeader title={t('wallets_title')} description={t('wallets_description')} />
      <WalletTable items={items} total={counts.wallets} />
    </>
  );
}
