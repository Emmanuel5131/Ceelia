'use client';

import { getJurisdiction } from '@celia/jurisdictions';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { createCase, setCaseStatus } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { DataTable } from '@/components/data-table/DataTable';
import { createAppColumnHelper } from '@/components/data-table/table';
import { JurisdictionPicker } from '@/components/onboarding/JurisdictionPicker';
import { StatusBadge } from '@/components/overview/StatusBadge';
import { ReportDialog } from '@/components/staff/ReportDialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { caseStatuses } from '@/utils/Case';
import type { CaseRow } from '@/utils/Case';
import { jurisdictionName } from '@/utils/JurisdictionName';

function Heading(props: {
  id: 'case' | 'jurisdiction' | 'claimants' | 'status' | 'updated' | 'report';
}) {
  const t = useTranslations('Staff');

  return t(`col_${props.id}`);
}

function StageSelect(props: { row: CaseRow }) {
  const t = useTranslations('CaseBank');
  const staff = useTranslations('Staff');
  const [pending, startTransition] = React.useTransition();

  // A case with counsel was moved there by a firm taking it, so staff do not move it back.
  if (props.row.status === 'counsel') {
    return <StatusBadge status="counsel" />;
  }

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
        {caseStatuses
          .filter((status) => status !== 'counsel')
          .map((status) => (
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
  helper.accessor(
    (row) => {
      const jurisdiction = getJurisdiction(row.jurisdiction);

      return jurisdiction ? jurisdictionName(jurisdiction) : row.jurisdiction;
    },
    { id: 'jurisdiction', header: () => <Heading id="jurisdiction" /> },
  ),
  helper.accessor('claimants', { id: 'claimants', header: () => <Heading id="claimants" /> }),
  helper.accessor('status', {
    id: 'status',
    header: () => <Heading id="status" />,
    cell: ({ row }) => <StageSelect row={row.original} />,
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
 * Opens a case from a platform name and a jurisdiction. The server reduces the name to a key and says when that platform
 * already has a case.
 * @returns The button and its dialog.
 */
function NewCaseDialog() {
  const t = useTranslations('Staff');
  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [pending, startTransition] = React.useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setErrors([]);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">{t('new_case')}</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          className="grid gap-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);

            startTransition(async () => {
              const result = await createCase(data);
              setErrors(result);

              if (result.length === 0) {
                setOpen(false);
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('new_case_title')}</DialogTitle>
            <DialogDescription>{t('new_case_text')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="case-name">{t('name_label')}</Label>
            <Input
              id="case-name"
              name="name"
              aria-invalid={errors.includes('name')}
              autoComplete="off"
            />
          </div>
          <JurisdictionPicker
            name="jurisdiction"
            label={t('jurisdiction_label')}
            placeholder={t('jurisdiction_placeholder')}
            invalid={errors.includes('jurisdiction')}
          />
          {errors.length > 0 && (
            <p role="alert" className="text-sm text-seal">
              {errors.includes('duplicate') ? t('error_duplicate') : t('error_required')}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Staff's view of the cases: every case with its stage, which staff move between collecting, building and sealed, and a button
 * to open a new one.
 * @param props - The admin props.
 * @param props.cases - Every case.
 * @returns The new-case button and the table.
 */
export function CaseAdmin(props: { cases: CaseRow[] }) {
  return (
    <div className="grid gap-4">
      <div className="justify-self-start">
        <NewCaseDialog />
      </div>
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
