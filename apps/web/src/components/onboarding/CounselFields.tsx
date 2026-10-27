'use client';

import { useTranslations } from 'next-intl';
import { FieldError } from '@/components/onboarding/FieldError';
import { PracticeFields } from '@/components/onboarding/PracticeFields';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * The details a lawyer gives in onboarding: the practice, and their agreement to the terms. Staff check the registrations before
 * any claimant detail is shown.
 * @param props - The fields props.
 * @param props.errors - The names of the fields that failed.
 * @returns The fields.
 */
export function CounselFields(props: { errors: string[] }) {
  const t = useTranslations('OnboardingPage');

  return (
    <div className="grid gap-8">
      <PracticeFields errors={props.errors} />

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
