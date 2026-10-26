'use client';

import { SlidersHorizontalIcon } from '@phosphor-icons/react';
import type { ReactTable, RowData } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { TableFeatures } from '@/components/data-table/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * A "Columns" menu with one checkbox per hideable column. Column headings come from each column's `meta.title`... or its id.
 * @param props - The menu props.
 * @param props.table - The table.
 * @param props.labels - The translated name of each column, by column id.
 * @returns The menu button.
 */
export function DataTableViewOptions<TData extends RowData>(props: {
  table: ReactTable<TableFeatures, TData>;
  labels: Record<string, string>;
}) {
  const t = useTranslations('DataTable');
  const columns = props.table.getAllLeafColumns().filter((column) => column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontalIcon aria-hidden="true" />
          {t('view_columns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('toggle_columns')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => {
              column.toggleVisibility(value);
            }}
          >
            {props.labels[column.id] ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
