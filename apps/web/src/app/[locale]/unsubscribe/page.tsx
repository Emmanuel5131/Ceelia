import { optionalCategories } from '@celia/core';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UnsubscribeForm } from '@/components/email/UnsubscribeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Env } from '@/libs/Env';
import { verifyUnsubscribe } from '@/utils/Unsubscribe';

type UnsubscribePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata(props: UnsubscribePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Unsubscribe' });

  return { title: t('meta_title'), robots: { index: false, follow: false } };
}

export default async function UnsubscribePage(props: UnsubscribePageProps) {
  const { locale } = await props.params;
  const { token = '' } = await props.searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Unsubscribe' });
  const claim = Env.UNSUBSCRIBE_SECRET ? verifyUnsubscribe(Env.UNSUBSCRIBE_SECRET, token) : null;
  const category = optionalCategories.find((value) => value === claim?.category);

  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center p-4">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{category ? t(`text_${category}`) : t('text_invalid')}</CardDescription>
        </CardHeader>
        {category && (
          <CardContent>
            <UnsubscribeForm token={token} />
          </CardContent>
        )}
      </Card>
    </main>
  );
}
