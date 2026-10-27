'use client';

import { FilesIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { deleteDrafts } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { useChainName } from '@/components/claims/ChainLabel';
import { claimColumns, useClaimColumnLabels } from '@/components/claims/claim-columns';
import { useClaimLabels } from '@/components/claims/claim-labels';
import type { ClaimRow } from '@/components/claims/claim-row';
import { DeleteDraftsDialog } from '@/components/claims/DeleteDraftsDialog';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Link } from '@/libs/I18nNavigation';
import { downloadCsv, toCsv } from '@/utils/Csv';

/**
 * A person's claims as a table: search, status, type and chain filters, a column menu, sorting, pagination and a CSV export of
 * what the filters leave. With no claims it shows the empty state and the one action that starts a claim.
 * @param props - The table props.
 * @param props.claims - The person's claims.
 * @returns The table, or the empty state.
 */
export function ClaimDataTable(props: { claims: ClaimRow[] }) {
  const t = useTranslations('ClaimList');
  const claimPage = useTranslations('ClaimPage');
  const labels = useClaimColumnLabels();
  const claimLabels = useClaimLabels();
  const chainName = useChainName();

  const types = [...new Set(props.claims.map((claim) => claim.fraudType))];
  const chains = [...new Set(props.claims.map((claim) => claim.chain))];

  const exportClaims = (rows: ClaimRow[]) => {
    downloadCsv(
      `celia-claims-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv([
        [
          labels.claim,
          labels.type,
          labels.chain,
          t('col_reference'),
          labels.amount,
          labels.status,
          labels.updated,
        ],
        ...rows.map((row) => [
          row.operator ?? claimPage('operator_unknown'),
          claimLabels.fraudType[row.fraudType],
          chainName(row.chain),
          row.reference,
          row.amountLost ?? '',
          row.status === 'submitted' ? t('status_submitted') : t('status_draft'),
          row.updatedAt.slice(0, 10),
        ]),
      ]),
    );
  };

  return (
    <DataTable
      columns={claimColumns}
      data={props.claims}
      getRowId={(row) => row.id}
      labels={labels}
      searchPlaceholder={t('search_placeholder')}
      filters={[
        {
          columnId: 'status',
          title: labels.status,
          options: [
            { value: 'draft', label: t('status_draft') },
            { value: 'submitted', label: t('status_submitted') },
          ],
        },
        {
          columnId: 'type',
          title: labels.type,
          options: types.map((value) => ({
            value,
            label: claimLabels.fraudType[value],
          })),
        },
        {
          columnId: 'chain',
          title: labels.chain,
          options: chains.map((value) => ({ value, label: chainName(value) })),
        },
      ]}
      onExport={exportClaims}
      selectable
      selectionActions={(rows) => {
        const drafts = rows.filter((row) => row.status === 'draft');

        return drafts.length > 0 ? (
          <DeleteDraftsDialog
            count={drafts.length}
            action={deleteDrafts.bind(
              null,
              drafts.map((row) => row.id),
            )}
          />
        ) : null;
      }}
      empty={
        <Empty className="border border-border bg-surface">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FilesIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{t('empty_title')}</EmptyTitle>
            <EmptyDescription>{t('empty_text')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard/claims/new">{t('new_claim')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      }
    />
  );
}
