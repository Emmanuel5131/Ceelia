'use client';

import type { FraudType } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { ClaimDefaults } from '@/components/claims/claim-defaults';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { FormStep } from '@/components/claims/FormStep';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * The third question: who was behind it. The name is required unless the person says they do not know it, because they often
 * do not. A website, a handle and (for a token) the contract all help link claims about the same operator.
 * @param props - The section props.
 * @param props.fraudTypes - What kinds of loss it is; the token contract is only asked for a token or when unsure.
 * @param props.errors - The names of the fields the server refused.
 * @param props.defaults - The saved answers, when a draft is being edited.
 * @returns The section.
 */
export function WhoSection(props: {
  fraudTypes: FraudType[];
  errors: string[];
  defaults?: ClaimDefaults;
}) {
  const t = useTranslations('ClaimPage');
  const [unknown, setUnknown] = React.useState(
    props.defaults !== undefined && props.defaults.platformName === '',
  );
  const asksForContract = props.fraudTypes.some(
    (type) => type === 'rug_pull' || type === 'honeypot_token' || type === 'other',
  );

  return (
    <FormStep step={4} title={t('q_who')}>
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
            defaultValue={props.defaults?.platformName}
            autoComplete="off"
            aria-invalid={props.errors.includes('platformName')}
          />
          <FieldMessage show={props.errors.includes('platformName')}>
            {t('error_required')}
          </FieldMessage>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <Label htmlFor="platformUrl">{t('url_label')}</Label>
          <Input
            id="platformUrl"
            name="platformUrl"
            defaultValue={props.defaults?.platformUrl}
            inputMode="url"
            autoComplete="off"
            aria-invalid={props.errors.includes('platformUrl')}
          />
          <FieldMessage show={props.errors.includes('platformUrl')}>{t('error_url')}</FieldMessage>
        </div>

        <div className="grid content-start gap-2">
          <Label htmlFor="operatorHandle">{t('handle_label')}</Label>
          <Input
            id="operatorHandle"
            name="operatorHandle"
            defaultValue={props.defaults?.operatorHandle}
            autoComplete="off"
          />
        </div>
      </div>

      {asksForContract && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid content-start gap-2">
            <Label htmlFor="tokenName">{t('token_name_label')}</Label>
            <Input
              id="tokenName"
              name="tokenName"
              placeholder={t('token_name_placeholder')}
              defaultValue={props.defaults?.tokenName}
              autoComplete="off"
            />
          </div>
          <div className="grid content-start gap-2">
            <Label htmlFor="tokenContract">{t('contract_label')}</Label>
            <Input
              id="tokenContract"
              name="tokenContract"
              defaultValue={props.defaults?.tokenContract}
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </FormStep>
  );
}
