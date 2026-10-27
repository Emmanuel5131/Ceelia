'use client';

import { contactChannels } from '@celia/core';
import { useTranslations } from 'next-intl';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { useClaimLabels } from '@/components/claims/claim-labels';
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
 * The optional last questions: how it started, and roughly how much was lost. Both help lawyers see a pattern, and the real
 * figure still comes from the chain.
 * @param props - The section props.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @returns The section.
 */
export function MoreDetailsSection(props: { defaults?: ClaimDefaults }) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();

  return (
    <FormStep step={5} title={t('q_more')}>
      <div className="grid gap-2">
        <Label htmlFor="contactChannel">{t('contact_label')}</Label>
        <Select name="contactChannel" defaultValue={props.defaults?.contactChannel ?? undefined}>
          <SelectTrigger id="contactChannel" className="w-full">
            <SelectValue placeholder={t('contact_placeholder')} />
          </SelectTrigger>
          <SelectContent position="popper">
            {contactChannels.map((channel) => (
              <SelectItem key={channel} value={channel}>
                {labels.contactChannel[channel]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="amountLost">{t('amount_label')}</Label>
        <Input
          id="amountLost"
          name="amountLost"
          defaultValue={props.defaults?.amountLost}
          autoComplete="off"
        />
        <p className="text-sm text-ink-muted">{t('amount_hint')}</p>
      </div>
    </FormStep>
  );
}
