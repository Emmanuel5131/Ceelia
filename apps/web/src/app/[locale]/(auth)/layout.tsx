import { ClerkProvider } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { ClerkLocalizations } from '@/utils/AppConfig';
import { clerkAppearance } from '@/utils/ClerkAppearance';
import { getI18nPath } from '@/utils/Helpers';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale =
    ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;

  return (
    <ClerkProvider
      appearance={clerkAppearance}
      localization={clerkLocale}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      // Clerk can ask for an organization after sign-in. It is asked on our own page, as individual or organization.
      taskUrls={{ 'choose-organization': getI18nPath('/onboarding/organization', locale) }}
      afterSignOutUrl="/"
    >
      {props.children}
    </ClerkProvider>
  );
}
