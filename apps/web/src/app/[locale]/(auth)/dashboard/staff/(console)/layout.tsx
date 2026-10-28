import { setRequestLocale } from 'next-intl/server';
import { StaffNav } from '@/components/staff/StaffNav';
import { requireStaff } from '@/libs/accounts/Staff';
import { staffCounts } from '@/libs/accounts/StaffCounts';

/**
 * The frame around every staff page: a menu with one entry per queue and how much is waiting in each. Each page and each action
 * checks for staff again; this only draws the menu.
 * @param props - The layout props.
 * @param props.children - The page.
 * @param props.params - The route params.
 * @returns The menu and the page.
 */
export default async function StaffConsoleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  await requireStaff();

  return (
    <>
      <StaffNav counts={await staffCounts()} />
      {props.children}
    </>
  );
}
