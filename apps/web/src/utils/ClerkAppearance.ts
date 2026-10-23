import type { ClerkProvider } from '@clerk/nextjs';
import type { ComponentProps } from 'react';

// Only Google and email with a password are offered (also switch the others off in the Clerk dashboard, under
// User & authentication → Social connections). These are hidden here as well so no other button can appear.
const hiddenProviders = ['apple', 'discord', 'facebook', 'github'] as const;

const hiddenProviderElements = Object.fromEntries(
  hiddenProviders.flatMap((provider) => [
    [`socialButtonsBlockButton__${provider}`, 'hidden'],
    [`socialButtonsIconButton__${provider}`, 'hidden'],
  ]),
);

/**
 * Clerk's look, mapped onto the Celia tokens (docs/DESIGN.md): ink on white, 44px square fields, pill buttons, no card shadow.
 * The `clerk` CSS layer keeps Clerk below our Tailwind utilities. Clerk also caps control heights with `max-height`,
 * which is why every control below resets it.
 */
export const clerkAppearance: ComponentProps<typeof ClerkProvider>['appearance'] = {
  cssLayerName: 'clerk',
  options: {
    socialButtonsVariant: 'blockButton',
    socialButtonsPlacement: 'top',
    shimmer: false,
  },
  variables: {
    colorPrimary: '#0F1B2D',
    colorBackground: '#FFFFFF',
    colorForeground: '#0F1B2D',
    colorMutedForeground: '#46566E',
    colorDanger: '#991F38',
    colorInput: '#FFFFFF',
    colorInputForeground: '#0F1B2D',
    borderRadius: '0',
    fontFamily: 'var(--font-mulish), system-ui, sans-serif',
    fontSize: '0.9375rem',
  },
  elements: {
    ...hiddenProviderElements,
    rootBox: 'w-full',
    cardBox: 'w-full overflow-visible rounded-none border-0 shadow-none',
    card: 'm-0 w-full gap-6 rounded-none border-0 bg-transparent p-0 shadow-none',
    header: 'hidden',
    footer: 'bg-none',
    footerAction: 'justify-center',
    footerActionText: 'text-sm text-ink-muted',
    main: 'gap-6',
    form: 'gap-6',
    formFieldRow: 'gap-2',
    formFieldLabel: 'text-sm font-medium text-ink',
    formFieldInput:
      'h-(--control-md) max-h-none rounded-none border-0 bg-surface px-3 text-base text-ink shadow-none ring-[1.5px] ring-input focus:ring-ink focus-ring',
    formFieldInputShowPasswordButton: 'text-ink-muted hover:text-ink',
    formFieldErrorText: 'text-xs text-seal',
    formFieldHintText: 'text-xs text-ink-muted',
    formButtonPrimary:
      'h-(--control-md) max-h-none rounded-full border-[1.5px] border-ink bg-ink bg-none text-base font-bold normal-case text-white shadow-none after:hidden before:hidden hover:bg-ink-hover focus-ring',
    buttonArrowIcon: 'hidden',
    socialButtonsRoot: 'w-full',
    socialButtons: 'w-full grid-cols-1',
    socialButtonsBlockButton:
      'h-(--control-md) max-h-none w-full min-w-0 rounded-full border-[1.5px] border-ink bg-surface text-ink shadow-none hover:bg-paper focus-ring',
    socialButtonsBlockButtonText: 'text-base font-bold text-ink',
    dividerRow: 'gap-4',
    dividerLine: 'bg-line',
    dividerText: 'text-sm text-ink-muted',
    formResendCodeLink: 'font-medium text-ink underline underline-offset-4',
    footerActionLink:
      'text-sm font-medium text-ink underline underline-offset-4 hover:text-ink-muted',
    identityPreview: 'rounded-none border-0 shadow-none ring-[1.5px] ring-input',
    alert: 'rounded-none border border-seal bg-surface text-seal shadow-none',
    alertText: 'text-sm text-seal',
    otpCodeFieldInput:
      'h-(--control-lg) max-h-none rounded-none border-0 shadow-none ring-[1.5px] ring-input focus:ring-ink',
  },
};
