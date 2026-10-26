'use client';

import { useTranslations } from 'next-intl';
import type { ClaimState } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormAction } from '@/hooks/use-form-action';

/**
 * The last step: send the claim. Once sent, it shows a confirmation instead.
 * @param props - The card props.
 * @param props.sent - Whether the claim has already been sent.
 * @param props.action - The server action that sends it.
 * @returns The card.
 */
export function SubmitClaimCard(props: { sent: boolean; action: () => Promise<ClaimState> }) {
  const t = useTranslations('ClaimPage');
  const { state, onSubmit, pending } = useFormAction(props.action, { errors: [] });

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle className="font-sans text-base font-medium">
          {props.sent ? t('sent_title') : t('submit_title')}
        </CardTitle>
        <CardDescription>{props.sent ? t('sent_text') : t('submit_text')}</CardDescription>
      </CardHeader>
      {!props.sent && (
        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={onSubmit}>
            {state.errors.includes('statement') && (
              <p role="alert" className="text-sm text-seal">
                {t('error_statement_first')}
              </p>
            )}
            <Button type="submit" disabled={pending} className="justify-self-start">
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
