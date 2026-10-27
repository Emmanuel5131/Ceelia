'use client';

import type { FraudType } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * The third question: who was behind it. The name is required unless the person says they do not know it, because they often
 * do not. A website, a handle and (for a token) the contract all help link claims about the same operator.
 * @param props - The section props.
 * @param props.fraudType - What kind of loss it is; the token contract is only asked for a token or when unsure.
 * @param props.errors - The names of the fields the server refused.
 * @returns The section.
 */
export function WhoSection(props: { fraudType: FraudType | undefined; errors: string[] }) {
  const t = useTranslations('ClaimPage');
  const [unknown, setUnknown] = React.useState(false);
  const asksForContract = props.fraudType === 'rug_pull' || props.fraudType === 'other';

  return (
    <section className="grid gap-6">
      <h2 className="text-xl">{t('q_who')}</h2>
      <div className="flex items-center gap-3">
        <Checkbox
          id="unknownOperator"
          name="unknownOperator"
          checked={unknown}
          onCheckedChange={(checked) => {
            setUnknown(checked === true);
          }}
        />
        <Label htmlFor="unknownOperator" className="font-normal">
          {t('unknown_operator')}
        </Label>
      </div>

      {!unknown && (
        <div className="grid gap-2">
          <Label htmlFor="platformName">{t('operator_name')}</Label>
          <Input
            id="platformName"
            name="platformName"
            placeholder={t('platform_placeholder')}
            autoComplete="off"
            aria-invalid={props.errors.includes('platformName')}
          />
          <FieldMessage show={props.errors.includes('platformName')}>
            {t('error_required')}
          </FieldMessage>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="platformUrl">{t('url_label')}</Label>
        <Input
          id="platformUrl"
          name="platformUrl"
          inputMode="url"
          autoComplete="off"
          aria-invalid={props.errors.includes('platformUrl')}
        />
        <FieldMessage show={props.errors.includes('platformUrl')}>{t('error_url')}</FieldMessage>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="operatorHandle">{t('handle_label')}</Label>
        <Input id="operatorHandle" name="operatorHandle" autoComplete="off" />
      </div>

      {asksForContract && (
        <div className="grid gap-2">
          <Label htmlFor="tokenContract">{t('contract_label')}</Label>
          <Input
            id="tokenContract"
            name="tokenContract"
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
    </section>
  );
}
