'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { verifyIdentity } from '@/app/[locale]/(auth)/dashboard/verify/actions';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChoiceCards } from '@/components/ui/choice-cards';
import type { ChoiceOption } from '@/components/ui/choice-cards';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/hooks/use-form-action';

type DocumentType = 'national_id' | 'drivers_license';

function PhotoField(props: {
  name: 'front' | 'back' | 'selfie';
  label: string;
  capture: 'user' | 'environment';
  invalid: boolean;
}) {
  const t = useTranslations('VerifyPage');

  return (
    <div className="grid gap-2">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input
        id={props.name}
        name={props.name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={props.capture}
        aria-invalid={props.invalid}
      />
      <FieldMessage show={props.invalid}>{t('error_photo')}</FieldMessage>
    </div>
  );
}

/**
 * The one-time identity check: the kind of ID, a photo of its front and back, a selfie, and the person's agreement. Celia passes
 * the photos to Idswyft and keeps only the result.
 * @returns The form.
 */
export function IdentityForm() {
  const t = useTranslations('VerifyPage');
  const { state, onSubmit, pending } = useFormAction(verifyIdentity, { errors: [] });
  const [documentType, setDocumentType] = React.useState<DocumentType>('national_id');
  const options: ChoiceOption<DocumentType>[] = [
    { value: 'national_id', title: t('doc_national_id') },
    { value: 'drivers_license', title: t('doc_drivers_license') },
  ];
  const has = (name: string) => state.errors.includes(name);
  const banner = (() => {
    if (has('rejected')) {
      return t('error_rejected');
    }

    if (has('unavailable')) {
      return t('error_unavailable');
    }

    return has('attempts') ? t('error_attempts') : undefined;
  })();

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle className="font-sans text-base font-medium">{t('form_title')}</CardTitle>
        <CardDescription>{t('form_text')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" noValidate onSubmit={onSubmit}>
          <ChoiceCards
            name="documentType"
            label={t('doc_label')}
            options={options}
            value={documentType}
            onChange={setDocumentType}
          />
          <PhotoField
            name="front"
            label={t('front_label')}
            capture="environment"
            invalid={has('front')}
          />
          <PhotoField
            name="back"
            label={t('back_label')}
            capture="environment"
            invalid={has('back')}
          />
          <PhotoField
            name="selfie"
            label={t('selfie_label')}
            capture="user"
            invalid={has('selfie')}
          />
          <div className="grid gap-2">
            <div className="flex items-start gap-3">
              <Checkbox id="identity-consent" name="consent" className="mt-1" />
              <Label htmlFor="identity-consent" className="leading-relaxed font-normal">
                {t('consent_label')}
              </Label>
            </div>
            <FieldMessage show={has('consent')}>{t('error_consent')}</FieldMessage>
          </div>
          {banner && (
            <p role="alert" className="text-sm text-seal">
              {banner}
            </p>
          )}
          <Button type="submit" disabled={pending} className="justify-self-start">
            {pending ? t('checking') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
