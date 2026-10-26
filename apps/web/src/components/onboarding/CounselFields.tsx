'use client';

import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { FieldError } from '@/components/onboarding/FieldError';
import { JurisdictionPicker } from '@/components/onboarding/JurisdictionPicker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * The details a lawyer gives: the firm (or independent practice), every jurisdiction they are admitted in with the registration
 * number, and their agreement to the terms. Staff check the registrations before any claimant detail is shown.
 * @param props - The fields props.
 * @param props.errors - The names of the fields that failed.
 * @returns The fields.
 */
export function CounselFields(props: { errors: string[] }) {
  const t = useTranslations('OnboardingPage');
  const nextRow = React.useRef(1);
  const [independent, setIndependent] = React.useState(false);
  const [rows, setRows] = React.useState([0]);

  return (
    <div className="grid gap-8">
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="independent"
            name="independent"
            checked={independent}
            onCheckedChange={(checked) => {
              setIndependent(checked === true);
            }}
          />
          <Label htmlFor="independent" className="font-normal">
            {t('independent_label')}
          </Label>
        </div>
        {!independent && (
          <div className="grid gap-2">
            <Label htmlFor="firmName">{t('firm_label')}</Label>
            <Input
              id="firmName"
              name="firmName"
              placeholder={t('firm_placeholder')}
              aria-invalid={props.errors.includes('firmName')}
              autoComplete="organization"
            />
            <FieldError show={props.errors.includes('firmName')} />
          </div>
        )}
      </div>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-base font-medium">{t('registrations_title')}</legend>
        {rows.map((row) => (
          <div key={row} className="grid gap-4 border border-border p-4">
            <JurisdictionPicker
              name="registrationJurisdiction"
              label={t('jurisdiction_label')}
              placeholder={t('jurisdiction_placeholder')}
              invalid={props.errors.includes('registrations')}
            />
            <div className="grid gap-2">
              <Label htmlFor={`number-${row}`}>{t('number_label')}</Label>
              <Input
                id={`number-${row}`}
                name="registrationNumber"
                aria-invalid={props.errors.includes('registrations')}
                autoComplete="off"
              />
            </div>
            {rows.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={() => {
                  setRows(rows.filter((r) => r !== row));
                }}
              >
                <TrashIcon aria-hidden="true" />
                {t('remove_registration')}
              </Button>
            )}
          </div>
        ))}
        <FieldError show={props.errors.includes('registrations')} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            setRows([...rows, nextRow.current]);
            nextRow.current += 1;
          }}
        >
          <PlusIcon aria-hidden="true" />
          {t('add_registration')}
        </Button>
      </fieldset>

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
