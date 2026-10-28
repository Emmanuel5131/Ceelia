'use client';

import { useTranslations } from 'next-intl';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { FormStep } from '@/components/claims/FormStep';
import { TxHashField } from '@/components/claims/TxHashField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * A question about the payment itself, all of it optional, to help trace the money: where it went, when, and what was sent. A
 * wallet payment also asks for the transaction that sent it, which the other ways of paying already gave on the step before.
 * @param props - The section props.
 * @param props.fromWallet - Whether the money left from the person's own wallet.
 * @param props.onChain - Whether the money moved on a chain; a bank or card payment did not.
 * @param props.errors - The names of the fields the server refused.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @param props.step - Which step this is.
 * @param props.total - How many steps the form has for this claim.
 * @returns The section.
 */
export function PaymentDetailsSection(props: {
  fromWallet: boolean;
  onChain: boolean;
  errors: string[];
  defaults?: ClaimDefaults;
  step: number;
  total: number;
}) {
  const t = useTranslations('ClaimPage');
  const { defaults } = props;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormStep step={props.step} total={props.total} title={t('q_payment_more')}>
      {props.fromWallet && (
        <TxHashField
          label={t('tx_label_optional')}
          defaultValue={defaults?.txHash}
          invalid={props.errors.includes('txHash')}
        />
      )}
      {props.onChain && (
        <div className="grid gap-2">
          <Label htmlFor="destinationAddress">{t('destination_label')}</Label>
          <Input
            id="destinationAddress"
            name="destinationAddress"
            defaultValue={defaults?.destinationAddress}
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={props.errors.includes('destinationAddress')}
          />
          <p className="text-sm text-ink-muted">{t('destination_hint')}</p>
          <FieldMessage show={props.errors.includes('destinationAddress')}>
            {t('error_address')}
          </FieldMessage>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {(['firstPaymentOn', 'lastPaymentOn'] as const).map((name) => (
          <div key={name} className="grid content-start gap-2">
            <Label htmlFor={name}>
              {name === 'firstPaymentOn' ? t('first_payment_label') : t('last_payment_label')}
            </Label>
            <Input
              id={name}
              name={name}
              type="date"
              max={today}
              defaultValue={defaults?.[name]}
              aria-invalid={props.errors.includes(name)}
            />
            <FieldMessage show={props.errors.includes(name)}>{t('error_date')}</FieldMessage>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="assetSent">{t('asset_label')}</Label>
        <Input
          id="assetSent"
          name="assetSent"
          defaultValue={defaults?.assetSent}
          placeholder={t('asset_placeholder')}
          autoComplete="off"
        />
      </div>
    </FormStep>
  );
}
