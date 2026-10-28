'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * The actions for a selection of rows in a review table: confirm them all, or decline them all with one reason. Both ask first,
 * saying how many are affected, because a selection is easy to make larger than meant. The decline needs a reason, which each
 * person sees.
 * @param props - The actions props.
 * @param props.count - How many rows are selected.
 * @param props.onSettle - Applies the decision to the selection; it resolves to an error name when the server refused.
 * @returns The two buttons and their dialog.
 */
export function BulkDecision(props: {
  count: number;
  onSettle: (decision: 'confirm' | 'decline', note: string) => Promise<string | null>;
}) {
  const t = useTranslations('Staff');
  const [asking, setAsking] = React.useState<'confirm' | 'decline' | null>(null);
  const [note, setNote] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const apply = () => {
    if (!asking) {
      return;
    }

    if (asking === 'decline' && note.trim() === '') {
      setError('note');

      return;
    }

    startTransition(async () => {
      const refused = await props.onSettle(asking, note);

      setError(refused);

      if (!refused) {
        setAsking(null);
        setNote('');
      }
    });
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setAsking('confirm');
        }}
      >
        {t('bulk_confirm', { count: props.count })}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setAsking('decline');
        }}
      >
        {t('bulk_decline', { count: props.count })}
      </Button>
      <AlertDialog
        open={asking !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAsking(null);
            setError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {asking === 'decline'
                ? t('bulk_decline_title', { count: props.count })
                : t('bulk_confirm_title', { count: props.count })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {asking === 'decline' ? t('bulk_decline_text') : t('bulk_confirm_text')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {asking === 'decline' && (
            <div className="grid gap-2">
              <Label htmlFor="bulk-note">{t('review_reason')}</Label>
              <Textarea
                id="bulk-note"
                rows={3}
                value={note}
                aria-invalid={error === 'note'}
                onChange={(event) => {
                  setNote(event.target.value);
                }}
              />
              {error === 'note' && (
                <p role="alert" className="text-sm text-seal">
                  {t('review_reason_required')}
                </p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{t('bulk_cancel')}</AlertDialogCancel>
            <Button disabled={pending} onClick={apply}>
              {asking === 'decline' ? t('bulk_decline_action') : t('bulk_confirm_action')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
