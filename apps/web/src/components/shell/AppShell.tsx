import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { navByRole } from '@/components/shell/nav';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type { Role } from '@/utils/Role';

/**
 * The frame of every signed-in page, built on the shadcn Sidebar: a collapsible sidebar whose items depend on the role, and
 * a 64px header (menu button, language, account menu) above the page, which sits in `PageContainer`.
 * @param props - The shell props.
 * @param props.userRole - The signed-in person's role, which decides the navigation.
 * @param props.userMenu - The account menu, so the shell does not depend on Clerk.
 * @param props.defaultOpen - Whether the sidebar starts expanded; read from its cookie by the layout.
 * @param props.children - The page.
 * @returns The app shell.
 */
export async function AppShell(props: {
  userRole: Role;
  userMenu: React.ReactNode;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const t = await getTranslations('AppShell');

  return (
    <SidebarProvider defaultOpen={props.defaultOpen}>
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t('skip_to_content')}
      </a>
      <AppSidebar items={navByRole[props.userRole]} />
      <SidebarInset id="main" tabIndex={-1}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line-soft bg-surface px-4 md:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5 data-vertical:self-center" />
          <div className="ml-auto flex items-center gap-4">
            <LocaleSwitcher />
            {props.userMenu}
          </div>
        </header>
        <PageContainer>{props.children}</PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
