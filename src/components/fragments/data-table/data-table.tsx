'use client'

import { Search } from 'lucide-react'
import * as React from 'react'

import { Checkbox } from '../../atoms/forms/checkbox'
import { Input } from '../../atoms/forms/input'
import { Table, type TableClassNames, type TableColumn } from '../../atoms/data-display/table'
import { Pagination } from '../../atoms/navigation/pagination'
import { useControllableState } from '../../../lib/use-controllable-state'
import { cn } from '../../../lib/utils'
import {
  filterRows,
  nextSort,
  parseSort,
  sortRows,
  type SortState,
  type SortValue,
} from './data-table-utils'

/*
 * Table's props mode plus the client-side plumbing most lists need: a search box,
 * click-to-sort headers, pagination and row selection. Everything runs on the `data`
 * array in memory; for server-side data, control `sort`/`search`/`page` and pass the
 * already-paged rows with `totalRows`.
 */

export interface DataTableColumn<TRow> extends TableColumn<TRow> {
  /** Value to sort by; giving one makes the header sortable. */
  sortValue?: (row: TRow) => SortValue
  /** Sortable header without `sortValue` — for server-side sorting via `onSortChange`. */
  sortable?: boolean
  /** Text the search box matches against. Columns without it aren't searched. */
  searchValue?: (row: TRow) => string | null | undefined
}

export interface DataTableClassNames extends TableClassNames {
  toolbar?: string
  footer?: string
  root?: string
}

export interface DataTableProps<TRow> {
  columns: readonly DataTableColumn<TRow>[]
  data: readonly TRow[]
  rowKey: (row: TRow) => string

  /** Show the search box (searches columns with `searchValue`). @default true when any column is searchable */
  searchable?: boolean
  search?: string
  defaultSearch?: string
  onSearchChange?: (search: string) => void
  /** @default "Search…" */
  searchPlaceholder?: string

  /** `"<columnKey>:<asc|desc>"`, or "" for unsorted. */
  sort?: SortState
  defaultSort?: SortState
  onSortChange?: (sort: SortState) => void

  /** Rows per page; `null` shows every row. @default 10 */
  pageSize?: number | null
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /**
   * Server-side mode: `data` is already the current page (sorted/filtered by you) and
   * this is the total row count for the pager. Search, sort and paging are then only
   * reported through the callbacks, never applied to `data`.
   */
  totalRows?: number

  /** Adds a checkbox column. */
  selectable?: boolean
  selectedKeys?: readonly string[]
  defaultSelectedKeys?: readonly string[]
  onSelectedKeysChange?: (keys: string[]) => void
  /** Accessible name of a row's checkbox. @default "Select row" */
  getRowLabel?: (row: TRow) => string

  /** Extra controls shown next to the search box (filters, actions, …). */
  toolbar?: React.ReactNode
  /** Shown in place of rows when there are none. @default "No results." */
  emptyText?: React.ReactNode
  caption?: React.ReactNode
  onRowClick?: (row: TRow, event: React.MouseEvent | React.KeyboardEvent) => void
  className?: string
  classNames?: DataTableClassNames
}

