'use client';

import { CaretLeftIcon, CaretRightIcon, SealCheckIcon } from '@phosphor-icons/react';
import type { Column } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import {
  declineWalletProof,
  rejectClaims,
  startClaimReviews,
  validateClaims,
} from '@/app/[locale]/(auth)/dashboard/staff/actions';
import type { BulkResult } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { ClaimStateBadge } from '@/components/claims/ClaimStateBadge';
import { ExplorerLink } from '@/components/claims/ExplorerLink';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { createSelectColumn } from '@/components/data-table/select-column';
import { createAppColumnHelper } from '@/components/data-table/table';
import type { TableFeatures } from '@/components/data-table/table';
import { BulkDecision } from '@/components/staff/BulkDecision';
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
import type { ClaimToValidate } from '@/libs/accounts/Staff';

function Heading<TValue>(props: {
  id: 'platform' | 'state' | 'type' | 'chain' | 'amount' | 'flags' | 'person' | 'sent';
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

function ProofBadge() {
  const t = useTranslations('Staff');

  return <Badge variant="dashed">{t('claims_proof_added')}</Badge>;
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
          {row.original.proof && <ProofBadge />}
        </div>
      ),
    }),
    helper.accessor('state', {
      id: 'state',
      header: ({ column }) => <Heading id="state" column={column} />,
      cell: ({ getValue }) => <ClaimStateBadge state={getValue()} />,
      filterFn: 'inSet',
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

function WalletProof(props: { claimId: string; proof: NonNullable<ClaimToValidate['proof']> }) {
  const t = useTranslations('Staff');
  const { proof } = props;

  return (
    <section className="grid gap-2" aria-label={t('claims_proof_label')}>
      <h3 className="font-medium">{t('claims_proof_label')}</h3>
      {proof.note && <p className="whitespace-pre-wrap">{proof.note}</p>}
      {proof.videoUrl && (
        <a
          href={proof.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium break-all underline underline-offset-4 focus-ring"
        >
          {proof.videoUrl}
        </a>
      )}
      {proof.files.length > 0 && (
        <ul className="grid gap-1">
          {proof.files.map((file) => (
            <li key={file.id}>
              <a
                href={`/api/claims/${props.claimId}/proofs/${file.id}`}
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
    </section>
  );
}

function Detail(props: {
  item: ClaimToValidate;
  position: { index: number; total: number };
  pending: boolean;
  onSettle: (action: 'start' | 'accept' | 'reject' | 'proof', note: string) => void;
  onMove: (step: -1 | 1) => void;
}) {
  const t = useTranslations('Staff');
  const format = useFormatter();
  const labels = useClaimLabels();
  const signalLabels = useSignalLabels();
  const { item } = props;
  const blocked = isBlocked(item);
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
          {item.walletAddress && (
            <div className="grid gap-1">
              <dt className="text-ink-muted">{t('review_wallet')}</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="font-mono break-all">{item.walletAddress}</span>
                <ExplorerLink
                  chain={item.chain}
                  kind="address"
                  value={item.walletAddress}
                  compact
                />
              </dd>
            </div>
          )}
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
        {item.proof && <WalletProof claimId={item.id} proof={item.proof} />}
        <ClaimStateBadge state={item.state} />
        <div className="grid gap-2">
          <Label htmlFor={`reject-${item.id}`}>{t('claims_reject_reason')}</Label>
          <Textarea
            id={`reject-${item.id}`}
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
        {item.state === 'sent' && (
          <Button
            variant="outline"
            disabled={props.pending}
            onClick={() => {
              props.onSettle('start', '');
            }}
          >
            {t('claims_start_review')}
          </Button>
        )}
        <Button
          disabled={props.pending || blocked}
          onClick={() => {
            props.onSettle('accept', '');
          }}
        >
          {t('validate')}
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
            props.onSettle('reject', reason);
          }}
        >
          {t('claims_reject')}
        </Button>
        {item.proof && (
          <Button
            variant="outline"
            disabled={props.pending}
            onClick={() => {
              if (reason.trim() === '') {
                setMissing(true);

                return;
              }

              setMissing(false);
              props.onSettle('proof', reason);
            }}
          >
            {t('claims_proof_decline')}
          </Button>
        )}
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
 * open one to see why it was flagged and any video or files the person added for the wallet, in a side panel with Previous and
 * Next. Accepting a claim confirms its wallet proof with it; a reviewer can instead ask for new proof and keep the claim waiting.
 * A claim another person has already proved the wallet for cannot be confirmed; the server skips it and says how many it skipped.
 * @param props - The table props.
 * @param props.items - The claims waiting.
 * @param props.total - How many are waiting in all, which may be more than the table loaded.
 * @returns The table, the side panel and the result of the last change.
 */
export function ClaimsTable(props: { items: ClaimToValidate[]; total: number }) {
  const t = useTranslations('Staff');
  const labels = useClaimLabels();
  const list = useTranslations('ClaimList');
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
            state: t('claims_col_state'),
            type: t('claims_col_type'),
            chain: t('claims_col_chain'),
            amount: t('claims_col_amount'),
            flags: t('claims_col_flags'),
            person: t('claims_col_person'),
            sent: t('claims_col_sent'),
          }}
          filters={[
            {
              columnId: 'state',
              title: t('claims_col_state'),
              options: [
                { value: 'sent', label: list('state_sent') },
                { value: 'in_review', label: list('state_in_review') },
              ],
            },
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
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    setResult(await startClaimReviews(rows.map((row) => row.id)));
                  });
                }}
              >
                {t('claims_bulk_start', { count: rows.length })}
              </Button>
              <BulkDecision
                copy={{
                  confirm: t('claims_bulk_accept', { count: rows.length }),
                  decline: t('claims_bulk_reject', { count: rows.length }),
                  confirmTitle: t('claims_accept_title', { count: rows.length }),
                  confirmText: t('claims_accept_text'),
                  declineTitle: t('claims_reject_title', { count: rows.length }),
                  declineText: t('claims_reject_text'),
                  confirmAction: t('claims_accept_action'),
                  declineAction: t('claims_reject_action'),
                }}
                onSettle={async (decision, note) => {
                  const ids = rows.map((row) => row.id);

                  if (decision === 'confirm') {
                    setResult(await validateClaims(ids));

                    return null;
                  }

                  const outcome = await rejectClaims({ claimIds: ids, note });

                  setResult(outcome);

                  return outcome.error ?? null;
                }}
              />
            </>
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
              onSettle={(action, note) => {
                // Starting a review or asking for new proof keeps the claim in the queue, so the panel stays on it; the others move
                // on to the next.
                const stays = action === 'start' || action === 'proof';
                const next = stays ? current : (props.items[index + 1] ?? props.items[index - 1]);

                startTransition(async () => {
                  if (action === 'start') {
                    setResult(await startClaimReviews([current.id]));
                  } else if (action === 'accept') {
                    setResult(await validateClaims([current.id]));
                  } else if (action === 'proof') {
                    setResult(await declineWalletProof({ claimId: current.id, note }));
                  } else {
                    setResult(await rejectClaims({ claimIds: [current.id], note }));
                  }

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
