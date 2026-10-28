'use client';

import { useTranslations } from 'next-intl';
import { ResultBadge } from '@/components/cases/ResultBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { createAppColumnHelper } from '@/components/data-table/table';
import { Link } from '@/libs/I18nNavigation';
import type { CheckRow } from '@/utils/cases/ReportChecks';
import type { CheckResult } from '@/validations/ReportValidation';

function Heading(props: { id: 'said' | 'result' | 'chain' | 'notebooks' }) {
  const t = useTranslations('Staff');

  return t(`analysis_col_${props.id}`);
}

function Notebooks(props: { row: CheckRow }) {
  const t = useTranslations('Staff');

  if (props.row.notebooks.length === 0) {
    return <span className="text-ink-muted">{t('analysis_none')}</span>;
  }

  return (
    <ul className="grid gap-1">
      {props.row.notebooks.map((notebook) => (
        <li key={notebook.id}>
          <Link
            href={notebook.href}
            className="font-medium underline underline-offset-4 focus-ring hover:text-ink-muted"
          >
            {notebook.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ResultText(props: { value: CheckRow['result'] }) {
  return <ResultBadge result={props.value} />;
}

const results: CheckResult[] = ['proven', 'partly_proven', 'not_proven', 'not_checkable'];

const helper = createAppColumnHelper<CheckRow>();

const columns = helper.columns([
  helper.accessor('claim', {
    id: 'said',
    header: () => <Heading id="said" />,
    cell: ({ getValue }) => <p className="max-w-sm">{getValue()}</p>,
  }),
  helper.accessor('result', {
    id: 'result',
    header: () => <Heading id="result" />,
    cell: ({ getValue }) => <ResultText value={getValue()} />,
    filterFn: 'inSet',
  }),
  helper.accessor('evidence', {
    id: 'chain',
    header: () => <Heading id="chain" />,
    cell: ({ getValue }) => <p className="max-w-md">{getValue()}</p>,
  }),
  helper.display({
    id: 'notebooks',
    header: () => <Heading id="notebooks" />,
    cell: ({ row }) => <Notebooks row={row.original} />,
    enableSorting: false,
  }),
]);

/**
 * The checks of a case's report as a table for staff: what the platform said, the result, what the chain shows, and the notebooks
 * behind each one, so it is clear which checks still have no notebook and need research.
 * @param props - The table props.
 * @param props.rows - One row for each check.
 * @returns The table.
 */
export function AnalysisChecks(props: { rows: CheckRow[] }) {
  const t = useTranslations('Staff');
  const report = useTranslations('Report');

  return (
    <DataTable
      columns={columns}
      data={props.rows}
      getRowId={(row) => row.id}
      pageSize={25}
      searchPlaceholder={t('analysis_search')}
      labels={{
        said: t('analysis_col_said'),
        result: t('analysis_col_result'),
        chain: t('analysis_col_chain'),
        notebooks: t('analysis_col_notebooks'),
      }}
      filters={[
        {
          columnId: 'result',
          title: t('analysis_col_result'),
          options: results.map((value) => ({ value, label: report(`result_${value}`) })),
        },
      ]}
    />
  );
}
