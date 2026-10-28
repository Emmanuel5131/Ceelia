'use client';

import { ShieldCheckIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { reviewOwnership } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { ExplorerLink } from '@/components/claims/ExplorerLink';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { OwnershipQueueItem } from '@/libs/Staff';

function ReviewCard(props: { item: OwnershipQueueItem }) {
  const t = useTranslations('Staff');
  const format = useFormatter();
  const { item } = props;
  const [reason, setReason] = React.useState('');
  const [missing, setMissing] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const settle = (decision: 'confirm' | 'decline') => {
    if (decision === 'decline' && !reason.trim()) {
      setMissing(true);

      return;
    }

    setMissing(false);
    startTransition(async () => {
      await reviewOwnership({ claimId: item.id, decision, note: reason });
    });
  };

  return (
    <Card variant="outline" size="sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3 font-sans text-base font-medium">
          {item.platformName ?? t('review_unnamed')}
          {item.signed && <Badge variant="solid">{t('review_signed')}</Badge>}
          {item.videoUrl && <Badge variant="dashed">{t('review_video')}</Badge>}
          {item.files.length > 0 && <Badge variant="dashed">{t('review_documents')}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <dl className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-ink-muted">{t('review_wallet')}</dt>
            <dd className="flex min-w-0 items-center gap-2">
              <ChainLabel chain={item.chain} />
              <span className="font-mono break-all">{item.walletAddress}</span>
              {item.walletAddress && (
                <ExplorerLink
                  chain={item.chain}
                  kind="address"
                  value={item.walletAddress}
                  compact
                />
              )}
            </dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="text-ink-muted">{t('review_person')}</dt>
            <dd>
              {[item.name, item.email].filter(Boolean).join(' · ') || t('review_unknown')}
              {item.requestedAt && (
                <span className="text-ink-muted">
                  {' · '}
                  {format.dateTime(new Date(item.requestedAt), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </dd>
          </div>
          {item.note && (
            <div className="flex flex-wrap gap-2">
              <dt className="text-ink-muted">{t('review_note')}</dt>
              <dd className="whitespace-pre-wrap">{item.note}</dd>
            </div>
          )}
        </dl>
        {item.videoUrl && (
          <p>
            <a
              href={item.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium break-all underline underline-offset-4 focus-ring"
            >
              {item.videoUrl}
            </a>
          </p>
        )}
        {item.files.length > 0 && (
          <ul className="grid gap-1">
            {item.files.map((file) => (
              <li key={file.id}>
                <a
                  href={`/api/claims/${item.id}/proofs/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4 focus-ring"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-2">
          <Label htmlFor={`reason-${item.id}`}>{t('review_reason')}</Label>
          <Textarea
            id={`reason-${item.id}`}
            rows={2}
            value={reason}
            aria-invalid={missing}
            onChange={(event) => {
              setReason(event.target.value);
            }}
          />
          {missing && (
            <p role="alert" className="text-sm text-seal">
              {t('review_reason_required')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              settle('confirm');
            }}
          >
            {t('review_confirm')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              settle('decline');
            }}
          >
            {t('review_decline')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * The wallets waiting for staff: what the person sent or asked for, who they are, and Confirm or Decline. A decline needs a
 * reason, which the person sees; it also deletes their files. The server checks again that the caller is staff.
 * @param props - The queue props.
 * @param props.items - The claims waiting.
 * @returns The cards, or the empty state.
 */
export function OwnershipQueue(props: { items: OwnershipQueueItem[] }) {
  const t = useTranslations('Staff');

  if (props.items.length === 0) {
    return (
      <Empty className="border border-border bg-surface">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldCheckIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{t('review_empty_title')}</EmptyTitle>
          <EmptyDescription>{t('review_empty_text')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {props.items.map((item) => (
        <ReviewCard key={item.id} item={item} />
      ))}
    </div>
  );
}
