'use client';

import { CheckCircleIcon, CopyIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { ClaimState } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormAction } from '@/hooks/use-form-action';

/**
 * The ownership step: the person signs a message with their wallet and pastes the signature back. The message names the
 * wallet and carries a one-time nonce and moves no funds. Chains we cannot check yet show a notice instead of the form.
 * @param props - The card props.
 * @param props.message - The exact text to sign.
 * @param props.signed - Whether ownership is already confirmed.
 * @param props.canVerify - Whether we can check signatures on this chain.
 * @param props.action - The server action that checks the signature.
 * @returns The card.
 */
export function OwnershipCard(props: {
  message: string;
  signed: boolean;
  canVerify: boolean;
  action: (state: ClaimState, formData: FormData) => Promise<ClaimState>;
}) {
  const t = useTranslations('ClaimPage');
  const { state, onSubmit, pending } = useFormAction(props.action, { errors: [] });
  const [copied, setCopied] = React.useState(false);

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-sans text-base font-medium">
          {props.signed && <CheckCircleIcon className="size-5" aria-hidden="true" />}
          {props.signed ? t('ownership_done') : t('ownership_title')}
        </CardTitle>
        {!props.signed && <CardDescription>{t('ownership_text')}</CardDescription>}
      </CardHeader>
      {!props.signed && (
        <CardContent className="grid gap-4">
          {props.canVerify ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="message">{t('message_label')}</Label>
                <pre
                  id="message"
                  className="overflow-x-auto bg-paper p-4 font-mono text-xs whitespace-pre-wrap"
                >
                  {props.message}
                </pre>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  onClick={async () => {
                    await navigator.clipboard.writeText(props.message);
                    setCopied(true);
                  }}
                >
                  <CopyIcon aria-hidden="true" />
                  {copied ? t('copied') : t('copy')}
                </Button>
              </div>
              <form className="grid gap-4" noValidate onSubmit={onSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="signature">{t('signature_label')}</Label>
                  <Textarea
                    id="signature"
                    name="signature"
                    rows={3}
                    className="font-mono"
                    spellCheck={false}
                    aria-invalid={state.errors.includes('signature')}
                  />
                  <p className="text-sm text-ink-muted">{t('signature_hint')}</p>
                  {state.errors.includes('signature') && (
                    <p role="alert" className="text-sm text-seal">
                      {t('ownership_failed')}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={pending} className="justify-self-start">
                  {t('verify')}
                </Button>
              </form>
            </>
          ) : (
            <p className="text-sm text-ink-muted">{t('ownership_unsupported')}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
