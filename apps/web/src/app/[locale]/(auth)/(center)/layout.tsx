import { setRequestLocale } from 'next-intl/server';
import { AuthShell } from '@/components/AuthShell';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AuthShell>{props.children}</AuthShell>;
}
