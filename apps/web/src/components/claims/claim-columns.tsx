'use client';

import type { Column } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import { deleteClaim } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { shortReference } from '@/components/claims/claim-row';
import type { ClaimRow } from '@/components/claims/claim-row';
import { OperatorName } from '@/components/claims/ClaimMeta';
import { ClaimStateBadge } from '@/components/claims/ClaimStateBadge';
import { DeleteClaimDialog } from '@/components/claims/DeleteClaimDialog';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { createSelectColumn } from '@/components/data-table/select-column';
import { createAppColumnHelper } from '@/components/data-table/table';
import type { TableFeatures } from '@/components/data-table/table';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/libs/I18nNavigation';
import { claimStateOrder } from '@/utils/claims/ClaimState';
import type { ClaimState } from '@/utils/claims/ClaimState';

type ClaimColumnId =
  | 'claim'
  | 'type'
  | 'chain'
  | 'amount'
  | 'progress'
  | 'wallet'
  | 'status'
  | 'updated';

/**
 * The translated name of every claim column, by column id. Headings, the columns menu, the filters and the export all read it,
 * so a column is named in one place.
 * @returns The labels.
 */
export function useClaimColumnLabels(): Record<ClaimColumnId, string> {
  const t = useTranslations('ClaimList');

  return {
    claim: t('col_claim'),
    type: t('col_type'),
    chain: t('col_chain'),
    amount: t('col_amount'),
    progress: t('col_progress'),
    wallet: t('col_wallet'),
    status: t('col_status'),
    updated: t('col_updated'),
  };
}

function ClaimHeader<TValue>(props: {
  column: Column<TableFeatures, ClaimRow, TValue>;
  id: ClaimColumnId;
}) {
  const labels = useClaimColumnLabels();

  return <DataTableColumnHeader column={props.column} title={labels[props.id]} />;
}

function ClaimCell(props: { claim: ClaimRow }) {
  return (
    <Link
      href={`/dashboard/claims/${props.claim.id}`}
      className="grid gap-1 focus-ring hover:underline hover:underline-offset-4"
    >
      <span className="font-medium">
        <OperatorName name={props.claim.operator} />
      </span>
      <span className="font-mono text-xs text-ink-muted">
        {shortReference(props.claim.reference)}
      </span>
    </Link>
  );
}

function TypeCell(props: { value: ClaimRow['fraudType'] }) {
  const labels = useClaimLabels();

  return labels.fraudType[props.value];
}

function ProgressCell(props: { claim: ClaimRow }) {
  const t = useTranslations('ClaimList');

  return (
    <span className="text-ink-muted tabular-nums">
      {t('progress', {
        done: props.claim.stepsDone,
        total: props.claim.stepsTotal,
      })}
    </span>
  );
}

function WalletCell(props: { value: boolean }) {
  const t = useTranslations('ClaimList');

  return props.value ? (
    <Badge variant="solid">{t('wallet_signed')}</Badge>
  ) : (
    <Badge variant="dashed">{t('wallet_unsigned')}</Badge>
  );
}

function StatusCell(props: { value: ClaimRow['state'] }) {
  return <ClaimStateBadge state={props.value} />;
}

function UpdatedCell(props: { value: string }) {
  const format = useFormatter();

  return (
    <span className="text-ink-muted">
      {format.dateTime(new Date(props.value), { dateStyle: 'medium' })}
    </span>
  );
}

const helper = createAppColumnHelper<ClaimRow>();

/** The columns of the claims table. Defined once at module scope so the table never rebuilds them. */
export const claimColumns = helper.columns([
  createSelectColumn<ClaimRow>(),
  helper.accessor((row) => `${row.operator ?? ''} ${row.reference}`, {
    id: 'claim',
    header: ({ column }) => <ClaimHeader column={column} id="claim" />,
    cell: ({ row }) => <ClaimCell claim={row.original} />,
  }),
  helper.accessor('fraudType', {
    id: 'type',
    header: ({ column }) => <ClaimHeader column={column} id="type" />,
    cell: ({ getValue }) => <TypeCell value={getValue()} />,
    filterFn: 'inSet',
  }),
  helper.accessor('chain', {
    id: 'chain',
    header: ({ column }) => <ClaimHeader column={column} id="chain" />,
    cell: ({ getValue }) => <ChainLabel chain={getValue()} />,
    filterFn: 'inSet',
  }),
  helper.accessor((row) => row.amountLost ?? '', {
    id: 'amount',
    header: ({ column }) => <ClaimHeader column={column} id="amount" />,
    cell: ({ getValue }) => getValue() || <span className="text-ink-muted">—</span>,
  }),
  helper.accessor('stepsDone', {
    id: 'progress',
    header: ({ column }) => <ClaimHeader column={column} id="progress" />,
    cell: ({ row }) => <ProgressCell claim={row.original} />,
  }),
  helper.accessor((row) => (row.signed ? 'signed' : 'unsigned'), {
    id: 'wallet',
    header: ({ column }) => <ClaimHeader column={column} id="wallet" />,
    cell: ({ row }) => <WalletCell value={row.original.signed} />,
    filterFn: 'inSet',
  }),
  helper.accessor('state', {
    id: 'status',
    header: ({ column }) => <ClaimHeader column={column} id="status" />,
    cell: ({ getValue }) => <StatusCell value={getValue()} />,
    filterFn: 'inSet',
    // Sorted along the way a claim takes, not alphabetically.
    sortFn: (a, b, columnId) =>
      claimStateOrder[a.getValue<ClaimState>(columnId)] -
      claimStateOrder[b.getValue<ClaimState>(columnId)],
  }),
  helper.accessor('updatedAt', {
    id: 'updated',
    header: ({ column }) => <ClaimHeader column={column} id="updated" />,
    cell: ({ getValue }) => <UpdatedCell value={getValue()} />,
  }),
  // Only a draft can be deleted: a sent claim is part of a case.
  helper.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) =>
      row.original.state === 'draft' ? (
        <DeleteClaimDialog compact action={deleteClaim.bind(null, row.original.id)} />
      ) : null,
    enableSorting: false,
    enableHiding: false,
  }),
]);
