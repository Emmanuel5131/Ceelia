'use client';

import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { setCaseStatus } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { DataTable } from '@/components/data-table/DataTable';
import { createAppColumnHelper } from '@/components/data-table/table';
import { OperatorsDialog } from '@/components/staff/OperatorsDialog';
import { ReportDialog } from '@/components/staff/ReportDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { caseStatuses } from '@/utils/cases/Case';
import type { CaseRow } from '@/utils/cases/Case';

function Heading(props: {
  id: 'case' | 'jurisdictions' | 'operators' | 'victims' | 'status' | 'updated' | 'report';
}) {
  const t = useTranslations('Staff');

  return t(`col_${props.id}`);
}

function StageSelect(props: { row: CaseRow }) {
  const t = useTranslations('CaseBank');
  const staff = useTranslations('Staff');
  const [pending, startTransition] = React.useTransition();

  return (
    <Select
      value={props.row.status}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(async () => {
          await setCaseStatus(props.row.id, value);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-48" aria-label={t('col_status')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {caseStatuses.map((status) => (
          // Sealing says the evidence file is finished, so it needs a report.
          <SelectItem
            key={status}
            value={status}
            disabled={status === 'sealed' && !props.row.hasReport}
          >
            {t(`status_${status}`)}
            {status === 'sealed' && !props.row.hasReport ? ` · ${staff('needs_report')}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function UpdatedText(props: { value: string }) {
  const format = useFormatter();

  return format.dateTime(new Date(props.value), { dateStyle: 'medium' });
}

const helper = createAppColumnHelper<CaseRow>();

const columns = helper.columns([
  helper.accessor((row) => `${row.name} ${row.number}`, {
    id: 'case',
    header: () => <Heading id="case" />,
    cell: ({ row }) => (
      <>
        <p className="font-medium">{row.original.name}</p>
        <p className="font-mono text-xs text-ink-muted">{row.original.number}</p>
      </>
    ),
  }),
  helper.accessor('jurisdictions', {
    id: 'jurisdictions',
    header: () => <Heading id="jurisdictions" />,
  }),
  helper.accessor('claimants', { id: 'victims', header: () => <Heading id="victims" /> }),
  helper.accessor('status', {
    id: 'status',
    header: () => <Heading id="status" />,
    cell: ({ row }) => <StageSelect row={row.original} />,
  }),
  helper.display({
    id: 'operators',
    header: () => <Heading id="operators" />,
    cell: ({ row }) => <OperatorsDialog row={row.original} />,
    enableSorting: false,
  }),
  helper.display({
    id: 'report',
    header: () => <Heading id="report" />,
    cell: ({ row }) => <ReportDialog row={row.original} />,
    enableSorting: false,
  }),
  helper.accessor('updatedAt', {
    id: 'updated',
    header: () => <Heading id="updated" />,
    cell: ({ getValue }) => <UpdatedText value={getValue()} />,
  }),
]);

/**
 * Staff's view of the cases: every case with its stage, which only staff move, between building and enough evidence. A case
 * opens by itself when its first claim is sent, so there is nothing to open here.
 * @param props - The admin props.
 * @param props.cases - Every case.
 * @returns The table.
 */
export function CaseAdmin(props: { cases: CaseRow[] }) {
  return (
    <div className="grid gap-4">
      <DataTable
        columns={columns}
        data={props.cases}
        getRowId={(row) => row.id}
        toolbar={false}
        pagination={false}
        pageSize={100}
      />
    </div>
  );
}
