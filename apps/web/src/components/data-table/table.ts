import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * A faceted filter keeps a row when its value is one of the chosen values. Columns that use `facetFilter` in their
 * definition get the multi-select filter in the toolbar.
 * @param row - The row being tested.
 * @param columnId - The column to read.
 * @param filterValue - The chosen values.
 * @returns True when the row's value is one of the chosen values.
 */
const inSet = (
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: unknown,
) => Array.isArray(filterValue) && filterValue.includes(row.getValue(columnId));

/**
 * The one set of table features every Celia table uses: sorting, filtering (global search and per-column facets), column
 * visibility, row selection and pagination, all processed in the browser. A table that needs server-side paging later changes
 * this file, not its own columns.
 */
const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filterFns: { includesString: filterFn_includesString, inSet },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text },
});

export const { createAppColumnHelper, useAppTable } = createTableHook({ features });

export type TableFeatures = typeof features;
