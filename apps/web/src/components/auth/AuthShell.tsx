import { CheckIcon } from '@phosphor-icons/react/ssr';
import { getTranslations } from 'next-intl/server';
import { AuthHeading } from '@/components/auth/AuthHeading';
import { Logo } from '@/components/brand/Logo';

/**
 * The full-page frame for signing in and creating an account: an ink panel with the logo, one sentence and what happens
 * next on the left, the Clerk form on the right. On phones the panel collapses to the logo above the form.
 * @param props - The shell props.
 * @param props.children - The Clerk component to show.
 * @returns The full-page auth layout.
 */
export async function AuthShell(props: { children: React.ReactNode }) {
  const t = await getTranslations('AuthShell');
  const points = [t('point_1'), t('point_2')];

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* The dot grid is the landing page's background, kept faint so it never competes with the text. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-night bg-[radial-gradient(circle,rgb(255_255_255/0.16)_1.5px,transparent_1.5px)] bg-size-[40px_40px] p-12 text-white lg:flex xl:p-16">
        <Logo height={40} onDark className="text-white" />

        <div className="grid max-w-md gap-8">
          <div className="grid gap-4">
            <h1 className="text-3xl text-balance text-white">{t('title')}</h1>
            <p className="text-base text-on-ink-muted">{t('text')}</p>
          </div>
          <ul className="grid gap-4 border-t border-white/30 pt-8">
            {points.map((point) => (
              <li key={point} className="flex items-baseline gap-4 text-sm text-white">
                <CheckIcon className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-on-ink-muted">{t('note')}</p>
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-sm gap-8">
          <Logo height={32} className="text-ink lg:hidden" />
          <AuthHeading />
          {props.children}
        </div>
      </main>
    </div>
  );
}
