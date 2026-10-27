'use client';

import { useTranslations } from 'next-intl';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * The transaction hash of the payment: required when the money did not leave from the person's own wallet, optional when it did.
 * @param props - The field props.
 * @param props.label - The label, which says whether it is optional.
 * @param props.defaultValue - The saved hash, when a draft is being edited.
 * @param props.invalid - Whether the server refused it.
 * @returns The field.
 */
export function TxHashField(props: { label: string; defaultValue?: string; invalid: boolean }) {
  const t = useTranslations('ClaimPage');

  return (
    <div className="grid gap-2">
      <Label htmlFor="txHash">{props.label}</Label>
      <Input
        id="txHash"
        name="txHash"
        defaultValue={props.defaultValue}
        className="font-mono"
        autoComplete="off"
        spellCheck={false}
        aria-invalid={props.invalid}
      />
      <p className="text-sm text-ink-muted">{t('tx_hint')}</p>
      <FieldMessage show={props.invalid}>{t('error_tx')}</FieldMessage>
    </div>
  );
}
