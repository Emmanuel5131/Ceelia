'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { completeOnboarding } from '@/app/[locale]/(auth)/onboarding/actions';
import { AccountTypeChoice } from '@/components/onboarding/AccountTypeChoice';
import { CounselFields } from '@/components/onboarding/CounselFields';
import { PersonFields } from '@/components/onboarding/PersonFields';
import { Button } from '@/components/ui/button';
import type { AccountType } from '@/utils/Account';

/**
 * The two-step onboarding form: what you are, then the details that go with it. The form is sent from the submit handler
 * rather than as a form action, because a form action clears every field when it fails and the person would have to retype.
 * @returns The form.
 */
export function OnboardingForm() {
  const t = useTranslations('OnboardingPage');
  const [type, setType] = React.useState<AccountType>();
  const [confirmed, setConfirmed] = React.useState(false);
  const [state, formAction, pending] = React.useActionState(completeOnboarding, { errors: [] });
  const [, startTransition] = React.useTransition();

  return (
    <form
      className="grid gap-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        startTransition(() => {
          formAction(data);
        });
      }}
    >
      {confirmed && type ? (
        <>
          <input type="hidden" name="accountType" value={type} />
          <header className="grid gap-2">
            <h2 className="text-2xl">
              {type === 'person' ? t('person_title') : t('counsel_title')}
            </h2>
            <p className="text-base text-ink-muted">
              {type === 'person' ? t('person_text') : t('counsel_text')}
            </p>
          </header>
          {type === 'person' ? (
            <PersonFields errors={state.errors} />
          ) : (
            <CounselFields errors={state.errors} />
          )}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmed(false);
              }}
            >
              {t('back')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('finish')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <AccountTypeChoice value={type} onChange={setType} />
          <Button
            type="button"
            disabled={!type}
            className="justify-self-start"
            onClick={() => {
              setConfirmed(true);
            }}
          >
            {t('continue')}
          </Button>
        </>
      )}
    </form>
  );
}
