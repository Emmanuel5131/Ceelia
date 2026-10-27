'use client';

import { BankIcon, UserIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import type { ChoiceOption } from '@/components/ui/choice-cards';
import { ChoiceCards } from '@/components/ui/choice-cards';
import type { AccountType } from '@/utils/Account';

/**
 * The first onboarding question: report a loss, or join as a lawyer or firm.
 * @param props - The choice props.
 * @param props.value - The chosen type, if any.
 * @param props.onChange - Called when the person picks one.
 * @returns The two options.
 */
export function AccountTypeChoice(props: {
  value: AccountType | undefined;
  onChange: (value: AccountType) => void;
}) {
  const t = useTranslations('OnboardingPage');

  const options: ChoiceOption<AccountType>[] = [
    {
      value: 'person',
      icon: <UserIcon className="size-5" aria-hidden="true" />,
      title: t('type_person_title'),
      description: t('type_person_description'),
    },
    {
      value: 'counsel',
      icon: <BankIcon className="size-5" aria-hidden="true" />,
      title: t('type_counsel_title'),
      description: t('type_counsel_description'),
    },
  ];

  return (
    <ChoiceCards
      name="accountTypeChoice"
      label={t('title')}
      options={options}
      value={props.value}
      onChange={props.onChange}
    />
  );
}
