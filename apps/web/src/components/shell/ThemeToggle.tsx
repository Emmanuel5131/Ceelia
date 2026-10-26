'use client';

import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

/**
 * Switches between light and dark mode. Both icons are in the markup and CSS shows the right one, so the server and the
 * browser render the same thing before the saved theme is known.
 * @returns The toggle button.
 */
export function ThemeToggle() {
  const t = useTranslations('AppShell');
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t('toggle_theme')}
      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-sidebar-ring"
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
    >
      <SunIcon className="dark:hidden" aria-hidden="true" />
      <MoonIcon className="hidden dark:block" aria-hidden="true" />
    </Button>
  );
}
