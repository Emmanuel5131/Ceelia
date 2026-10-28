'use client';

import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { saveCaseOperators } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { JurisdictionPicker } from '@/components/onboarding/JurisdictionPicker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CaseRow } from '@/utils/cases/Case';

/**
 * Where staff record who the claimants allege ran a platform: notes with names and links, and the jurisdictions the operators
 * are linked to, such as where a company is registered. It records what is alleged. The server refuses words that declare fraud.
 * @param props - The dialog props.
 * @param props.row - The case.
 * @returns The button and its dialog.
 */
export function OperatorsDialog(props: { row: CaseRow }) {
  const t = useTranslations('Staff');
  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [pending, startTransition] = React.useTransition();
  const initialRows = props.row.operatorJurisdictions.map((id, key) => ({ key, id }));
  const nextRow = React.useRef(initialRows.length);
  const [rows, setRows] = React.useState<{ key: number; id: string | undefined }[]>(initialRows);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setErrors([]);
        setRows(initialRows);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {props.row.operators ? t('operators_edit') : t('operators_add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <form
          className="grid gap-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);

            startTransition(async () => {
              const result = await saveCaseOperators(props.row.id, data);
              setErrors(result);

              if (result.length === 0) {
                setOpen(false);
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('operators_title', { name: props.row.name })}</DialogTitle>
            <DialogDescription>{t('operators_text')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`operators-${props.row.id}`}>{t('operators_label')}</Label>
            <Textarea
              id={`operators-${props.row.id}`}
              name="operators"
              rows={8}
              defaultValue={props.row.operators ?? ''}
              aria-invalid={errors.length > 0}
            />
          </div>
          <fieldset className="grid gap-4">
            <legend className="mb-2 text-sm font-medium">{t('operators_places_label')}</legend>
            {rows.map((row) => (
              <div key={row.key} className="grid gap-2 border border-border p-3">
                <JurisdictionPicker
                  name="jurisdictions"
                  label={t('operators_place_label')}
                  placeholder={t('operators_place_placeholder')}
                  defaultId={row.id}
                  invalid={errors.includes('jurisdictions')}
                />
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
                  {t('operators_place_remove')}
                </Button>
              </div>
            ))}
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
              {t('operators_place_add')}
            </Button>
          </fieldset>
          {errors.length > 0 && (
            <p role="alert" className="text-sm text-seal">
              {errors.includes('words') && t('operators_error_words')}
              {errors.includes('operators') && t('operators_error_length')}
              {errors.includes('jurisdictions') && t('operators_error_places')}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {t('operators_save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