export function DataTable<TRow>({
  columns,
  data,
  rowKey,
  searchable,
  search: searchProp,
  defaultSearch = '',
  onSearchChange,
  searchPlaceholder = 'Search…',
  sort: sortProp,
  defaultSort = '',
  onSortChange,
  pageSize = 10,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  totalRows,
  selectable = false,
  selectedKeys: selectedProp,
  defaultSelectedKeys = [],
  onSelectedKeysChange,
  getRowLabel,
  toolbar,
  emptyText = 'No results.',
  caption,
  onRowClick,
  className,
  classNames,
}: DataTableProps<TRow>) {
  const serverSide = totalRows !== undefined
  const showSearch = searchable ?? columns.some((column) => column.searchValue)

  const [page, setPage] = useControllableState({ value: pageProp, defaultValue: defaultPage, onChange: onPageChange })
  const [search, setSearchState] = useControllableState({
    value: searchProp,
    defaultValue: defaultSearch,
    onChange: onSearchChange,
  })
  const [sort, setSortState] = useControllableState<SortState>({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
  })
  const [selected, setSelected] = useControllableState<readonly string[]>({
    value: selectedProp,
    defaultValue: defaultSelectedKeys,
    onChange: onSelectedKeysChange ? (keys) => onSelectedKeysChange([...keys]) : undefined,
  })

  // A new search or sort starts again from the first page.
  const setSearch = (next: string) => {
    setSearchState(next)
    if (page !== 1) setPage(1)
  }
  const setSort = (next: SortState) => {
    setSortState(next)
    if (page !== 1) setPage(1)
  }

  const processed = React.useMemo(() => {
    if (serverSide) return [...data]
    const searchable = columns.filter((column) => column.searchValue)
    let rows = filterRows(data, search, (row) =>
      searchable.map((column) => column.searchValue!(row) ?? '')
    )
    const active = parseSort(sort)
    const sortColumn = active && columns.find((column) => column.key === active.column)
    if (active && sortColumn?.sortValue) rows = sortRows(rows, sortColumn.sortValue, active.direction)
    return rows
  }, [serverSide, data, search, sort, columns])

  const total = serverSide ? totalRows : processed.length
  const totalPages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const pageRows =
    serverSide || !pageSize ? processed : processed.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const pageKeys = pageRows.map(rowKey)
  const selectedSet = new Set(selected)
  const pageSelectedCount = pageKeys.filter((key) => selectedSet.has(key)).length
  const headerChecked: boolean | 'indeterminate' =
    pageKeys.length > 0 && pageSelectedCount === pageKeys.length
      ? true
      : pageSelectedCount > 0
        ? 'indeterminate'
        : false

  const toggleKey = (key: string, on: boolean) =>
    setSelected(on ? [...selected.filter((k) => k !== key), key] : selected.filter((k) => k !== key))
  const togglePage = (on: boolean) =>
    setSelected(
      on
        ? [...selected, ...pageKeys.filter((key) => !selectedSet.has(key))]
        : selected.filter((key) => !pageKeys.includes(key))
    )

  const tableColumns: TableColumn<TRow>[] = [
    ...(selectable
      ? [
          {
            key: '__select',
            header: (
              <Checkbox
                aria-label="Select all rows on this page"
                checked={headerChecked}
                disabled={pageKeys.length === 0}
                onCheckedChange={(value) => togglePage(value === true)}
              />
            ),
            headerClassName: 'w-10',
            cellClassName: 'w-10',
            render: (row: TRow) => {
              const key = rowKey(row)
              return (
                <Checkbox
                  aria-label={getRowLabel?.(row) ?? 'Select row'}
                  checked={selectedSet.has(key)}
                  onCheckedChange={(value) => toggleKey(key, value === true)}
                />
              )
            },
          } satisfies TableColumn<TRow>,
        ]
      : []),
    ...columns.map(({ sortValue, searchValue: _searchValue, sortable, ...column }) => ({
      ...column,
      sortable: sortable ?? sortValue !== undefined,
    })),
  ]

  const from = total === 0 ? 0 : pageSize ? (currentPage - 1) * pageSize + 1 : 1
  const to = pageSize ? Math.min(currentPage * pageSize, total) : total

  return (
    <div className={cn('flex w-full flex-col gap-3', className, classNames?.root)}>
      {(showSearch || toolbar) && (
        <div className={cn('flex flex-wrap items-center gap-2', classNames?.toolbar)}>
          {showSearch && (
            <Input
              type="search"
              aria-label={searchPlaceholder.replace(/…$/, '')}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<Search aria-hidden="true" strokeWidth={1.5} />}
              size="tiny"
              className="w-full max-w-64"
            />
          )}
          {toolbar != null && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-default">
        <Table
          columns={tableColumns}
          data={pageRows}
          rowKey={rowKey}
          caption={caption}
          sort={sort}
          onSortChange={(column) => setSort(nextSort(sort, column))}
          onRowClick={onRowClick}
          classNames={classNames}
        />
        {pageRows.length === 0 && (
          <p role="status" className="px-4 py-10 text-center text-sm text-foreground-lighter">
            {emptyText}
          </p>
        )}
      </div>

      {(pageSize !== null || selectable) && (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 text-xs text-foreground-lighter',
            classNames?.footer
          )}
        >
          <p aria-live="polite" className="tabular-nums">
            {selectable && selected.length > 0 ? `${selected.length} selected · ` : ''}
            {total === 0 ? '0 rows' : `${from}–${to} of ${total}`}
          </p>
          {pageSize !== null && totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              page={currentPage}
              onPageChange={setPage}
              previousLabel={null}
              nextLabel={null}
              className="mx-0 w-auto"
            />
          )}
        </div>
      )}
    </div>
  )
}
