import { useMemo, useState } from 'react'

import { DataTable, filterRows, parseSort, sortRows, type DataTableColumn } from '../../../src'
import { members, type Member } from './data'

const PAGE_SIZE = 5

const columns: DataTableColumn<Member>[] = [
  { key: 'name', header: 'Name', render: (m) => m.name, sortable: true },
  { key: 'role', header: 'Role', render: (m) => m.role, sortable: true },
  { key: 'projects', header: 'Projects', align: 'right', render: (m) => m.projects, sortable: true },
]

// Server-side mode: DataTable only reports search/sort/page; this component plays the
// server (here with the same helpers DataTable uses) and passes one page + totalRows.
export default function DataTableServer() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('projects:desc')
  const [page, setPage] = useState(1)

  const { rows, total } = useMemo(() => {
    let result = filterRows(members, search, (m) => [m.name, m.role])
    const active = parseSort(sort)
    if (active) {
      const pick = { name: (m: Member) => m.name, role: (m: Member) => m.role, projects: (m: Member) => m.projects }
      result = sortRows(result, pick[active.column as keyof typeof pick], active.direction)
    }
    return { rows: result.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: result.length }
  }, [search, sort, page])

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={rows}
        totalRows={total}
        rowKey={(m) => m.id}
        pageSize={PAGE_SIZE}
        searchable
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}
