import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { InstitutionPlan } from '@/components/institutions/InstitutionPlan';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Button } from '@/components/ui/button';
import { Env } from '@/libs/Env';
import { Link } from '@/libs/I18nNavigation';

type JoinPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: JoinPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'JoinPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function JoinPage(props: JoinPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'JoinPage' });

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex h-16 items-center justify-between border-b border-line-soft px-6">
        <Logo height={28} className="text-ink" />
        <LocaleSwitcher />
      </header>
      <main className="mx-auto grid w-full max-w-2xl gap-8 px-6 py-12">
        <header className="grid gap-2">
          <h1 className="text-3xl">{t('title')}</h1>
          <p className="text-base text-ink-muted">{t('subtitle')}</p>
        </header>
        <InstitutionPlan price={Env.INSTITUTION_PRICE} />
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href={`/api/join?locale=${locale}`}>{t('apply')}</a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">{t('report_instead')}</Link>
            </Button>
          </div>
          <p className="text-sm text-ink-muted">{t('separate_account')}</p>
        </div>
      </main>
    </div>
  );
}
