import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { NotificationsList } from '@/components/shell/NotificationsList';
import { listInbox } from '@/libs/Inbox';

type NotificationsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: NotificationsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Notifications' });

  return { title: t('page_title'), description: t('page_description') };
}

export default async function NotificationsPage(props: NotificationsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Notifications' });
  const { userId } = await auth();
  const items = userId ? await listInbox(userId, 50) : [];

  return (
    <>
      <PageHeader title={t('page_title')} description={t('page_description')} />
      <NotificationsList items={items} />
    </>
  );
}
