'use client';

import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import type { ReactTable, RowData } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { TableFeatures } from '@/components/data-table/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const pageSizes = [10, 25, 50, 100];

/**
 * The bar under a table: how many rows are selected, the rows-per-page choice, the current page and the first, previous, next
 * and last buttons. It reads everything from the table, so any table gets it by rendering it.
 * @param props - The pagination props.
 * @param props.table - The table.
 * @param props.showSelection - Show the "n of m selected" count; turn it on for tables with a selection column.
 * @returns The pagination bar.
 */
export function DataTablePagination<TData extends RowData>(props: {
  table: ReactTable<TableFeatures, TData>;
  showSelection?: boolean;
}) {
  const t = useTranslations('DataTable');
  const { table } = props;
  const { pageIndex, pageSize } = table.state.pagination;
  const pageCount = Math.max(table.getPageCount(), 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1 py-4">
      <p className="text-sm text-ink-muted tabular-nums">
        {props.showSelection
          ? t('rows_selected', {
              selected: table.getSelectedRowModel().rows.length,
              total: table.getFilteredRowModel().rows.length,
            })
          : t('rows_total', { total: table.getFilteredRowModel().rows.length })}
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-muted">{t('rows_per_page')}</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="w-20" aria-label={t('rows_per_page')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...new Set([...pageSizes, pageSize])]
                .toSorted((a, b) => a - b)
                .map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-ink tabular-nums" aria-live="polite">
          {t('page_of', { page: pageIndex + 1, total: pageCount })}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              table.setPageIndex(0);
            }}
            disabled={!table.getCanPreviousPage()}
            aria-label={t('first_page')}
          >
            <CaretDoubleLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
            aria-label={t('previous_page')}
          >
            <CaretLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
            aria-label={t('next_page')}
          >
            <CaretRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              table.setPageIndex(pageCount - 1);
            }}
            disabled={!table.getCanNextPage()}
            aria-label={t('last_page')}
          >
            <CaretDoubleRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
