'use client';

import type { FraudType, PaymentMethod } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { createClaim } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { HowYouPaidSection } from '@/components/claims/HowYouPaidSection';
import { MoreDetailsSection } from '@/components/claims/MoreDetailsSection';
import { WhatHappenedSection } from '@/components/claims/WhatHappenedSection';
import { WhoSection } from '@/components/claims/WhoSection';
import { Button } from '@/components/ui/button';
import { useFormAction } from '@/hooks/use-form-action';

/**
 * The first step of a claim, built around how people lose money in crypto rather than around a wallet: what happened, how
 * they paid, and who was behind it. What is asked next depends on the answers. The proof of ownership and the person's own
 * account come on the next page, where the claim already exists and can be finished later.
 * @returns The form.
 */
export function NewClaimForm() {
  const t = useTranslations('ClaimPage');
  const { state, onSubmit, pending } = useFormAction(createClaim, { errors: [] });
  const [fraudType, setFraudType] = React.useState<FraudType>();
  const [method, setMethod] = React.useState<PaymentMethod>('wallet');

  return (
    <form className="grid max-w-2xl gap-12" noValidate onSubmit={onSubmit}>
      <WhatHappenedSection
        value={fraudType}
        onChange={setFraudType}
        invalid={state.errors.includes('fraudType')}
      />
      <HowYouPaidSection method={method} onMethodChange={setMethod} errors={state.errors} />
      <WhoSection fraudType={fraudType} errors={state.errors} />
      <MoreDetailsSection />

      <FieldMessage show={state.errors.includes('duplicate')}>{t('error_duplicate')}</FieldMessage>

      <Button type="submit" disabled={pending || !fraudType} className="justify-self-start">
        {t('create')}
      </Button>
    </form>
  );
}
