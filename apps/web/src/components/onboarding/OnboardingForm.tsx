'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { completeOnboarding } from '@/app/[locale]/(auth)/onboarding/actions';
import { AccountTypeChoice } from '@/components/onboarding/AccountTypeChoice';
import { CounselFields } from '@/components/onboarding/CounselFields';
import { PersonFields } from '@/components/onboarding/PersonFields';
import { Button } from '@/components/ui/button';
import type { AccountType } from '@/utils/accounts/Account';

/**
 * The two-step onboarding form: what you are, then the details that go with it. The form is sent from the submit handler
 * rather than as a form action, because a form action clears every field when it fails and the person would have to retype.
 * @param props - The form props.
 * @param props.plan - The institution plan, shown before an institution fills in its details.
 * @param props.initialType - The type to start on, when the person came from the join page.
 * @returns The form.
 */
export function OnboardingForm(props: { plan: React.ReactNode; initialType?: AccountType }) {
  const t = useTranslations('OnboardingPage');
  const [type, setType] = React.useState<AccountType | undefined>(props.initialType);
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
            <>
              {props.plan}
              <CounselFields errors={state.errors} />
            </>
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
          {type === 'counsel' && props.plan}
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
