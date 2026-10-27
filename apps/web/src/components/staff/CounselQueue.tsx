'use client';

import { getJurisdiction } from '@celia/jurisdictions';
import { ShieldCheckIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { verifyCounsel } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { DataTable } from '@/components/data-table/DataTable';
import { createAppColumnHelper } from '@/components/data-table/table';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { PendingCounsel } from '@/libs/Staff';
import { jurisdictionName } from '@/utils/JurisdictionName';

function LawyerCell(props: { lawyer: PendingCounsel }) {
  return (
    <>
      <p className="font-medium">{props.lawyer.name}</p>
      <p className="text-xs text-ink-muted">{props.lawyer.email}</p>
    </>
  );
}

function AdmittedCell(props: { ids: string[] }) {
  return (
    <ul className="grid gap-1">
      {props.ids.map((id) => {
        const jurisdiction = getJurisdiction(id);

        return <li key={id}>{jurisdiction ? jurisdictionName(jurisdiction) : id}</li>;
      })}
    </ul>
  );
}

function JoinedCell(props: { value: string }) {
  const format = useFormatter();

  return (
    <span className="text-ink-muted">
      {format.dateTime(new Date(props.value), { dateStyle: 'medium' })}
    </span>
  );
}

function VerifyButton(props: { id: string }) {
  const t = useTranslations('Staff');
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await verifyCounsel(props.id);
        });
      }}
    >
      {t('verify')}
    </Button>
  );
}

function Heading(props: { id: 'lawyer' | 'firm' | 'admitted' | 'joined' }) {
  const t = useTranslations('Staff');

  return t(`col_${props.id}`);
}

const helper = createAppColumnHelper<PendingCounsel>();

const columns = helper.columns([
  helper.accessor((row) => `${row.name} ${row.email}`, {
    id: 'lawyer',
    header: () => <Heading id="lawyer" />,
    cell: ({ row }) => <LawyerCell lawyer={row.original} />,
  }),
  helper.accessor((row) => row.firm ?? '', {
    id: 'firm',
    header: () => <Heading id="firm" />,
  }),
  helper.accessor('jurisdictions', {
    id: 'admitted',
    header: () => <Heading id="admitted" />,
    cell: ({ getValue }) => <AdmittedCell ids={getValue()} />,
    enableSorting: false,
  }),
  helper.accessor('createdAt', {
    id: 'joined',
    header: () => <Heading id="joined" />,
    cell: ({ getValue }) => <JoinedCell value={getValue()} />,
  }),
  helper.display({
    id: 'verify',
    header: () => null,
    cell: ({ row }) => <VerifyButton id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  }),
]);

/**
 * The lawyers waiting for review, oldest first, each with the details staff check and a Verify button. Verifying is
 * done on the server, which checks again that the caller is staff.
 * @param props - The queue props.
 * @param props.lawyers - The pending lawyers.
 * @returns The table, or the empty state.
 */
export function CounselQueue(props: { lawyers: PendingCounsel[] }) {
  const t = useTranslations('Staff');

  return (
    <DataTable
      columns={columns}
      data={props.lawyers}
      getRowId={(row) => row.id}
      toolbar={false}
      pagination={false}
      pageSize={100}
      empty={
        <Empty className="border border-border bg-surface">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheckIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{t('queue_empty_title')}</EmptyTitle>
            <EmptyDescription>{t('queue_empty_text')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}
