'use client';

import { fraudTypes } from '@celia/core';
import type { FraudType } from '@celia/core';
import {
  BankIcon,
  ChartLineUpIcon,
  CoinsIcon,
  DotsThreeIcon,
  LifebuoyIcon,
  MaskHappyIcon,
  WalletIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { ChoiceCards } from '@/components/ui/choice-cards';

const typeIcons = {
  investment_platform: ChartLineUpIcon,
  rug_pull: CoinsIcon,
  exchange_service: BankIcon,
  impersonation: MaskHappyIcon,
  recovery_scam: LifebuoyIcon,
  wallet_drained: WalletIcon,
  other: DotsThreeIcon,
} as const;

/**
 * The first question of a claim: what happened, in plain words. The answer decides what is asked next.
 * @param props - The section props.
 * @param props.value - The chosen kind of loss, if any.
 * @param props.onChange - Called when the person picks one.
 * @param props.invalid - Whether the server refused the form for a missing answer.
 * @returns The section.
 */
export function WhatHappenedSection(props: {
  value: FraudType | undefined;
  onChange: (value: FraudType) => void;
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
      icon: <Icon className="size-5" aria-hidden="true" />,
    };
  });

  return (
    <section className="grid gap-4">
      <h2 className="text-xl">{t('q_what')}</h2>
      <ChoiceCards
        name="fraudType"
        label={t('q_what')}
        options={options}
        value={props.value}
        onChange={props.onChange}
      />
      <p className="text-sm text-ink-muted">{t('q_what_note')}</p>
      <FieldMessage show={props.invalid}>{t('error_choose')}</FieldMessage>
    </section>
  );
}
