import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

// An address that matches no page lands here, so it is shown in the language of the visit with the app's own not-found page.
export default async function CatchAllPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return notFound();
}
