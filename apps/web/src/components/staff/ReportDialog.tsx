'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { saveCaseReport } from '@/app/[locale]/(auth)/dashboard/staff/actions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CaseRow } from '@/utils/Case';

/**
 * Where staff add the findings of an analysis to a case: paste the JSON the analysis produced, and optionally the link to the
 * published method notebook. The server checks the format and the house language and says which went wrong.
 * @param props - The dialog props.
 * @param props.row - The case.
 * @returns The button and its dialog.
 */
export function ReportDialog(props: { row: CaseRow }) {
  const t = useTranslations('Staff');
  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [pending, startTransition] = React.useTransition();
  const [first] = errors;
  const problem = first === 'words' || first === 'json' || first === 'url' ? first : 'schema';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setErrors([]);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {props.row.hasReport ? t('report_update') : t('report_add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <form
          className="grid gap-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);

            startTransition(async () => {
              const result = await saveCaseReport(props.row.id, data);
              setErrors(result);

              if (result.length === 0) {
                setOpen(false);
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('report_title', { name: props.row.name })}</DialogTitle>
            <DialogDescription>{t('report_text')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`report-${props.row.id}`}>{t('report_json_label')}</Label>
            <Textarea
              id={`report-${props.row.id}`}
              name="report"
              rows={12}
              className="font-mono text-xs"
              spellCheck={false}
              aria-invalid={
                errors.includes('json') || errors.includes('schema') || errors.includes('words')
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`notebook-${props.row.id}`}>{t('report_url_label')}</Label>
            <Input
              id={`notebook-${props.row.id}`}
              name="notebookUrl"
              type="url"
              placeholder="https://app.sandwormlab.xyz/…"
              aria-invalid={errors.includes('url')}
            />
          </div>
          {errors.length > 0 && (
            <p role="alert" className="text-sm text-seal">
              {t(`report_error_${problem}`)}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {t('report_save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
