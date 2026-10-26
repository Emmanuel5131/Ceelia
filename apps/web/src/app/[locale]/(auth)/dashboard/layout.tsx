import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { AppShell } from '@/components/shell/AppShell';
import { parseRole } from '@/utils/Role';

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
  const cookieStore = await cookies();
  // The sidebar remembers whether it was collapsed in a cookie (set by the shadcn sidebar).
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <AppShell
      userRole={parseRole(user?.publicMetadata.role)}
      userMenu={<UserButton />}
      defaultOpen={defaultOpen}
    >
      {props.children}
    </AppShell>
  );
}
