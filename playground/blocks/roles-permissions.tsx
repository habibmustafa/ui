import { Lock } from 'lucide-react'
import { useState } from 'react'

import { Checkbox, Table, type TableColumn } from '../../src'

const ROLES = ['Viewer', 'Editor', 'Admin'] as const
type Role = (typeof ROLES)[number]

interface Permission {
  id: string
  label: string
  detail: string
}

const PERMISSIONS: Permission[] = [
  { id: 'view', label: 'View projects', detail: 'Read everything in a project.' },
  { id: 'edit', label: 'Edit content', detail: 'Change pages, files and settings of a project.' },
  { id: 'publish', label: 'Publish', detail: 'Send a project live.' },
  { id: 'invite', label: 'Invite people', detail: 'Add members and choose their role.' },
  { id: 'billing', label: 'See billing', detail: 'Open invoices and the payment method.' },
]

type Grants = Record<Role, Record<string, boolean>>

const initial: Grants = {
  Viewer: { view: true, edit: false, publish: false, invite: false, billing: false },
  Editor: { view: true, edit: true, publish: false, invite: false, billing: false },
  Admin: { view: true, edit: true, publish: true, invite: true, billing: false },
}

export default function RolesPermissions() {
  const [grants, setGrants] = useState(initial)

  const toggle = (role: Role, id: string, value: boolean) =>
    setGrants((current) => ({ ...current, [role]: { ...current[role], [id]: value } }))

  const columns: TableColumn<Permission>[] = [
    {
      key: 'permission',
      header: 'Permission',
      render: (permission) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{permission.label}</span>
          <span className="text-xs text-foreground-lighter">{permission.detail}</span>
        </div>
      ),
    },
    ...ROLES.map((role) => ({
      key: role,
      header: role,
      align: 'right' as const,
      render: (permission: Permission) => (
        <Checkbox
          checked={grants[role][permission.id]}
          onCheckedChange={(checked) => toggle(role, permission.id, checked === true)}
          aria-label={`${role} can ${permission.label.toLowerCase()}`}
        />
      ),
    })),
    {
      key: 'Owner',
      header: 'Owner',
      align: 'right' as const,
      render: (permission) => (
        <span className="inline-flex items-center gap-1 text-xs text-foreground-lighter">
          <Lock className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">Owner can {permission.label.toLowerCase()}, always</span>
          Always
        </span>
      ),
    },
  ]

  const granted = (role: Role) => Object.values(grants[role]).filter(Boolean).length

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Roles and permissions</h3>
        <p className="mt-0.5 text-sm text-foreground-light">Choose what each role can do. The owner can always do everything.</p>
      </div>

      <div className="p-6">
        <div className="overflow-hidden rounded-lg border">
          <Table
            columns={columns}
            data={PERMISSIONS}
            rowKey={(permission) => permission.id}
            caption="Permissions by role"
            classNames={{ caption: 'sr-only' }}
          />
        </div>
        <p className="mt-4 text-sm text-foreground-light" aria-live="polite">
          {ROLES.map((role) => `${role}: ${granted(role)} of ${PERMISSIONS.length}`).join(', ')}
        </p>
      </div>
    </div>
  )
}
