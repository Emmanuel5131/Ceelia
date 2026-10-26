'use client';

import type { Row, RowData, Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { createAppColumnHelper } from '@/components/data-table/table';
import type { TableFeatures } from '@/components/data-table/table';
import { Checkbox } from '@/components/ui/checkbox';

function SelectAll<TData extends RowData>(props: { table: Table<TableFeatures, TData> }) {
  const t = useTranslations('DataTable');
  const { table } = props;
  const all = table.getIsAllPageRowsSelected();

  return (
    <Checkbox
      checked={all || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
      onCheckedChange={(value) => {
        table.toggleAllPageRowsSelected(value === true);
      }}
      aria-label={t('select_all')}
    />
  );
}

function SelectRow<TData extends RowData>(props: { row: Row<TableFeatures, TData> }) {
  const t = useTranslations('DataTable');

  return (
    <Checkbox
      checked={props.row.getIsSelected()}
      onCheckedChange={(value) => {
        props.row.toggleSelected(value === true);
      }}
      aria-label={t('select_row')}
    />
  );
}

/**
 * The checkbox column for a table with row selection: a select-all box in the heading (for the current page) and one box per row.
 * Add it first in the column list and pass `selectable` to `DataTable` to show the selected count.
 * @returns The column definition.
 */
export function createSelectColumn<TData extends RowData>() {
  const helper = createAppColumnHelper<TData>();

  return helper.display({
    id: 'select',
    header: ({ table }) => <SelectAll table={table} />,
    cell: ({ row }) => <SelectRow row={row} />,
    enableSorting: false,
    enableHiding: false,
  });
}
