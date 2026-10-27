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
 * The practice a lawyer describes: the firm (or independent practice) and every jurisdiction they are admitted in. Onboarding
 * and the settings page share it; settings passes what the lawyer gave before.
 * @param props - The fields props.
 * @param props.errors - The names of the fields that failed.
 * @param props.defaults - What the lawyer gave before: the firm (null when independent) and the jurisdiction ids.
 * @returns The fields.
 */
export function PracticeFields(props: {
  errors: string[];
  defaults?: { firm: string | null; jurisdictions: string[] };
}) {
  const t = useTranslations('OnboardingPage');
  const initialRows = (props.defaults?.jurisdictions ?? [undefined]).map((id, key) => ({
    key,
    id,
  }));
  const nextRow = React.useRef(initialRows.length);
  const [independent, setIndependent] = React.useState(
    props.defaults ? props.defaults.firm === null : false,
  );
  const [rows, setRows] = React.useState(initialRows);

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
              defaultValue={props.defaults?.firm ?? ''}
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
          <div key={row.key} className="grid gap-4 border border-border p-4">
            <JurisdictionPicker
              name="registrationJurisdiction"
              label={t('jurisdiction_label')}
              placeholder={t('jurisdiction_placeholder')}
              defaultId={row.id}
              invalid={props.errors.includes('registrations')}
            />
            {rows.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={() => {
                  setRows(rows.filter((r) => r.key !== row.key));
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
            setRows([...rows, { key: nextRow.current, id: undefined }]);
            nextRow.current += 1;
          }}
        >
          <PlusIcon aria-hidden="true" />
          {t('add_registration')}
        </Button>
      </fieldset>
    </div>
  );
}
