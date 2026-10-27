'use client';

import { fraudTypes } from '@celia/core';
import type { FraudType } from '@celia/core';
import {
  BankIcon,
  BriefcaseIcon,
  ChartLineUpIcon,
  CoinsIcon,
  CopyIcon,
  DotsThreeIcon,
  KeyIcon,
  LockIcon,
  LifebuoyIcon,
  MaskHappyIcon,
  WalletIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { FormStep } from '@/components/claims/FormStep';
import { MultiChoiceCards } from '@/components/ui/choice-cards';

const typeIcons = {
  investment_platform: ChartLineUpIcon,
  rug_pull: CoinsIcon,
  exchange_service: BankIcon,
  impersonation: MaskHappyIcon,
  recovery_scam: LifebuoyIcon,
  wallet_drained: WalletIcon,
  address_poisoning: CopyIcon,
  honeypot_token: LockIcon,
  extortion: WarningIcon,
  fake_job: BriefcaseIcon,
  account_takeover: KeyIcon,
  other: DotsThreeIcon,
} as const;

/**
 * The first question of a claim: what happened, in plain words. More than one can fit, so the person ticks every one that does.
 * The answers decide what is asked next.
 * @param props - The section props.
 * @param props.value - The kinds of loss chosen so far.
 * @param props.onChange - Called when the person ticks or unticks one.
 * @param props.invalid - Whether the server refused the form for a missing answer.
 * @returns The section.
 */
export function WhatHappenedSection(props: {
  value: FraudType[];
  onChange: (value: FraudType[]) => void;
  invalid: boolean;
}) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();

  const options = fraudTypes.map((type) => {
    const Icon = typeIcons[type];

    return {
      value: type,
      title: labels.fraudType[type],
      description: labels.fraudTypeText[type],
      icon: <Icon className="size-6" aria-hidden="true" />,
    };
  });

  return (
    <FormStep step={1} title={t('q_what')}>
      <MultiChoiceCards
        name="fraudType"
        label={t('q_what')}
        options={options}
        value={props.value}
        onChange={props.onChange}
        columns={4}
      />
      <p className="text-center text-xs text-ink-muted">{t('q_what_note')}</p>
      <FieldMessage show={props.invalid}>{t('error_choose')}</FieldMessage>
    </FormStep>
  );
}
