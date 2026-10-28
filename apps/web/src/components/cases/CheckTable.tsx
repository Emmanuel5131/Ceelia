'use client';

import { useTranslations } from 'next-intl';
import { ResultBadge } from '@/components/cases/ResultBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { createAppColumnHelper } from '@/components/data-table/table';
import { Link } from '@/libs/I18nNavigation';
import type { CheckResult } from '@/validations/ReportValidation';

/** One check of a report as a row: what the platform said, the result, what the chain shows and the tests that back it. */
export type CheckRow = {
  id: string;
  claim: string;
  result: CheckResult;
  evidence: string;
  /** The tests that back it. A link starting with `#` is on the same page. */
  tests: { id: string; title: string; href: string }[];
};

const linkClass =
  'text-sm font-medium underline underline-offset-4 focus-ring hover:text-ink-muted';

function Heading(props: { id: 'claim' | 'result' | 'evidence' | 'tests' }) {
  const t = useTranslations('Report');

  return t(`${props.id}_label`);
}

function TestLinks(props: { tests: CheckRow['tests'] }) {
  if (props.tests.length === 0) {
    return <span className="text-ink-muted">—</span>;
  }

  return (
    <ul className="grid gap-1">
      {props.tests.map((test) => (
        <li key={test.id}>
          {test.href.startsWith('#') ? (
            <a href={test.href} className={linkClass}>
              {test.title}
            </a>
          ) : (
            <Link href={test.href} className={linkClass}>
              {test.title}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

const helper = createAppColumnHelper<CheckRow>();

const columns = helper.columns([
  helper.accessor('claim', {
    id: 'claim',
    header: () => <Heading id="claim" />,
    cell: ({ getValue }) => <p className="min-w-48 whitespace-normal">{getValue()}</p>,
  }),
  helper.accessor('result', {
    id: 'result',
    header: () => <Heading id="result" />,
    cell: ({ getValue }) => <ResultBadge result={getValue()} />,
  }),
  helper.accessor('evidence', {
    id: 'evidence',
    header: () => <Heading id="evidence" />,
    cell: ({ getValue }) => <p className="min-w-64 whitespace-normal">{getValue()}</p>,
  }),
  helper.display({
    id: 'tests',
    header: () => <Heading id="tests" />,
    cell: ({ row }) => <TestLinks tests={row.original.tests} />,
    enableSorting: false,
  }),
]);

/**
 * What a report checked, as one table: a row for each thing the platform said, with the result, what the chain shows, the tests in
 * Celia that back it. The columns are fixed, so it is the app's own table, sortable by result.
 * @param props - The table props.
 * @param props.rows - The checks.
 * @returns The table.
 */
export function CheckTable(props: { rows: CheckRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={props.rows}
      getRowId={(row) => row.id}
      toolbar={false}
      pagination={false}
      pageSize={20}
    />
  );
}
