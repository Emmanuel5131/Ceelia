'use client';

import {
  BankIcon,
  FilesIcon,
  GearSixIcon,
  GlobeHemisphereWestIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/Logo';
import { LogoMark } from '@/components/LogoMark';
import type { NavId } from '@/components/shell/nav';
import { navHref } from '@/components/shell/nav';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Link, usePathname } from '@/libs/I18nNavigation';

const icons = {
  overview: SquaresFourIcon,
  claims: FilesIcon,
  cases: BankIcon,
  jurisdictions: GlobeHemisphereWestIcon,
  settings: GearSixIcon,
  staff: ShieldCheckIcon,
} as const;

/**
 * The app's left navigation, built on the shadcn Sidebar. It collapses to icons (button in the header, the rail on its edge, or
 * Ctrl/Cmd+B), keeps its state in a cookie, and becomes a slide-out menu on phones. The current page is marked.
 * @param props - The sidebar props.
 * @param props.items - Which areas to show, in order.
 * @param props.signOut - The sign-out button, so the sidebar does not depend on Clerk.
 * @returns The sidebar.
 */
export function AppSidebar(props: { items: NavId[]; signOut: React.ReactNode }) {
  const t = useTranslations('AppShell');
  const pathname = usePathname();
  const labels: Record<NavId, string> = {
    overview: t('nav_overview'),
    claims: t('nav_claims'),
    cases: t('nav_cases'),
    jurisdictions: t('nav_jurisdictions'),
    settings: t('nav_settings'),
    staff: t('nav_staff'),
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          aria-label={t('home_label')}
          className="flex items-center outline-none group-data-[collapsible=icon]:justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sidebar-ring"
        >
          <Logo
            height={28}
            onDark
            className="text-sidebar-foreground group-data-[collapsible=icon]:hidden"
          />
          <LogoMark
            size={28}
            onDark
            className="hidden text-sidebar-foreground group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu aria-label={t('main_navigation')}>
              {props.items.map((id) => {
                const href = navHref[id];
                const active = id === 'overview' ? pathname === href : pathname.startsWith(href);
                const Icon = icons[id];

                return (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton asChild isActive={active} tooltip={labels[id]}>
                      <Link href={href} aria-current={active ? 'page' : undefined}>
                        <Icon aria-hidden="true" />
                        <span>{labels[id]}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex-row items-center justify-between border-t border-sidebar-border px-4 py-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-0">
        <ThemeToggle />
        {props.signOut}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
