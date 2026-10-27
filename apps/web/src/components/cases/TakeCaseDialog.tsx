'use client';

import { maxOpenCasesPerLawyer } from '@celia/core';
import type { TakeCaseRefusal } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { takeCaseAction } from '@/app/[locale]/(auth)/dashboard/cases/[id]/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

/**
 * The "Take this case" button and the confirmation behind it. The lawyer confirms their firm checked for conflicts; the server
 * decides everything else, and says why when the answer is no.
 * @param props - The dialog props.
 * @param props.caseId - The case to take.
 * @returns The button and its dialog.
 */
export function TakeCaseDialog(props: { caseId: string }) {
  const t = useTranslations('CaseDetail');
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<TakeCaseRefusal | null>(null);
  const [pending, startTransition] = React.useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setReason(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg">{t('take_action')}</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);

            startTransition(async () => {
              const result = await takeCaseAction(props.caseId, data);
              setReason(result.reason);

              if (result.reason === null) {
                setOpen(false);
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('take_title')}</DialogTitle>
            <DialogDescription>{t('take_text')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3">
            <Checkbox id="conflicts" name="conflicts" className="mt-1" />
            <Label htmlFor="conflicts" className="leading-relaxed font-normal">
              {t('conflicts_label')}
            </Label>
          </div>
          {reason && (
            <p role="alert" className="text-sm text-seal">
              {t(`refusal_${reason}`, { max: maxOpenCasesPerLawyer })}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {t('take_confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
