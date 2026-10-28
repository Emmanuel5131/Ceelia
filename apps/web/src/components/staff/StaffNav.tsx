'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { StaffCounts } from '@/libs/accounts/StaffCounts';
import { Link, usePathname } from '@/libs/I18nNavigation';
import { cn } from '@/utils/Cn';

type Entry = {
  href: string;
  id: 'overview' | 'applications' | 'wallets' | 'claims' | 'cases' | 'mail' | 'activity';
  count?: number;
};

/**
 * The menu inside the staff area: one entry per queue, with how much is waiting in each, so staff see where the work is without
 * opening every page. The current page is underlined.
 * @param props - The menu props.
 * @param props.counts - How much is waiting in each queue.
 * @returns The menu.
 */
export function StaffNav(props: { counts: StaffCounts }) {
  const t = useTranslations('Staff');
  const pathname = usePathname();
  const entries: Entry[] = [
    { href: '/dashboard/staff', id: 'overview' },
    { href: '/dashboard/staff/applications', id: 'applications', count: props.counts.applications },
    { href: '/dashboard/staff/wallets', id: 'wallets', count: props.counts.wallets },
    { href: '/dashboard/staff/claims', id: 'claims', count: props.counts.claims },
    { href: '/dashboard/staff/cases', id: 'cases' },
    { href: '/dashboard/staff/mail', id: 'mail', count: props.counts.mail },
    { href: '/dashboard/staff/activity', id: 'activity' },
  ];

  return (
    <nav aria-label={t('nav_label')} className="-mt-2 mb-8 overflow-x-auto border-b border-border">
      <ul className="flex min-w-max gap-6">
        {entries.map((entry) => {
          const active =
            entry.href === '/dashboard/staff'
              ? pathname === entry.href
              : pathname.startsWith(entry.href);

          return (
            <li key={entry.id}>
              <Link
                href={entry.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  '-mb-px flex min-h-12 items-center gap-2 border-b-2 text-sm focus-ring',
                  active
                    ? 'border-ink font-medium text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink',
                )}
              >
                {t(`nav_${entry.id}`)}
                {entry.count !== undefined && entry.count > 0 && (
                  <Badge variant="solid">{entry.count}</Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
