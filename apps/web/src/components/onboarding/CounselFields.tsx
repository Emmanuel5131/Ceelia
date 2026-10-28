'use client';

import { BankIcon, MagnifyingGlassIcon, BuildingsIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { FieldError } from '@/components/onboarding/FieldError';
import { PracticeFields } from '@/components/onboarding/PracticeFields';
import { Checkbox } from '@/components/ui/checkbox';
import type { ChoiceOption } from '@/components/ui/choice-cards';
import { ChoiceCards } from '@/components/ui/choice-cards';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InstitutionKind } from '@/utils/accounts/Institution';

/**
 * The details a lawyer gives in onboarding: the practice, and their agreement to the terms. Staff check the registrations before
 * any claimant detail is shown.
 * @param props - The fields props.
 * @param props.errors - The names of the fields that failed.
 * @param props.defaults - What the applicant gave before, when applying again.
 * @returns The fields.
 */
export function CounselFields(props: {
  errors: string[];
  defaults?: {
    kind: InstitutionKind;
    registrationNumber: string | null;
    website: string | null;
    contactRole: string | null;
    firm: string | null;
    jurisdictions: string[];
  };
}) {
  const t = useTranslations('OnboardingPage');
  const [kind, setKind] = React.useState<InstitutionKind>(props.defaults?.kind ?? 'law_firm');
  const kinds: ChoiceOption<InstitutionKind>[] = [
    {
      value: 'law_firm',
      icon: <BankIcon className="size-5" aria-hidden="true" />,
      title: t('kind_law_firm_title'),
      description: t('kind_law_firm_description'),
    },
    {
      value: 'investigative',
      icon: <MagnifyingGlassIcon className="size-5" aria-hidden="true" />,
      title: t('kind_investigative_title'),
      description: t('kind_investigative_description'),
    },
    {
      value: 'other',
      icon: <BuildingsIcon className="size-5" aria-hidden="true" />,
      title: t('kind_other_title'),
      description: t('kind_other_description'),
    },
  ];

  return (
    <div className="grid gap-8">
      <input type="hidden" name="kind" value={kind} />
      <ChoiceCards
        name="kindChoice"
        label={t('kind_label')}
        options={kinds}
        value={kind}
        onChange={setKind}
      />
      <PracticeFields
        errors={props.errors}
        defaults={
          props.defaults && {
            firm: props.defaults.firm,
            jurisdictions: props.defaults.jurisdictions,
          }
        }
      />

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="registrationNumber">{t('registration_number_label')}</Label>
          <Input
            id="registrationNumber"
            name="registrationNumber"
            defaultValue={props.defaults?.registrationNumber ?? ''}
            aria-invalid={props.errors.includes('registrationNumber')}
          />
          <p className="text-sm text-ink-muted">{t('registration_number_hint')}</p>
          <FieldError show={props.errors.includes('registrationNumber')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="website">{t('website_label')}</Label>
          <Input
            id="website"
            name="website"
            defaultValue={props.defaults?.website ?? ''}
            inputMode="url"
            placeholder="https://"
            aria-invalid={props.errors.includes('website')}
          />
          <p className="text-sm text-ink-muted">{t('website_hint')}</p>
          <FieldError show={props.errors.includes('website')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactRole">{t('role_label')}</Label>
          <Input
            id="contactRole"
            name="contactRole"
            defaultValue={props.defaults?.contactRole ?? ''}
            autoComplete="organization-title"
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-start gap-3">
            <Checkbox id="acceptTerms" name="acceptTerms" className="mt-1" />
            <Label htmlFor="acceptTerms" className="leading-relaxed font-normal">
              {t('terms_label')}
            </Label>
          </div>
          <FieldError show={props.errors.includes('acceptTerms')} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-start gap-3">
            <Checkbox id="confirmConflicts" name="confirmConflicts" className="mt-1" />
            <Label htmlFor="confirmConflicts" className="leading-relaxed font-normal">
              {t('conflicts_label')}
            </Label>
          </div>
          <FieldError show={props.errors.includes('confirmConflicts')} />
        </div>
      </div>
    </div>
  );
}
