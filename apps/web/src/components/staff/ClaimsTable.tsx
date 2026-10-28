'use client';

import { CaretLeftIcon, CaretRightIcon, SealCheckIcon } from '@phosphor-icons/react';
import type { Column } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { validateClaims } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import type { BulkResult } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { createSelectColumn } from '@/components/data-table/select-column';
import { createAppColumnHelper } from '@/components/data-table/table';
import type { TableFeatures } from '@/components/data-table/table';
import { ReviewContext } from '@/components/staff/review-context';
import { useSignalLabels } from '@/components/staff/signal-labels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ClaimToValidate } from '@/libs/accounts/Staff';

function Heading<TValue>(props: {
  id: 'platform' | 'type' | 'chain' | 'amount' | 'flags' | 'person' | 'sent';
  column: Column<TableFeatures, ClaimToValidate, TValue>;
}) {
  const t = useTranslations('Staff');

  return <DataTableColumnHeader column={props.column} title={t(`claims_col_${props.id}`)} />;
}

// A claim cannot be confirmed while another person has already proved the wallet and this claim has not.
const isBlocked = (item: ClaimToValidate) =>
  !item.signed && item.signals.includes('wallet_signed_elsewhere');

function Flags(props: { item: ClaimToValidate }) {
  const t = useTranslations('Staff');

  if (props.item.signals.length === 0) {
    return <span className="text-ink-muted">—</span>;
  }

  return <Badge variant="dashed">{t('claims_flags', { count: props.item.signals.length })}</Badge>;
}

function FraudType(props: { value: ClaimToValidate['fraudType'] }) {
  const labels = useClaimLabels();

  return labels.fraudType[props.value];
}

function Sent(props: { value: string | null }) {
  const format = useFormatter();

  return props.value ? (
    <span className="text-ink-muted">
      {format.dateTime(new Date(props.value), { dateStyle: 'medium' })}
    </span>
  ) : null;
}

function ReviewButton(props: { id: string }) {
  const t = useTranslations('Staff');
  const review = React.useContext(ReviewContext);

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        review?.open(props.id);
      }}
    >
      {t('claims_review')}
    </Button>
  );
}

function SignedBadge() {
  const t = useTranslations('ClaimList');

  return <Badge variant="solid">{t('wallet_signed')}</Badge>;
}

const helper = createAppColumnHelper<ClaimToValidate>();

const columns = [
  createSelectColumn<ClaimToValidate>(),
  ...helper.columns([
    helper.accessor((row) => row.platformName ?? '', {
      id: 'platform',
      header: ({ column }) => <Heading id="platform" column={column} />,
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{row.original.platformName ?? '—'}</span>
          {row.original.signed && <SignedBadge />}
        </div>
      ),
    }),
    helper.accessor('fraudType', {
      id: 'type',
      header: ({ column }) => <Heading id="type" column={column} />,
      cell: ({ getValue }) => <FraudType value={getValue()} />,
      filterFn: 'inSet',
    }),
    helper.accessor('chain', {
      id: 'chain',
      header: ({ column }) => <Heading id="chain" column={column} />,
      cell: ({ getValue }) => <ChainLabel chain={getValue()} />,
      filterFn: 'inSet',
    }),
    helper.accessor((row) => row.amountLost ?? '', {
      id: 'amount',
      header: ({ column }) => <Heading id="amount" column={column} />,
    }),
    helper.accessor((row) => (row.signals.length > 0 ? 'flagged' : 'clear'), {
      id: 'flags',
      header: ({ column }) => <Heading id="flags" column={column} />,
      cell: ({ row }) => <Flags item={row.original} />,
      filterFn: 'inSet',
    }),
    helper.accessor((row) => row.name ?? row.email ?? '', {
      id: 'person',
      header: ({ column }) => <Heading id="person" column={column} />,
      cell: ({ row }) => (
        <div className="grid">
          <span>{row.original.name ?? '—'}</span>
          <span className="text-xs text-ink-muted">{row.original.email ?? ''}</span>
        </div>
      ),
    }),
    helper.accessor('submittedAt', {
      id: 'sent',
      header: ({ column }) => <Heading id="sent" column={column} />,
      cell: ({ getValue }) => <Sent value={getValue()} />,
    }),
    helper.display({
      id: 'review',
      header: () => null,
      cell: ({ row }) => <ReviewButton id={row.original.id} />,
      enableSorting: false,
      enableHiding: false,
    }),
  ]),
];

