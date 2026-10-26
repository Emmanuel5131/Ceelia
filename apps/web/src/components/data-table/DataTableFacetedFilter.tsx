'use client';

import { FunnelSimpleIcon } from '@phosphor-icons/react';
import type { Column, RowData } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { TableFeatures } from '@/components/data-table/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type DataTableFilterOption = { value: string; label: string };

/**
 * A multi-select filter for one column, with a count next to each option. The column needs `filterFn: 'inSet'`.
 * @param props - The filter props.
 * @param props.column - The column to filter.
 * @param props.title - The translated name of the filter.
 * @param props.options - The values that can be chosen, with their labels.
 * @returns The filter button and its menu.
 */
export function DataTableFacetedFilter<TData extends RowData, TValue>(props: {
  column: Column<TableFeatures, TData, TValue>;
  title: string;
  options: DataTableFilterOption[];
}) {
  const t = useTranslations('DataTable');
  const { column } = props;
  const counts = column.getFacetedUniqueValues();
  const raw = column.getFilterValue();
  const selected = Array.isArray(raw)
    ? raw.filter((value): value is string => typeof value === 'string')
    : [];

  const toggle = (value: string, checked: boolean) => {
    const next = checked ? [...selected, value] : selected.filter((v) => v !== value);
    column.setFilterValue(next.length > 0 ? next : undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FunnelSimpleIcon aria-hidden="true" />
          {props.title}
          {selected.length > 0 && <Badge variant="solid">{selected.length}</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{props.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {props.options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) => {
              toggle(option.value, checked);
            }}
          >
            <span className="flex-1">{option.label}</span>
            <span className="text-xs text-ink-muted tabular-nums">
              {counts.get(option.value) ?? 0}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                column.setFilterValue(undefined);
              }}
            >
              {t('filter_clear')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
