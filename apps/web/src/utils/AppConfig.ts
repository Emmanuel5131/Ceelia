import { enUS, frFR } from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/shared/types';
import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Customize this configuration for your product
/** Centralized application configuration */
export const AppConfig = {
  name: 'Nextjs Starter',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    localePrefix,
  },
};

// The Google button reads "Continue with Google" instead of just "Google".
const supportedLocales: Record<string, LocalizationResource> = {
  en: {
    ...enUS,
    socialButtonsBlockButton: 'Continue with {{provider|titleize}}',
    socialButtonsBlockButtonManyInView: 'Continue with {{provider|titleize}}',
  },
  fr: {
    ...frFR,
    socialButtonsBlockButton: 'Continuer avec {{provider|titleize}}',
    socialButtonsBlockButtonManyInView: 'Continuer avec {{provider|titleize}}',
  },
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
