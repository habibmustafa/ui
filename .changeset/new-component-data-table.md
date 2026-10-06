---
"@habibmustafa/ui": minor
---

New `DataTable` component on top of `Table`: search box (columns opt in with
`searchValue`), click-to-sort headers cycling asc → desc → off (`sortValue`, with
numeric-aware, stable sorting and empty values last), pagination via `Pagination`, and
row selection with a page-level select-all. Works in memory, or server-side by
controlling `search`/`sort`/`page` and passing `totalRows`. The `sortRows`,
`filterRows`, `nextSort`, `parseSort` and `compareSortValues` helpers are exported.
