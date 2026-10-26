'use client';

import { useTranslations } from 'next-intl';
import { FieldError } from '@/components/onboarding/FieldError';
import { JurisdictionPicker } from '@/components/onboarding/JurisdictionPicker';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * The details a person gives: where they live, and their consent to share the claim with the lawyer who takes the case.
 * @param props - The fields props.
 * @param props.errors - The names of the fields that failed.
 * @returns The fields.
 */
export function PersonFields(props: { errors: string[] }) {
  const t = useTranslations('OnboardingPage');

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <JurisdictionPicker
          name="country"
          kind="country"
          label={t('country_label')}
          placeholder={t('country_placeholder')}
          invalid={props.errors.includes('country')}
        />
        <FieldError show={props.errors.includes('country')} />
      </div>
      <div className="grid gap-2">
        <div className="flex items-start gap-3">
          <Checkbox id="consent" name="consent" className="mt-1" />
          <Label htmlFor="consent" className="leading-relaxed font-normal">
            {t('consent_label')}
          </Label>
        </div>
        <FieldError show={props.errors.includes('consent')} />
      </div>
    </div>
  );
}
