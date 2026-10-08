import { MoreHorizontal, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, Badge, Button, ConfirmPopover, DataTable, DropdownMenu, Select, toast, type DataTableColumn } from '../../src'

type Role = 'Owner' | 'Admin' | 'Developer' | 'Viewer'

interface Member {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Invited'
  lastActive: string
}

const initial: Member[] = [
  { id: 'm1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', status: 'Active', lastActive: 'Just now' },
  { id: 'm2', name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'Active', lastActive: '12 minutes ago' },
  { id: 'm3', name: 'Linus Torvalds', email: 'linus@example.com', role: 'Developer', status: 'Active', lastActive: '2 hours ago' },
  { id: 'm4', name: 'Margaret Hamilton', email: 'margaret@example.com', role: 'Developer', status: 'Active', lastActive: 'Yesterday' },
  { id: 'm5', name: 'Dennis Ritchie', email: 'dennis@example.com', role: 'Viewer', status: 'Invited', lastActive: 'Never' },
  { id: 'm6', name: 'Barbara Liskov', email: 'barbara@example.com', role: 'Admin', status: 'Active', lastActive: '3 days ago' },
  { id: 'm7', name: 'Ken Thompson', email: 'ken@example.com', role: 'Developer', status: 'Active', lastActive: 'Sep 24' },
  { id: 'm8', name: 'Radia Perlman', email: 'radia@example.com', role: 'Viewer', status: 'Active', lastActive: 'Sep 21' },
]

const ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: 'Owner', label: 'Owner' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Developer', label: 'Developer' },
  { value: 'Viewer', label: 'Viewer' },
]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

export default function MembersTable() {
  const [members, setMembers] = useState(initial)
  const [role, setRole] = useState('all')
  const [selected, setSelected] = useState<string[]>([])

  const rows = useMemo(() => (role === 'all' ? members : members.filter((member) => member.role === role)), [members, role])

  // The owner can never be removed, so a selection that includes them skips that row.
  const removable = selected.filter((id) => members.find((member) => member.id === id)?.role !== 'Owner')

  const remove = (ids: string[]) => {
    setMembers((current) => current.filter((member) => !ids.includes(member.id)))
    setSelected((current) => current.filter((id) => !ids.includes(id)))
    toast.success(ids.length === 1 ? 'Member removed' : `${ids.length} members removed`)
  }

  const columns: DataTableColumn<Member>[] = [
    {
      key: 'name',
      header: 'Member',
      render: (member) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={initials(member.name)} className="h-8 w-8 text-xs font-medium" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">{member.name}</span>
            <span className="truncate text-xs text-foreground-lighter">{member.email}</span>
          </div>
        </div>
      ),
      sortValue: (member) => member.name,
      searchValue: (member) => `${member.name} ${member.email}`,
    },
    { key: 'role', header: 'Role', render: (member) => member.role, sortValue: (member) => member.role },
    {
      key: 'status',
      header: 'Status',
      render: (member) => (
        <Badge
          variant={member.status === 'Active' ? 'success' : 'warning'}
          className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal"
        >
          {member.status}
        </Badge>
      ),
    },
    { key: 'active', header: 'Last active', render: (member) => <span className="text-foreground-light">{member.lastActive}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (member) => (
        <DropdownMenu
          align="end"
          trigger={<Button size="tiny" variant="text" icon={<MoreHorizontal />} aria-label={`Actions for ${member.name}`} />}
          items={[
            {
              key: 'admin',
              label: 'Make admin',
              disabled: member.role === 'Admin' || member.role === 'Owner',
              onSelect: () => {
                setMembers((current) => current.map((item) => (item.id === member.id ? { ...item, role: 'Admin' } : item)))
                toast.success(`${member.name} is now an admin`)
              },
            },
            { key: 'sep', type: 'separator' },
            { key: 'remove', label: 'Remove from team', disabled: member.role === 'Owner', onSelect: () => remove([member.id]) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Members</h3>
          <p className="mt-0.5 text-sm text-foreground-light">{members.length} people can open this workspace.</p>
        </div>
        <Button variant="primary" icon={<UserPlus />}>
          Invite
        </Button>
      </div>

      <div className="p-6">
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(member) => member.id}
          pageSize={6}
          defaultSort="name:asc"
          searchPlaceholder="Search by name or email"
          emptyText="No members match. Clear the search or pick another role."
          caption="Workspace members"
          classNames={{ caption: 'sr-only' }}
          selectable
          selectedKeys={selected}
          onSelectedKeysChange={setSelected}
          getRowLabel={(member) => `Select ${member.name}`}
          toolbar={
            <div className="flex items-center gap-2">
              <Select options={ROLE_FILTERS} value={role} onValueChange={setRole} aria-label="Filter by role" className="w-36" />
              {removable.length > 0 && (
                <ConfirmPopover
                  trigger={
                    <Button size="small" variant="danger">
                      Remove {removable.length} selected
                    </Button>
                  }
                  title={`Remove ${removable.length === 1 ? 'this member' : `these ${removable.length} members`}?`}
                  description="They lose access right away. You can invite them again later."
                  confirmText="Remove"
                  destructive
                  onConfirm={() => remove(removable)}
                />
              )}
            </div>
          }
        />
      </div>
    </div>
  )
}
