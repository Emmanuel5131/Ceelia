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
 * The "Delete draft" button and the confirmation behind it. Only a draft can be deleted: once a claim is sent it is part of a
 * case, so the page never offers this for it, and the server refuses it all the same.
 * @param props - The dialog props.
 * @param props.action - The server action that deletes the draft and leaves the page.
 * @param props.compact - Show an icon button for a table row instead of the labelled button.
 * @returns The button and its confirmation.
 */
export function DeleteClaimDialog(props: { action: () => Promise<ClaimState>; compact?: boolean }) {
  const t = useTranslations('ClaimPage');
  const [failed, setFailed] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  return (
    <AlertDialog
      onOpenChange={() => {
        setFailed(false);
      }}
    >
      <AlertDialogTrigger asChild>
        {props.compact ? (
          <Button variant="ghost" size="icon-sm">
            <TrashIcon aria-hidden="true" />
            <span className="sr-only">{t('delete_action')}</span>
          </Button>
        ) : (
          <Button variant="destructive" className="justify-self-center">
            <TrashIcon aria-hidden="true" />
            {t('delete_action')}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete_title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('delete_text')}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-seal">
            {t('delete_failed')}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{t('delete_keep')}</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                // A successful delete redirects away, so only a refusal comes back here.
                const result = await props.action();
                setFailed(result.errors.length > 0);
              });
            }}
          >
            {t('delete_confirm')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
