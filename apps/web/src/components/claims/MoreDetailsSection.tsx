'use client';

import { contactChannels } from '@celia/core';
import { useTranslations } from 'next-intl';
import { useClaimLabels } from '@/components/claims/claim-labels';
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
 * @returns The section.
 */
export function MoreDetailsSection() {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();

  return (
    <section className="grid gap-6">
      <h2 className="text-xl">{t('q_more')}</h2>
      <div className="grid gap-2">
        <Label htmlFor="contactChannel">{t('contact_label')}</Label>
        <Select name="contactChannel">
          <SelectTrigger id="contactChannel" className="w-full">
            <SelectValue placeholder={t('contact_placeholder')} />
          </SelectTrigger>
          <SelectContent>
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
        <Input id="amountLost" name="amountLost" autoComplete="off" />
        <p className="text-sm text-ink-muted">{t('amount_hint')}</p>
      </div>
    </section>
  );
}
