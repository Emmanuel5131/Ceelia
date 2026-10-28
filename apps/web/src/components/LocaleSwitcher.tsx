'use client';

import { FR, GB } from 'country-flag-icons/react/3x2';
import { useLocale, useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';
import { rememberLocale } from '@/libs/notifications/InboxActions';

// The flag shown beside each language, when there is one. A flag stands for a language here, not a country: English uses the British flag.
const flags: Record<string, typeof GB | undefined> = { en: GB, fr: FR };

// A language named in itself, with a capital: "English", "Français".
const languageName = (locale: string) => {
  const name = new Intl.DisplayNames(locale, { type: 'language' }).of(locale) ?? locale;

  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};

export const LocaleSwitcher = () => {
  const t = useTranslations('LocaleSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) {
      return;
    }

    // Emails sent later are written in the language the person last chose. Visitors who are not signed in are ignored.
    void rememberLocale(newLocale);
    const { search } = window.location;
    router.push(`${pathname}${search}`, { locale: newLocale, scroll: false });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-36" aria-label={t('change_language')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((elt) => {
          const Flag = flags[elt];

          return (
            <SelectItem key={elt} value={elt}>
              {Flag && (
                <Flag className="h-4 w-6 shrink-0 border border-line-soft" aria-hidden="true" />
              )}
              {/* Each language is named in itself, so it can be found whatever the page language is. */}
              {languageName(elt)}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
