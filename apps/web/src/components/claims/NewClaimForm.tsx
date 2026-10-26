'use client';

import { chainFamilies } from '@celia/core';
import { useTranslations } from 'next-intl';
import { createClaim } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormAction } from '@/hooks/use-form-action';

/**
 * The first step of a claim: the chain, the wallet and the platform. The rest is asked on the next page, where the claim
 * already exists and can be finished later.
 * @returns The form.
 */
export function NewClaimForm() {
  const t = useTranslations('ClaimPage');
  const { state, onSubmit, pending } = useFormAction(createClaim, { errors: [] });
  const has = (name: string) => state.errors.includes(name);

  const chainLabels = {
    evm: t('chain_evm'),
    solana: t('chain_solana'),
    tron: t('chain_tron'),
    bitcoin: t('chain_bitcoin'),
    other: t('chain_other'),
  } as const;

  return (
    <form className="grid max-w-xl gap-6" noValidate onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="chain">{t('chain_label')}</Label>
        <Select name="chain" defaultValue="evm">
          <SelectTrigger id="chain" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chainFamilies.map((chain) => (
              <SelectItem key={chain} value={chain}>
                {chainLabels[chain]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="walletAddress">{t('address_label')}</Label>
        <Input
          id="walletAddress"
          name="walletAddress"
          className="font-mono"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={has('walletAddress')}
        />
        <p className="text-sm text-ink-muted">{t('address_hint')}</p>
        {has('walletAddress') && (
          <p role="alert" className="text-sm text-seal">
            {t('error_address')}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="platformName">{t('platform_label')}</Label>
        <Input
          id="platformName"
          name="platformName"
          placeholder={t('platform_placeholder')}
          autoComplete="off"
          aria-invalid={has('platformName')}
        />
        {has('platformName') && (
          <p role="alert" className="text-sm text-seal">
            {t('error_required')}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="platformUrl">{t('url_label')}</Label>
        <Input
          id="platformUrl"
          name="platformUrl"
          inputMode="url"
          autoComplete="off"
          aria-invalid={has('platformUrl')}
        />
        {has('platformUrl') && (
          <p role="alert" className="text-sm text-seal">
            {t('error_url')}
          </p>
        )}
      </div>

      {has('duplicate') && (
        <p role="alert" className="text-sm text-seal">
          {t('error_duplicate')}
        </p>
      )}

      <Button type="submit" disabled={pending} className="justify-self-start">
        {t('create')}
      </Button>
    </form>
  );
}
