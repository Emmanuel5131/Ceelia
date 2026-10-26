'use client';

import { BankIcon, UserIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

  const options = [
    {
      value: 'person',
      icon: UserIcon,
      title: t('type_person_title'),
      description: t('type_person_description'),
    },
    {
      value: 'counsel',
      icon: BankIcon,
      title: t('type_counsel_title'),
      description: t('type_counsel_description'),
    },
  ] as const;

  return (
    <RadioGroup
      aria-label={t('title')}
      value={props.value ?? ''}
      onValueChange={(value) => {
        if (value === 'person' || value === 'counsel') {
          props.onChange(value);
        }
      }}
      className="gap-4"
    >
      {options.map((option) => (
        <label key={option.value} htmlFor={`account-${option.value}`} className="cursor-pointer">
          <Card
            variant="outline"
            className="flex-row items-start gap-4 px-6 py-5 transition-colors hover:bg-paper has-data-[state=checked]:border-ink"
          >
            <RadioGroupItem id={`account-${option.value}`} value={option.value} className="mt-1" />
            <CardHeader className="min-w-0 flex-1 gap-1 px-0">
              <CardTitle className="flex items-center gap-3 font-sans text-base font-medium">
                <option.icon className="size-5" aria-hidden="true" />
                {option.title}
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
          </Card>
        </label>
      ))}
    </RadioGroup>
  );
}
