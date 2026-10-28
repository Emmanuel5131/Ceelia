import { getTranslations } from 'next-intl/server';
import { StatCard } from '@/components/overview/StatCard';
import type { StaffCounts } from '@/libs/accounts/StaffCounts';
import { Link } from '@/libs/I18nNavigation';

/**
 * What is waiting for staff, one card per queue, each linking to its page. It is the starting point: the numbers say where to go.
 * @param props - The cards props.
 * @param props.counts - How much is waiting in each queue.
 * @returns The cards.
 */
export async function StaffOverviewCards(props: { counts: StaffCounts }) {
  const t = await getTranslations('Staff');
  const nav = await getTranslations('AppShell');
  const cards = [
    { id: 'applications', href: '/dashboard/staff/applications', value: props.counts.applications },
    { id: 'claims', href: '/dashboard/staff/claims', value: props.counts.claims },
    { id: 'mail', href: '/dashboard/staff/mail', value: props.counts.mail },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          className="block focus-ring hover:[&_[data-slot=card]]:bg-paper-sunken"
        >
          <StatCard
            label={nav(`nav_staff_${card.id}`)}
            value={String(card.value)}
            hint={t(`overview_${card.id}_hint`)}
          />
        </Link>
      ))}
    </div>
  );
}
