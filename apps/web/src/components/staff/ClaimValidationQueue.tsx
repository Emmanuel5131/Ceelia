'use client';

import { SealCheckIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { validateClaim } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { ClaimToValidate } from '@/libs/accounts/Staff';

function ValidateCard(props: { item: ClaimToValidate }) {
  const t = useTranslations('Staff');
  const list = useTranslations('ClaimList');
  const labels = useClaimLabels();
  const format = useFormatter();
  const [pending, startTransition] = React.useTransition();
  const { item } = props;

  return (
    <Card variant="outline" size="sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3 font-sans text-base font-medium">
          {item.platformName ?? t('review_unnamed')}
          {item.signed ? (
            <Badge variant="solid">{list('wallet_signed')}</Badge>
          ) : (
            <Badge variant="dashed">{list('wallet_unsigned')}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <dl className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-ink-muted">{t('validate_type')}</dt>
            <dd className="flex items-center gap-2">
              {labels.fraudType[item.fraudType]}
              <ChainLabel chain={item.chain} />
              {item.amountLost && <span>{item.amountLost}</span>}
            </dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="text-ink-muted">{t('review_person')}</dt>
            <dd>
              {[item.name, item.email].filter(Boolean).join(' · ') || t('review_unknown')}
              {item.submittedAt && (
                <span className="text-ink-muted">
                  {' · '}
                  {format.dateTime(new Date(item.submittedAt), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </dd>
          </div>
        </dl>
        <div>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await validateClaim(item.id);
              });
            }}
          >
            {t('validate')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * The sent claims waiting for staff to validate, oldest first. Validating one tells the person and marks the claim everywhere it
 * is shown.
 * @param props - The queue props.
 * @param props.items - The claims waiting.
 * @returns The cards, or a line saying nothing is waiting.
 */
export function ClaimValidationQueue(props: { items: ClaimToValidate[] }) {
  const t = useTranslations('Staff');

  if (props.items.length === 0) {
    return (
      <Empty className="border border-border bg-surface">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SealCheckIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{t('validate_empty_title')}</EmptyTitle>
          <EmptyDescription>{t('validate_empty_text')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4">
      {props.items.map((item) => (
        <ValidateCard key={item.id} item={item} />
      ))}
    </div>
  );
}
