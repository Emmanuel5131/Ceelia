'use client';

import type { FraudType } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { ClaimState } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { RichTextEditor } from '@/components/claims/RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useFormAction } from '@/hooks/use-form-action';

// The shortest account the server accepts, so a save is only tried once it can succeed.
const statementMinLength = 20;

/**
 * The person's own account: what they were promised, by whom and where, what they paid, and what happened when they tried to
 * withdraw. The chain cannot show this, so the file lists it as a victim report, not confirmed. There is no save button: it saves
 * itself a moment after they stop typing, and when they leave the writing area, once it is long enough to be an account.
 * @param props - The card props.
 * @param props.statement - The saved account, if any.
 * @param props.fraudType - What kind of loss it is, which decides what the hint asks them to cover.
 * @param props.action - The server action that saves it.
 * @returns The card.
 */
export function StatementCard(props: {
  statement: string | null;
  fraudType: FraudType;
  action: (state: ClaimState, formData: FormData) => Promise<ClaimState>;
}) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();
  const { state, submit, pending } = useFormAction(props.action, { errors: [] });
  const [short, setShort] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = React.useRef(props.statement ?? '');
  const saved = React.useRef(props.statement ?? '');

  const stop = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const save = () => {
    stop();

    if (latest.current.trim().length < statementMinLength || latest.current === saved.current) {
      return;
    }

    saved.current = latest.current;
    const data = new FormData();
    data.set('statement', latest.current);
    submit(data);
  };

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle className="font-sans text-base font-medium">{t('statement_title')}</CardTitle>
        <CardDescription>{labels.statementHint[props.fraudType]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2" onBlur={save}>
            <Label id="statement-label">{t('statement_label')}</Label>
            <RichTextEditor
              labelId="statement-label"
              name="statement"
              defaultValue={props.statement ?? ''}
              invalid={state.errors.includes('statement')}
              onChange={(value) => {
                latest.current = value;
                setShort(value.trim().length < statementMinLength);
                stop();
                timer.current = setTimeout(save, 1000);
              }}
            />
            {state.errors.includes('statement') && (
              <p role="alert" className="text-sm text-seal">
                {t('error_statement')}
              </p>
            )}
          </div>
          <output className="text-sm text-ink-muted">
            {pending && t('statement_saving')}
            {!pending && short && t('statement_autosave_hint')}
            {!pending && !short && state.done && t('statement_saved')}
          </output>
        </div>
      </CardContent>
    </Card>
  );
}
