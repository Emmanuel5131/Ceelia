'use client';

import { paymentMethods } from '@celia/core';
import type { PaymentMethod } from '@celia/core';
import { useTranslations } from 'next-intl';
import { ChainSelect } from '@/components/claims/ChainSelect';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * The second question: how the money left. Paying from your own wallet asks for the wallet, which can be proven by signing;
 * every other way asks for the transaction hash, because there is no wallet to sign with.
 * @param props - The section props.
 * @param props.method - How they paid.
 * @param props.onMethodChange - Called when they choose another way.
 * @param props.errors - The names of the fields the server refused.
 * @returns The section.
 */
export function HowYouPaidSection(props: {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  errors: string[];
}) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();
  const fromWallet = props.method === 'wallet';

  return (
    <section className="grid gap-6">
      <h2 className="text-xl">{t('q_pay')}</h2>
      <div className="grid gap-2">
        <Label htmlFor="paymentMethod">{t('pay_label')}</Label>
        <Select
          name="paymentMethod"
          value={props.method}
          onValueChange={(next) => {
            const method = paymentMethods.find((m) => m === next);

            if (method) {
              props.onMethodChange(method);
            }
          }}
        >
          <SelectTrigger id="paymentMethod" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((m) => (
              <SelectItem key={m} value={m}>
                {labels.paymentMethod[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="chain">{fromWallet ? t('chain_label') : t('chain_payment_label')}</Label>
        <ChainSelect id="chain" name="chain" />
      </div>

      {fromWallet && (
        <div className="grid gap-2">
          <Label htmlFor="walletAddress">{t('address_label')}</Label>
          <Input
            id="walletAddress"
            name="walletAddress"
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={props.errors.includes('walletAddress')}
          />
          <p className="text-sm text-ink-muted">{t('address_hint')}</p>
          <FieldMessage show={props.errors.includes('walletAddress')}>
            {t('error_address')}
          </FieldMessage>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="txHash">{fromWallet ? t('tx_label_optional') : t('tx_label')}</Label>
        <Input
          id="txHash"
          name="txHash"
          className="font-mono"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={props.errors.includes('txHash')}
        />
        <p className="text-sm text-ink-muted">{t('tx_hint')}</p>
        <FieldMessage show={props.errors.includes('txHash')}>{t('error_tx')}</FieldMessage>
      </div>
    </section>
  );
}
