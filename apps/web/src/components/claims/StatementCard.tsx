'use client';

import { useTranslations } from 'next-intl';
import type { ClaimState } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormAction } from '@/hooks/use-form-action';

/**
 * The person's own account: what they were promised, by whom and where, what they paid, and what happened when they tried to
 * withdraw. The chain cannot show this, so the file lists it as a victim report, not confirmed.
 * @param props - The card props.
 * @param props.statement - The saved account, if any.
 * @param props.action - The server action that saves it.
 * @returns The card.
 */
export function StatementCard(props: {
  statement: string | null;
  action: (state: ClaimState, formData: FormData) => Promise<ClaimState>;
}) {
  const t = useTranslations('ClaimPage');
  const { state, onSubmit, pending } = useFormAction(props.action, { errors: [] });

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle className="font-sans text-base font-medium">{t('statement_title')}</CardTitle>
        <CardDescription>{t('statement_text')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" noValidate onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="statement">{t('statement_label')}</Label>
            <Textarea
              id="statement"
              name="statement"
              rows={8}
              defaultValue={props.statement ?? ''}
              aria-invalid={state.errors.includes('statement')}
            />
            {state.errors.includes('statement') && (
              <p role="alert" className="text-sm text-seal">
                {t('error_statement')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={pending}>
              {t('statement_save')}
            </Button>
            {state.done && (
              <output className="text-sm text-ink-muted">{t('statement_saved')}</output>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
