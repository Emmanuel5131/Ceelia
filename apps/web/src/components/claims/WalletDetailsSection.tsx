'use client';

import { walletApps, walletTypes } from '@celia/core';
import { useTranslations } from 'next-intl';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { FormStep } from '@/components/claims/FormStep';
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
 * The third question for a wallet payment, all of it optional: which app and what kind of wallet the money left from, and the
 * transaction that first funded it, which lets us trace where the money came from.
 * @param props - The section props.
 * @param props.errors - The names of the fields the server refused.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @param props.step - Which step this is.
 * @param props.total - How many steps the form has for this claim.
 * @returns The section.
 */
export function WalletDetailsSection(props: {
  errors: string[];
  defaults?: ClaimDefaults;
  step: number;
  total: number;
}) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();
  const { defaults } = props;

  return (
    <FormStep step={props.step} total={props.total} title={t('q_wallet_more')}>
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
    </FormStep>
  );
}
