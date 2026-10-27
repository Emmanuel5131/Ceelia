'use client';

import { getJurisdiction } from '@celia/jurisdictions';
import type { Column } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import { CasePreviewDialog } from '@/components/cases/CasePreviewDialog';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { createSelectColumn } from '@/components/data-table/select-column';
import { createAppColumnHelper } from '@/components/data-table/table';
import type { TableFeatures } from '@/components/data-table/table';
import { StatusBadge } from '@/components/overview/StatusBadge';
import { Link } from '@/libs/I18nNavigation';
import type { CaseRow, CaseStatus } from '@/utils/Case';

type CaseColumnId = 'case' | 'jurisdiction' | 'claimants' | 'status' | 'updated';

const statusOrder: Record<CaseStatus, number> = {
  sealed: 0,
  building: 1,
  collecting: 2,
  counsel: 3,
};

/**
 * The translated name of every case column, by column id. Headings, the columns menu and the filters all read it, so a column
 * is named in one place.
 * @returns The labels.
 */
export function useCaseColumnLabels(): Record<CaseColumnId, string> {
  const t = useTranslations('CaseBank');

  return {
    case: t('col_case'),
    jurisdiction: t('col_jurisdiction'),
    claimants: t('col_claimants'),
    status: t('col_status'),
    updated: t('col_updated'),
  };
}

function CaseHeader<TValue>(props: {
  column: Column<TableFeatures, CaseRow, TValue>;
  id: CaseColumnId;
  align?: 'start' | 'end';
}) {
  const labels = useCaseColumnLabels();

  return (
    <DataTableColumnHeader column={props.column} title={labels[props.id]} align={props.align} />
  );
}

function CaseCell(props: { caseRow: CaseRow; linked: boolean }) {
  const content = (
    <>
      <p className="font-medium">{props.caseRow.name}</p>
      <p className="font-mono text-xs text-ink-muted">{props.caseRow.number}</p>
    </>
  );

  return props.linked ? (
    <Link
      href={`/dashboard/cases/${props.caseRow.id}`}
      className="block focus-ring hover:underline hover:underline-offset-4"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

function ClaimantsCell(props: { value: number }) {
  const format = useFormatter();

  return <p className="text-right tabular-nums">{format.number(props.value)}</p>;
}

function UpdatedCell(props: { value: string }) {
  const format = useFormatter();

  return (
    <span className="text-ink-muted">
      {format.dateTime(new Date(props.value), { dateStyle: 'medium' })}
    </span>
  );
}

const helper = createAppColumnHelper<CaseRow>();

/**
 * Builds the columns of a case table. A linked table opens the case page from the case name and offers the preview. Call it at
 * module scope so the table never rebuilds the columns.
 * @param linked - Whether the case name links to its page.
 * @returns The columns.
 */
function createCaseColumns(linked: boolean) {
  const columns = helper.columns([
    helper.accessor((row) => `${row.name} ${row.number}`, {
      id: 'case',
      header: ({ column }) => <CaseHeader column={column} id="case" />,
      cell: ({ row }) => <CaseCell caseRow={row.original} linked={linked} />,
    }),
    helper.accessor((row) => getJurisdiction(row.jurisdiction)?.name ?? row.jurisdiction, {
      id: 'jurisdiction',
      header: ({ column }) => <CaseHeader column={column} id="jurisdiction" />,
      filterFn: 'inSet',
    }),
    helper.accessor('claimants', {
      id: 'claimants',
      header: ({ column }) => <CaseHeader column={column} id="claimants" align="end" />,
      cell: ({ getValue }) => <ClaimantsCell value={getValue()} />,
    }),
    helper.accessor('status', {
      id: 'status',
      header: ({ column }) => <CaseHeader column={column} id="status" />,
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      filterFn: 'inSet',
      sortFn: (a, b, columnId) =>
        statusOrder[a.getValue<CaseStatus>(columnId)] -
        statusOrder[b.getValue<CaseStatus>(columnId)],
    }),
    helper.accessor('updatedAt', {
      id: 'updated',
      header: ({ column }) => <CaseHeader column={column} id="updated" />,
      cell: ({ getValue }) => <UpdatedCell value={getValue()} />,
    }),
  ]);

  // A linked table offers the preview, since each case has a page.
  return linked
    ? [
        ...columns,
        helper.display({
          id: 'preview',
          header: () => null,
          cell: ({ row }) => <CasePreviewDialog row={row.original} />,
          enableSorting: false,
          enableHiding: false,
        }),
      ]
    : columns;
}

/** The columns of a read-only case table, linked to each case page. */
export const caseColumns = createCaseColumns(true);

/** The linked columns with a leading checkbox column, for the full case bank list. */
export const selectableCaseColumns = [createSelectColumn<CaseRow>(), ...createCaseColumns(true)];
