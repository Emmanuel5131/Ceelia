'use client';

import { contactChannels } from '@celia/core';
import type { FraudType } from '@celia/core';
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
import { Textarea } from '@/components/ui/textarea';

/**
 * The optional last questions: how it started, and roughly how much was lost. Both help lawyers see a pattern, and the real
 * figure still comes from the chain.
 * @param props - The section props.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @param props.fraudTypes - The kinds of loss chosen; "something else" asks for a description.
 * @param props.step - Which step this is.
 * @param props.total - How many steps the form has for this claim.
 * @returns The section.
 */
export function MoreDetailsSection(props: {
  defaults?: ClaimDefaults;
  fraudTypes: FraudType[];
  step: number;
  total: number;
}) {
  const t = useTranslations('ClaimPage');
  const labels = useClaimLabels();

  return (
    <FormStep step={props.step} total={props.total} title={t('q_more')}>
      {props.fraudTypes.includes('other') && (
        <div className="grid gap-2">
          <Label htmlFor="fraudDescription">{t('fraud_description_label')}</Label>
          <Textarea
            id="fraudDescription"
            name="fraudDescription"
            rows={2}
            maxLength={300}
            defaultValue={props.defaults?.fraudDescription}
            placeholder={t('fraud_description_placeholder')}
          />
        </div>
      )}
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
