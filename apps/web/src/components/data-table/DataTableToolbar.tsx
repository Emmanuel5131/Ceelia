'use client';

import { DownloadSimpleIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import type { ReactTable, RowData } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { DataTableFacetedFilter } from '@/components/data-table/DataTableFacetedFilter';
import type { DataTableFilterOption } from '@/components/data-table/DataTableFacetedFilter';
import { DataTableViewOptions } from '@/components/data-table/DataTableViewOptions';
import type { TableFeatures } from '@/components/data-table/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type DataTableFilter = { columnId: string; title: string; options: DataTableFilterOption[] };

/**
 * The bar above a table: a search box that looks across the columns, one faceted filter per configured column, a reset button
 * when anything is filtered, and the column visibility menu.
 * @param props - The toolbar props.
 * @param props.table - The table.
 * @param props.labels - The translated name of each column, by column id.
 * @param props.searchPlaceholder - Placeholder for the search box.
 * @param props.filters - The faceted filters to show.
 * @param props.onExport - Shows an "Export" button that calls this when pressed.
 * @returns The toolbar.
 */
export function DataTableToolbar<TData extends RowData>(props: {
  table: ReactTable<TableFeatures, TData>;
  labels: Record<string, string>;
  searchPlaceholder: string;
  filters: DataTableFilter[];
  onExport?: () => void;
}) {
  const t = useTranslations('DataTable');
  const { table } = props;
  const search = typeof table.state.globalFilter === 'string' ? table.state.globalFilter : '';
  const isFiltered = search.length > 0 || table.state.columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-64 flex-1 md:max-w-sm">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label={t('search_label')}
          placeholder={props.searchPlaceholder}
          value={search}
          onChange={(e) => {
            table.setGlobalFilter(e.target.value);
          }}
          className="h-(--control-sm) pl-9 text-sm"
        />
      </div>
      {props.filters.map((filter) => {
        const column = table.getColumn(filter.columnId);

        return column ? (
          <DataTableFacetedFilter
            key={filter.columnId}
            column={column}
            title={filter.title}
            options={filter.options}
          />
        ) : null;
      })}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            table.setGlobalFilter('');
            table.resetColumnFilters();
          }}
        >
          <XIcon aria-hidden="true" />
          {t('filters_reset')}
        </Button>
      )}
      <div className="ml-auto flex items-center gap-3">
        {props.onExport && (
          <Button variant="outline" size="sm" onClick={props.onExport}>
            <DownloadSimpleIcon aria-hidden="true" />
            {t('export')}
          </Button>
        )}
        <DataTableViewOptions table={table} labels={props.labels} />
      </div>
    </div>
  );
}
