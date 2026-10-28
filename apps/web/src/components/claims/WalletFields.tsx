'use client';

import { walletApps, walletTypes } from '@celia/core';
import { useTranslations } from 'next-intl';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { TxCheck } from '@/components/claims/TxCheck';
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
 * What is asked about the wallet itself when the money left from the person's own wallet, all of it optional: which app and what
 * kind of wallet, and the transaction that first funded it, which lets us trace where the money came from.
 * @param props - The fields props.
 * @param props.errors - The names of the fields the server refused.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @returns The fields.
 */
export function WalletFields(props: { errors: string[]; defaults?: ClaimDefaults }) {
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
        <TxCheck field="fundingTxHash" expect="recipient" />
      </div>
    </>
  );
}
