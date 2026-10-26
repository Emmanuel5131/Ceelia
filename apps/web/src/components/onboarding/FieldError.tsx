'use client';

import { useTranslations } from 'next-intl';

/**
 * The message under a field that failed validation. It renders nothing when the field is fine.
 * @param props - The error props.
 * @param props.show - Whether the field has an error.
 * @returns The message, or nothing.
 */
export function FieldError(props: { show: boolean }) {
  const t = useTranslations('OnboardingPage');

  return props.show ? (
    <p role="alert" className="text-sm text-seal">
      {t('error_required')}
    </p>
  ) : null;
}
