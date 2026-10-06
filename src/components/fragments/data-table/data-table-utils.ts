export type SortDirection = 'asc' | 'desc'
export type SortValue = string | number | boolean | Date | null | undefined

/** `"<columnKey>:<asc|desc>"`, the same string Table's sortable headers use; "" = unsorted. */
export type SortState = string

export function parseSort(sort: SortState | undefined): { column: string; direction: SortDirection } | null {
  const [column, direction] = (sort ?? '').split(':')
  if (!column || (direction !== 'asc' && direction !== 'desc')) return null
  return { column, direction }
}

/** Header click cycle: unsorted → ascending → descending → unsorted. */
export function nextSort(sort: SortState | undefined, column: string): SortState {
  const current = parseSort(sort)
  if (!current || current.column !== column) return `${column}:asc`
  if (current.direction === 'asc') return `${column}:desc`
  return ''
}

// Numeric-aware and case-insensitive, so "Item 10" sorts after "Item 9" and "bob" next
// to "Bob". The collator's locale is fixed rather than the host default so the order
// doesn't change between machines (see docs/publish-and-deploy.md, known problems).
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

/** Compares two sort values; empty values (null/undefined/"") always sort last. */
export function compareSortValues(a: SortValue, b: SortValue): number {
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return collator.compare(String(a), String(b))
}

/** Stable sort by `getValue`; empty values stay last in both directions. */
export function sortRows<TRow>(
  rows: readonly TRow[],
  getValue: (row: TRow) => SortValue,
  direction: SortDirection
): TRow[] {
  return rows
    .map((row, index) => ({ row, index, value: getValue(row) }))
    .sort((x, y) => {
      const xEmpty = x.value === null || x.value === undefined || x.value === ''
      const yEmpty = y.value === null || y.value === undefined || y.value === ''
      if (xEmpty !== yEmpty) return xEmpty ? 1 : -1
      const result = compareSortValues(x.value, y.value)
      return (direction === 'asc' ? result : -result) || x.index - y.index
    })
    .map((entry) => entry.row)
}

/** Keeps rows where any of `getTexts(row)` contains every whitespace-separated term. */
export function filterRows<TRow>(
  rows: readonly TRow[],
  query: string,
  getTexts: (row: TRow) => readonly string[]
): TRow[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return [...rows]
  return rows.filter((row) => {
    const haystack = getTexts(row).join(' \u0000 ').toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
}
