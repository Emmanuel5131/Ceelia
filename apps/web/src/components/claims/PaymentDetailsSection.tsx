'use client';

import { walletApps, walletTypes } from '@celia/core';
import { useTranslations } from 'next-intl';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { FormStep } from '@/components/claims/FormStep';
import { TxHashField } from '@/components/claims/TxHashField';
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
 * The wallet's own details: which app and what kind of wallet, the transaction that funded it and the one that lost the money.
 * Only asked when the money left from the person's own wallet.
 * @param props - The fields props.
 * @param props.errors - The names of the fields the server refused.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @returns The fields.
 */
function WalletFields(props: { errors: string[]; defaults?: ClaimDefaults }) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();
  const { defaults } = props;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <Label htmlFor="walletApp">{t('wallet_app_label')}</Label>
          <Select name="walletApp" defaultValue={defaults?.walletApp ?? undefined}>
            <SelectTrigger id="walletApp" className="w-full">
              <SelectValue placeholder={t('wallet_app_placeholder')} />
            </SelectTrigger>
            <SelectContent position="popper">
              {walletApps.map((app) => (
                <SelectItem key={app} value={app}>
                  {labels.walletApp[app]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid content-start gap-2">
          <Label htmlFor="walletType">{t('wallet_type_label')}</Label>
          <Select name="walletType" defaultValue={defaults?.walletType ?? undefined}>
            <SelectTrigger id="walletType" className="w-full">
              <SelectValue placeholder={t('wallet_type_placeholder')} />
            </SelectTrigger>
            <SelectContent position="popper">
              {walletTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {labels.walletType[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="fundingTxHash">{t('funding_tx_label')}</Label>
        <Input
          id="fundingTxHash"
          name="fundingTxHash"
          defaultValue={defaults?.fundingTxHash}
          className="font-mono"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={props.errors.includes('fundingTxHash')}
        />
        <p className="text-sm text-ink-muted">{t('funding_tx_hint')}</p>
        <FieldMessage show={props.errors.includes('fundingTxHash')}>{t('error_tx')}</FieldMessage>
      </div>
      <TxHashField
        label={t('tx_label_optional')}
        defaultValue={defaults?.txHash}
        invalid={props.errors.includes('txHash')}
      />
    </>
  );
}

/**
 * The third question, all of it optional: more about the payment, to help trace the money. A wallet payment asks about the
 * wallet too; every payment asks where the money went, when, and what was sent.
 * @param props - The section props.
 * @param props.fromWallet - Whether the money left from the person's own wallet.
 * @param props.errors - The names of the fields the server refused.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @returns The section.
 */
export function PaymentDetailsSection(props: {
  fromWallet: boolean;
  errors: string[];
  defaults?: ClaimDefaults;
}) {
  const t = useTranslations('ClaimPage');
  const { defaults } = props;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormStep step={3} title={props.fromWallet ? t('q_wallet_more') : t('q_payment_more')}>
      {props.fromWallet && <WalletFields errors={props.errors} defaults={defaults} />}
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
