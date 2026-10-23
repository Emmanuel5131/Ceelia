import { redirect } from 'next/navigation';
import { getI18nPath } from '@/utils/Helpers';

// The first page of the app is the full-page sign in (with a switch to create an account).
export default async function RootPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;

  redirect(getI18nPath('/sign-in', locale));
}
