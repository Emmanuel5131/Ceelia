'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { reapply } from '@/app/[locale]/(auth)/dashboard/apply-again/actions';
import { CounselFields } from '@/components/onboarding/CounselFields';
import { Button } from '@/components/ui/button';
import type { InstitutionKind } from '@/utils/accounts/Institution';

/**
 * The form a rejected applicant uses to apply again: the same fields as the first application, filled with what they gave.
 * @param props - The form props.
 * @param props.defaults - What they gave before.
 * @param props.defaults.kind - The kind of organisation.
 * @param props.defaults.registrationNumber - The registration or bar number.
 * @param props.defaults.website - The website.
 * @param props.defaults.contactRole - Their role.
 * @param props.defaults.firm - The firm, or null when independent.
 * @param props.defaults.jurisdictions - The jurisdiction ids they are admitted in.
 * @returns The form.
 */
export function ReapplyForm(props: {
  defaults: {
    kind: InstitutionKind;
    registrationNumber: string | null;
    website: string | null;
    contactRole: string | null;
    firm: string | null;
    jurisdictions: string[];
  };
}) {
  const t = useTranslations('OnboardingPage');
  const [state, formAction, pending] = React.useActionState(reapply, { errors: [] });
  const [, startTransition] = React.useTransition();

  // Sent from the submit handler, not as a form action, because a form action clears every field when it fails.
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
      <CounselFields errors={state.errors} defaults={props.defaults} />
      <Button type="submit" disabled={pending} className="justify-self-start">
        {t('reapply_submit')}
      </Button>
    </form>
  );
}
