'use client';

import { CaretLeftIcon, CaretRightIcon, WalletIcon } from '@phosphor-icons/react';
import type { Column } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { settleWallets } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import type { BulkResult } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { ExplorerLink } from '@/components/claims/ExplorerLink';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { createSelectColumn } from '@/components/data-table/select-column';
import { createAppColumnHelper } from '@/components/data-table/table';
import type { TableFeatures } from '@/components/data-table/table';
import { BulkDecision } from '@/components/staff/BulkDecision';
import { ReviewContext } from '@/components/staff/review-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { OwnershipQueueItem } from '@/libs/accounts/Staff';

function Heading<TValue>(props: {
  id: 'platform' | 'chain' | 'evidence' | 'person' | 'requested';
  column: Column<TableFeatures, OwnershipQueueItem, TValue>;
}) {
  const t = useTranslations('Staff');

  return <DataTableColumnHeader column={props.column} title={t(`wallets_col_${props.id}`)} />;
}

function Evidence(props: { item: OwnershipQueueItem }) {
  const t = useTranslations('Staff');
  const { item } = props;

  return (
    <div className="flex flex-wrap gap-2">
      {item.signed && <Badge variant="solid">{t('review_signed')}</Badge>}
      {item.videoUrl && <Badge variant="dashed">{t('review_video')}</Badge>}
      {item.files.length > 0 && (
        <Badge variant="dashed">{t('wallets_files', { count: item.files.length })}</Badge>
      )}
    </div>
  );
}

function Requested(props: { value: string | null }) {
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
      {t('wallets_review')}
    </Button>
  );
}

const helper = createAppColumnHelper<OwnershipQueueItem>();

const columns = [
  createSelectColumn<OwnershipQueueItem>(),
  ...helper.columns([
    helper.accessor((row) => `${row.platformName ?? ''} ${row.walletAddress ?? ''}`, {
      id: 'platform',
      header: ({ column }) => <Heading id="platform" column={column} />,
      cell: ({ row }) => (
        <div className="grid">
          <span className="font-medium">{row.original.platformName ?? '—'}</span>
          <span className="font-mono text-xs text-ink-muted">
            {row.original.walletAddress
              ? `${row.original.walletAddress.slice(0, 8)}…${row.original.walletAddress.slice(-6)}`
              : ''}
          </span>
        </div>
      ),
    }),
    helper.accessor('chain', {
      id: 'chain',
      header: ({ column }) => <Heading id="chain" column={column} />,
      cell: ({ getValue }) => <ChainLabel chain={getValue()} />,
      filterFn: 'inSet',
    }),
    helper.accessor((row) => (row.videoUrl ? 'video' : 'files'), {
      id: 'evidence',
      header: ({ column }) => <Heading id="evidence" column={column} />,
      cell: ({ row }) => <Evidence item={row.original} />,
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
    helper.accessor('requestedAt', {
      id: 'requested',
      header: ({ column }) => <Heading id="requested" column={column} />,
      cell: ({ getValue }) => <Requested value={getValue()} />,
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
  item: OwnershipQueueItem;
  position: { index: number; total: number };
  pending: boolean;
  onSettle: (decision: 'confirm' | 'decline', note: string) => void;
  onMove: (step: -1 | 1) => void;
}) {
  const t = useTranslations('Staff');
  const format = useFormatter();
  const { item } = props;
  const [reason, setReason] = React.useState('');
  const [missing, setMissing] = React.useState(false);

  return (
    <>
      <SheetHeader>
        <SheetTitle>{item.platformName ?? t('review_unnamed')}</SheetTitle>
        <SheetDescription>
          {t('wallets_position', { index: props.position.index + 1, total: props.position.total })}
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 overflow-y-auto px-4 text-sm">
        <dl className="grid gap-3">
          <div className="grid gap-1">
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
          <div className="grid gap-1">
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
            <div className="grid gap-1">
              <dt className="text-ink-muted">{t('review_note')}</dt>
              <dd className="whitespace-pre-wrap">{item.note}</dd>
            </div>
          )}
        </dl>
        <Evidence item={item} />
        {item.videoUrl && (
          <a
            href={item.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium break-all underline underline-offset-4 focus-ring"
          >
            {item.videoUrl}
          </a>
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
            rows={3}
            value={reason}
            aria-invalid={missing}
            onChange={(event) => {
              setReason(event.target.value);
            }}
          />
          {missing && (
            <p role="alert" className="text-seal">
              {t('review_reason_required')}
            </p>
          )}
        </div>
      </div>
      <SheetFooter className="flex-row flex-wrap items-center gap-3">
        <Button
          disabled={props.pending}
          onClick={() => {
            props.onSettle('confirm', '');
          }}
        >
          {t('review_confirm')}
        </Button>
        <Button
          variant="outline"
          disabled={props.pending}
          onClick={() => {
            if (reason.trim() === '') {
              setMissing(true);

              return;
            }

            setMissing(false);
            props.onSettle('decline', reason);
          }}
        >
          {t('review_decline')}
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
 * The wallets waiting for staff, as a table that sorts, filters and selects. Select several and confirm or decline them together;
 * open one to see the evidence in a side panel, with Previous and Next so a reviewer keeps their place. A decline needs a reason,
 * which the person sees. Every change is checked again on the server, which reports how many it changed and skipped.
 * @param props - The table props.
 * @param props.items - The wallets waiting.
 * @param props.total - How many are waiting in all, which may be more than the table loaded.
 * @returns The table, the side panel and the result of the last change.
 */
export function WalletTable(props: { items: OwnershipQueueItem[]; total: number }) {
  const t = useTranslations('Staff');
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<BulkResult | null>(null);
  const [pending, startTransition] = React.useTransition();
  const index = props.items.findIndex((item) => item.id === openId);
  const current = index === -1 ? undefined : props.items[index];

  const settleOne = (decision: 'confirm' | 'decline', note: string) => {
    if (!current) {
      return;
    }

    const next = props.items[index + 1] ?? props.items[index - 1];

    startTransition(async () => {
      setResult(await settleWallets({ claimIds: [current.id], decision, note }));
      setOpenId(next?.id ?? null);
    });
  };

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
          searchPlaceholder={t('wallets_search')}
          labels={{
            platform: t('wallets_col_platform'),
            chain: t('wallets_col_chain'),
            evidence: t('wallets_col_evidence'),
            person: t('wallets_col_person'),
            requested: t('wallets_col_requested'),
          }}
          filters={[
            {
              columnId: 'evidence',
              title: t('wallets_col_evidence'),
              options: [
                { value: 'video', label: t('review_video') },
                { value: 'files', label: t('review_documents') },
              ],
            },
          ]}
          selectionActions={(rows) => (
            <BulkDecision
              count={rows.length}
              onSettle={async (decision, note) => {
                const outcome = await settleWallets({
                  claimIds: rows.map((row) => row.id),
                  decision,
                  note,
                });

                setResult(outcome);

                return outcome.error ?? null;
              }}
            />
          )}
          empty={
            <Empty className="border border-border bg-surface">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WalletIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{t('review_empty_title')}</EmptyTitle>
                <EmptyDescription>{t('review_empty_text')}</EmptyDescription>
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
              onSettle={settleOne}
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