function Detail(props: {
  item: ClaimToValidate;
  position: { index: number; total: number };
  pending: boolean;
  onConfirm: () => void;
  onMove: (step: -1 | 1) => void;
}) {
  const t = useTranslations('Staff');
  const format = useFormatter();
  const labels = useClaimLabels();
  const signalLabels = useSignalLabels();
  const { item } = props;
  const blocked = isBlocked(item);

  return (
    <>
      <SheetHeader>
        <SheetTitle>{item.platformName ?? t('review_unnamed')}</SheetTitle>
        <SheetDescription>
          {t('wallets_position', { index: props.position.index + 1, total: props.position.total })}
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 overflow-y-auto px-4 text-sm">
        {item.signals.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label={t('signals_label')}>
            {item.signals.map((signal) => (
              <li key={signal}>
                <Badge variant="dashed">{signalLabels[signal]}</Badge>
              </li>
            ))}
          </ul>
        )}
        {blocked && <p className="text-seal">{t('validate_blocked')}</p>}
        <dl className="grid gap-3">
          <div className="grid gap-1">
            <dt className="text-ink-muted">{t('validate_type')}</dt>
            <dd className="flex flex-wrap items-center gap-2">
              {labels.fraudType[item.fraudType]}
              <ChainLabel chain={item.chain} />
              {item.amountLost && <span>{item.amountLost}</span>}
              {item.signed ? <SignedBadge /> : null}
            </dd>
          </div>
          <div className="grid gap-1">
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
      </div>
      <SheetFooter className="flex-row flex-wrap items-center gap-3">
        <Button disabled={props.pending || blocked} onClick={props.onConfirm}>
          {t('validate')}
        </Button>
        <span className="ml-auto flex gap-2">
          <Button
            size="icon-sm"
            variant="outline"
            aria-label={t('queue_previous')}
            disabled={props.position.index === 0}
            onClick={() => {
              props.onMove(-1);
            }}
          >
            <CaretLeftIcon aria-hidden="true" />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label={t('queue_next')}
            disabled={props.position.index >= props.position.total - 1}
            onClick={() => {
              props.onMove(1);
            }}
          >
            <CaretRightIcon aria-hidden="true" />
          </Button>
        </span>
      </SheetFooter>
    </>
  );
}

/**
 * The sent claims waiting for staff, as a table that sorts, filters and selects. Select several and confirm them together, or
 * open one to see why it was flagged in a side panel, with Previous and Next. A claim another person has already proved the wallet
 * for cannot be confirmed; the server skips it and says how many it skipped.
 * @param props - The table props.
 * @param props.items - The claims waiting.
 * @param props.total - How many are waiting in all, which may be more than the table loaded.
 * @returns The table, the side panel and the result of the last change.
 */
export function ClaimsTable(props: { items: ClaimToValidate[]; total: number }) {
  const t = useTranslations('Staff');
  const labels = useClaimLabels();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<BulkResult | null>(null);
  const [pending, startTransition] = React.useTransition();
  const index = props.items.findIndex((item) => item.id === openId);
  const current = index === -1 ? undefined : props.items[index];

  const types = [...new Set(props.items.map((item) => item.fraudType))];

  return (
    <ReviewContext value={{ open: setOpenId }}>
      <div className="grid gap-4">
        {result && (
          <output className="text-sm">
            {t('bulk_result', { done: result.done, skipped: result.skipped })}
          </output>
        )}
        {props.total > props.items.length && (
          <p className="text-sm text-ink-muted">
            {t('queue_showing', { shown: props.items.length, total: props.total })}
          </p>
        )}
        <DataTable
          columns={columns}
          data={props.items}
          getRowId={(row) => row.id}
          selectable
          pageSize={25}
          searchPlaceholder={t('claims_search')}
          labels={{
            platform: t('claims_col_platform'),
            type: t('claims_col_type'),
            chain: t('claims_col_chain'),
            amount: t('claims_col_amount'),
            flags: t('claims_col_flags'),
            person: t('claims_col_person'),
            sent: t('claims_col_sent'),
          }}
          filters={[
            {
              columnId: 'flags',
              title: t('claims_col_flags'),
              options: [
                { value: 'flagged', label: t('claims_filter_flagged') },
                { value: 'clear', label: t('claims_filter_clear') },
              ],
            },
            {
              columnId: 'type',
              title: t('claims_col_type'),
              options: types.map((value) => ({ value, label: labels.fraudType[value] })),
            },
          ]}
          selectionActions={(rows) => (
            <Button
              size="sm"
              onClick={() => {
                startTransition(async () => {
                  setResult(await validateClaims(rows.map((row) => row.id)));
                });
              }}
              disabled={pending}
            >
              {t('claims_bulk_confirm', { count: rows.length })}
            </Button>
          )}
          empty={
            <Empty className="border border-border bg-surface">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SealCheckIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{t('validate_empty_title')}</EmptyTitle>
                <EmptyDescription>{t('validate_empty_text')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        />
      </div>
      <Sheet
        open={current !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setOpenId(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-lg">
          {current && (
            <Detail
              key={current.id}
              item={current}
              position={{ index, total: props.items.length }}
              pending={pending}
              onConfirm={() => {
                const next = props.items[index + 1] ?? props.items[index - 1];

                startTransition(async () => {
                  setResult(await validateClaims([current.id]));
                  setOpenId(next?.id ?? null);
                });
              }}
              onMove={(step) => {
                setOpenId(props.items[index + step]?.id ?? null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </ReviewContext>
  );
}
