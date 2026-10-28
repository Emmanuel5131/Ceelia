import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { navByAccount, staffNav } from '@/components/shell/nav';
import type { NavId } from '@/components/shell/nav';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type { AccountType } from '@/utils/accounts/Account';

/**
 * The frame of every signed-in page, built on the shadcn Sidebar: a collapsible sidebar whose items depend on the role, and
 * a 64px header (menu button, language, account menu) above the page, which sits in `PageContainer`.
 * @param props - The shell props.
 * @param props.accountType - The signed-in person's account type, which decides the navigation.
 * @param props.staff - Celia staff see only the staff areas, not the pages the people they serve use.
 * @param props.counts - How many items wait in some areas, shown as a number beside them.
 * @param props.notifications - The bell, with the person's notifications.
 * @param props.userMenu - The account menu, so the shell does not depend on Clerk.
 * @param props.signOut - The sign-out button for the sidebar footer.
 * @param props.defaultOpen - Whether the sidebar starts expanded; read from its cookie by the layout.
 * @param props.children - The page.
 * @returns The app shell.
 */
export async function AppShell(props: {
  accountType: AccountType;
  staff?: boolean;
  counts?: Partial<Record<NavId, number>>;
  notifications: React.ReactNode;
  userMenu: React.ReactNode;
  signOut: React.ReactNode;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const t = await getTranslations('AppShell');

  return (
    <SidebarProvider defaultOpen={props.defaultOpen}>
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-on-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t('skip_to_content')}
      </a>
      <AppSidebar
        items={props.staff ? staffNav : navByAccount[props.accountType]}
        counts={props.counts}
        signOut={props.signOut}
      />
      <SidebarInset id="main" tabIndex={-1}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line-soft bg-surface px-4 md:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5 data-vertical:self-center" />
          <div className="ml-auto flex items-center gap-4">
            <LocaleSwitcher />
            {props.notifications}
            {props.userMenu}
          </div>
        </header>
        <PageContainer>{props.children}</PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
