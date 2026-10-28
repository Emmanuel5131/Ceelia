import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

/**
 * The page around onboarding: the logo, language and account menu on top, and one centred column for the questions.
 * @param props - The shell props.
 * @param props.userMenu - The account menu, so the shell does not depend on Clerk.
 * @param props.children - The form.
 * @returns The page frame.
 */
export async function OnboardingShell(props: {
  userMenu: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = await getTranslations('OnboardingPage');

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex h-16 items-center justify-between border-b border-line-soft px-6">
        <Logo height={28} className="text-ink" />
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          {props.userMenu}
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-xl gap-8 px-6 py-12">
        <header className="grid gap-2">
          <h1 className="text-3xl">{t('title')}</h1>
          <p className="text-base text-ink-muted">{t('subtitle')}</p>
        </header>
        {props.children}
      </main>
    </div>
  );
}
