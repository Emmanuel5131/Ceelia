'use client';

import { TrashIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { ClaimState } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

/**
 * The "Delete selected" button for the claims table and the confirmation behind it. It deletes only the drafts among the
 * selected claims; the server skips anything that is not the person's own draft.
 * @param props - The dialog props.
 * @param props.count - How many drafts will be deleted.
 * @param props.action - The server action that deletes them.
 * @returns The button and its confirmation.
 */
export function DeleteDraftsDialog(props: { count: number; action: () => Promise<ClaimState> }) {
  const t = useTranslations('ClaimList');
  const claimPage = useTranslations('ClaimPage');
  const [open, setOpen] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setFailed(false);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <TrashIcon aria-hidden="true" />
          {t('delete_selected', { count: props.count })}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete_selected_title', { count: props.count })}</AlertDialogTitle>
          <AlertDialogDescription>{t('delete_selected_text')}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-seal">
            {claimPage('delete_failed')}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{claimPage('delete_keep')}</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await props.action();
                setFailed(result.errors.length > 0);
                setOpen(result.errors.length > 0);
              });
            }}
          >
            {t('delete_selected', { count: props.count })}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
