'use client';

import { paidOnChain, paymentMethods } from '@celia/core';
import type { PaymentMethod } from '@celia/core';
import { useTranslations } from 'next-intl';
import { ChainSelect } from '@/components/claims/ChainSelect';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { FormStep } from '@/components/claims/FormStep';
import { TxHashField } from '@/components/claims/TxHashField';
import { WalletFields } from '@/components/claims/WalletFields';
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
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @param props.total - How many steps the form has for this claim.
 * @returns The section.
 */
export function HowYouPaidSection(props: {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  errors: string[];
  defaults?: ClaimDefaults;
  total: number;
}) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();
  const fromWallet = props.method === 'wallet';
  const onChain = paidOnChain(props.method);
  const { defaults } = props;

  return (
    <FormStep step={2} total={props.total} title={t('q_pay')}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-2">
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
            <SelectContent position="popper">
              {paymentMethods.map((m) => (
                <SelectItem key={m} value={m}>
                  {labels.paymentMethod[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {onChain ? (
          <div className="grid content-start gap-2">
            <Label htmlFor="chain">
              {fromWallet ? t('chain_label') : t('chain_payment_label')}
            </Label>
            <ChainSelect id="chain" name="chain" defaultValue={defaults?.chain} />
          </div>
        ) : (
          // A bank or card payment is on no chain; "another chain" is what the claim is filed under.
          <input type="hidden" name="chain" value="other" />
        )}
      </div>

      {fromWallet ? (
        <div className="grid gap-2">
          <Label htmlFor="walletAddress">{t('address_label')}</Label>
          <Input
            id="walletAddress"
            name="walletAddress"
            defaultValue={defaults?.walletAddress}
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={props.errors.includes('walletAddress')}
          />
          {defaults && <p className="text-sm text-ink-muted">{t('address_hint_edit')}</p>}
          <FieldMessage show={props.errors.includes('walletAddress')}>
            {t('error_address')}
          </FieldMessage>
        </div>
      ) : null}
      {fromWallet && <WalletFields errors={props.errors} defaults={defaults} />}
      {!fromWallet && onChain && (
        <TxHashField
          label={t('tx_label_optional')}
          defaultValue={defaults?.txHash}
          invalid={props.errors.includes('txHash')}
        />
      )}
      {!onChain && <p className="text-sm text-ink-muted">{t('pay_offchain_note')}</p>}
    </FormStep>
  );
}
