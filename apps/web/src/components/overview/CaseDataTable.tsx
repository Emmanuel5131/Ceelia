'use client';

import { getJurisdiction } from '@celia/jurisdictions';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/data-table/DataTable';
import {
  caseColumns,
  selectableCaseColumns,
  useCaseColumnLabels,
} from '@/components/overview/case-columns';
import type { CaseStatus, SampleCase } from '@/libs/OverviewSample';

const statuses: CaseStatus[] = ['collecting', 'building', 'sealed', 'counsel'];

/**
 * The cases as a table. `full` is the case bank list: search, status and jurisdiction filters, column menu, row selection and
 * pagination. `compact` is a short read-only list, such as "Needs your attention" on the overview.
 * @param props - The table props.
 * @param props.cases - The cases to list.
 * @param props.variant - `full` (default) or `compact`.
 * @returns The table.
 */
export function CaseDataTable(props: { cases: SampleCase[]; variant?: 'full' | 'compact' }) {
  const t = useTranslations('CaseBank');
  const labels = useCaseColumnLabels();
  const full = (props.variant ?? 'full') === 'full';

  const statusLabels: Record<CaseStatus, string> = {
    collecting: t('status_collecting'),
    building: t('status_building'),
    sealed: t('status_sealed'),
    counsel: t('status_counsel'),
  };

  const jurisdictions = [
    ...new Set(props.cases.map((c) => getJurisdiction(c.jurisdiction)?.name ?? c.jurisdiction)),
  ].toSorted();

  return (
    <DataTable
      columns={full ? selectableCaseColumns : caseColumns}
      data={props.cases}
      getRowId={(row) => row.id}
      labels={labels}
      searchPlaceholder={t('search_placeholder')}
      filters={[
        {
          columnId: 'status',
          title: labels.status,
          options: statuses.map((value) => ({ value, label: statusLabels[value] })),
        },
        {
          columnId: 'jurisdiction',
          title: labels.jurisdiction,
          options: jurisdictions.map((value) => ({ value, label: value })),
        },
      ]}
      toolbar={full}
      pagination={full}
      selectable={full}
      pageSize={full ? 8 : 100}
    />
  );
}
