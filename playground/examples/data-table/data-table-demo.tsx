import { useState } from 'react'

import { Badge, Button, DataTable, type DataTableColumn } from '../../../src'
import { members, type Member } from './data'

const columns: DataTableColumn<Member>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (m) => (
      <div className="flex flex-col">
        <span className="text-foreground">{m.name}</span>
        <span className="text-xs text-foreground-lighter">{m.email}</span>
      </div>
    ),
    sortValue: (m) => m.name,
    searchValue: (m) => `${m.name} ${m.email}`,
  },
  {
    key: 'role',
    header: 'Role',
    render: (m) => <Badge variant={m.role === 'Owner' ? 'success' : 'default'}>{m.role}</Badge>,
    sortValue: (m) => m.role,
    searchValue: (m) => m.role,
  },
  {
    key: 'projects',
    header: 'Projects',
    align: 'right',
    render: (m) => <span className="tabular-nums">{m.projects}</span>,
    sortValue: (m) => m.projects,
  },
  {
    key: 'joined',
    header: 'Joined',
    render: (m) => m.joined.toISOString().slice(0, 10),
    sortValue: (m) => m.joined,
  },
]

export default function DataTableDemo() {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={members}
        rowKey={(m) => m.id}
        pageSize={8}
        defaultSort="name:asc"
        searchPlaceholder="Search members…"
        selectable
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        getRowLabel={(m) => `Select ${m.name}`}
        toolbar={
          <Button variant="default" size="tiny" disabled={selected.length === 0} onClick={() => setSelected([])}>
            Clear selection
          </Button>
        }
      />
    </div>
  )
}
