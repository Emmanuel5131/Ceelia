import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { NotificationsBell } from '@/components/shell/NotificationsBell';
import { ReviewNotice } from '@/components/shell/ReviewNotice';
import { SignOutAction } from '@/components/shell/SignOutAction';
import { parseAccount } from '@/utils/Account';
import { getI18nPath } from '@/utils/Helpers';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'DashboardLayout' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    // The app is for signed-in people only, so search engines have nothing to index here.
    robots: { index: false, follow: false },
  };
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const user = await currentUser();
  const account = parseAccount(user?.publicMetadata);

  // Nobody sees the app until they have said what they are. There is deliberately no default type: some can see victim data.
  if (!account) {
    redirect(getI18nPath('/onboarding', locale));
  }

  const cookieStore = await cookies();
  // The sidebar remembers whether it was collapsed in a cookie (set by the shadcn sidebar).
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <AppShell
      accountType={account.accountType}
      staff={account.staff}
      notifications={user ? <NotificationsBell userId={user.id} /> : null}
      userMenu={<UserButton />}
      signOut={<SignOutAction />}
      defaultOpen={defaultOpen}
    >
      {account.review === 'pending' && <ReviewNotice />}
      {props.children}
    </AppShell>
  );
}
