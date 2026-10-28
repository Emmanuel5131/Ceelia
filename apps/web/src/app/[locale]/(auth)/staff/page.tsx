import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getI18nPath } from '@/utils/Helpers';

/**
 * The short address `/staff`, which people type, sends them to the staff area. It shows nothing itself: the area decides who may
 * come in.
 * @param props - The page props.
 * @param props.params - The route params.
 * @returns Never: it redirects.
 */
export default async function StaffShortcutPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return redirect(getI18nPath('/dashboard/staff', locale));
}
