'use client';

import type { FraudType, PaymentMethod } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { createClaim, updateClaim } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { ClaimProgress } from '@/components/claims/ClaimProgress';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { claimFormSteps } from '@/components/claims/FormStep';
import { HowYouPaidSection } from '@/components/claims/HowYouPaidSection';
import { MoreDetailsSection } from '@/components/claims/MoreDetailsSection';
import { PaymentDetailsSection } from '@/components/claims/PaymentDetailsSection';
import { WhatHappenedSection } from '@/components/claims/WhatHappenedSection';
import { WhoSection } from '@/components/claims/WhoSection';
import { Button } from '@/components/ui/button';
import { useFormAction } from '@/hooks/use-form-action';
import { cn } from '@/utils/Cn';

// The step each field the server can refuse belongs to, so a refused form opens at the first step to fix.
const fieldSteps: Record<string, number> = {
  fraudTypes: 1,
  paymentMethod: 2,
  chain: 2,
  walletAddress: 2,
  txHash: 2,
  fundingTxHash: 3,
  destinationAddress: 3,
  firstPaymentOn: 3,
  lastPaymentOn: 3,
  platformName: 4,
  platformUrl: 4,
  duplicate: 5,
};

/**
 * One step of the form. Every step stays in the form while it is hidden, so what the person typed on an earlier step is still
 * sent; only the current one shows, sliding in from the side they are moving towards.
 * @param props - The step props.
 * @param props.current - Whether this is the step on show.
 * @param props.forward - Whether the person is moving forward, which decides the side it slides in from.
 * @param props.children - The step.
 * @returns The wrapper.
 */
function StepSlot(props: { current: boolean; forward: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        !props.current && 'hidden',
        props.current && 'motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in',
        props.current &&
          (props.forward
            ? 'motion-safe:slide-in-from-right-8'
            : 'motion-safe:slide-in-from-left-8'),
      )}
    >
      {props.children}
    </div>
  );
}

/**
 * The first page of a claim, one question at a time, built around how people lose money in crypto rather than around a wallet:
 * what happened, how they paid, who was behind it, and a little more. What is asked next depends on the answers. The proof of
 * ownership and the person's own account come on the next page, where the claim already exists and can be finished later.
 * With `edit` it opens a draft in the same form, filled in with what was entered, and saves over it.
 * @param props - The form props.
 * @param props.edit - The draft to edit and its saved answers; leave out to start a new claim.
 * @returns The form.
 */
export function NewClaimForm(props: { edit?: { id: string; defaults: ClaimDefaults } }) {
  const t = useTranslations('ClaimPage');
  const { state, onSubmit, pending } = useFormAction(
    props.edit ? updateClaim.bind(null, props.edit.id) : createClaim,
    { errors: [] },
  );
  const [fraudTypes, setFraudTypes] = React.useState<FraudType[]>(
    props.edit?.defaults.fraudTypes ?? [],
  );
  const [method, setMethod] = React.useState<PaymentMethod>(
    props.edit?.defaults.paymentMethod ?? 'wallet',
  );
  const [step, setStep] = React.useState(1);
  const [forward, setForward] = React.useState(true);
  const [seen, setSeen] = React.useState(state);
  const formRef = React.useRef<HTMLFormElement>(null);
  const last = step === claimFormSteps;

  // A refused form goes back to the first step with something to fix.
  if (state !== seen) {
    setSeen(state);
    // The loss transaction is on the payment step, unless it is optional extra detail of a wallet payment.
    const refused = state.errors.map((name) =>
      name === 'txHash' && method === 'wallet' ? 3 : (fieldSteps[name] ?? claimFormSteps),
    );

    if (refused.length > 0) {
      setForward(false);
      setStep(Math.min(...refused));
    }
  }

  const go = (to: number) => {
    setForward(to > step);
    setStep(to);
  };

  return (
    <form
      className={cn('mx-auto grid w-full gap-3', step === 1 ? 'max-w-5xl' : 'max-w-2xl')}
      noValidate
      ref={formRef}
      onSubmit={(event) => {
        // Only the last step can send. Anything else that submits the form is ignored, not treated as "next".
        if (last) {
          onSubmit(event);

          return;
        }

        event.preventDefault();
      }}
    >
      <ClaimProgress step={step} total={claimFormSteps} />

      <StepSlot current={step === 1} forward={forward}>
        <WhatHappenedSection
          value={fraudTypes}
          onChange={setFraudTypes}
          invalid={state.errors.includes('fraudTypes')}
        />
      </StepSlot>
      <StepSlot current={step === 2} forward={forward}>
        <HowYouPaidSection
          method={method}
          onMethodChange={setMethod}
          errors={state.errors}
          defaults={props.edit?.defaults}
        />
      </StepSlot>
      <StepSlot current={step === 3} forward={forward}>
        <PaymentDetailsSection
          fromWallet={method === 'wallet'}
          errors={state.errors}
          defaults={props.edit?.defaults}
        />
      </StepSlot>
      <StepSlot current={step === 4} forward={forward}>
        <WhoSection fraudTypes={fraudTypes} errors={state.errors} defaults={props.edit?.defaults} />
      </StepSlot>
      <StepSlot current={step === 5} forward={forward}>
        <MoreDetailsSection defaults={props.edit?.defaults} />
      </StepSlot>

      <FieldMessage show={last && state.errors.includes('duplicate')}>
        {t('error_duplicate')}
      </FieldMessage>

      <div className="flex justify-center gap-4">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              go(step - 1);
            }}
          >
            {t('back')}
          </Button>
        )}
        {/* No button in this form is a submit button, so pressing Enter in a field can never move or send it: only a click on
            these buttons does. The last one sends the form itself. */}
        {last ? (
          <Button
            key="send"
            type="button"
            size="lg"
            disabled={pending || fraudTypes.length === 0}
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
          >
            {props.edit ? t('save_changes') : t('create')}
          </Button>
        ) : (
          <Button
            key="next"
            type="button"
            size="lg"
            disabled={fraudTypes.length === 0}
            onClick={() => {
              go(step + 1);
            }}
          >
            {t('next')}
          </Button>
        )}
      </div>
    </form>
  );
}
