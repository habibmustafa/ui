import { useMemo, useState } from 'react'

import {
  Badge,
  CodeBlock,
  DataTable,
  MultiSelector,
  Sheet,
  TimestampInfo,
  type DataTableColumn,
} from '../../src'

type Kind = 'Sign-in' | 'Key' | 'Member' | 'Billing'

interface AuditEvent {
  id: string
  kind: Kind
  actor: string
  action: string
  at: string
  detail: string
}

const events: AuditEvent[] = [
  { id: 'e1', kind: 'Key', actor: 'Ada Lovelace', action: 'Created an API key', at: '2026-09-30T09:12:00Z', detail: '{\n  "key": "key_a41c",\n  "name": "Production server",\n  "scope": "read-write"\n}' },
  { id: 'e2', kind: 'Member', actor: 'Grace Hopper', action: 'Invited linus@example.com', at: '2026-09-30T08:41:00Z', detail: '{\n  "email": "linus@example.com",\n  "role": "viewer",\n  "expires": "7 days"\n}' },
  { id: 'e3', kind: 'Sign-in', actor: 'Linus Torvalds', action: 'Signed in from a new device', at: '2026-09-29T17:20:00Z', detail: '{\n  "device": "Windows PC, Edge",\n  "city": "Istanbul",\n  "twoFactor": true\n}' },
  { id: 'e4', kind: 'Billing', actor: 'Ada Lovelace', action: 'Changed the plan to Pro', at: '2026-09-29T11:05:00Z', detail: '{\n  "from": "free",\n  "to": "pro",\n  "seats": 8\n}' },
  { id: 'e5', kind: 'Key', actor: 'Grace Hopper', action: 'Revoked an API key', at: '2026-09-28T15:48:00Z', detail: '{\n  "key": "key_7be0",\n  "name": "CI pipeline",\n  "reason": "rotated"\n}' },
  { id: 'e6', kind: 'Member', actor: 'Ada Lovelace', action: 'Removed dennis@example.com', at: '2026-09-27T10:30:00Z', detail: '{\n  "email": "dennis@example.com",\n  "role": "viewer"\n}' },
  { id: 'e7', kind: 'Sign-in', actor: 'Margaret Hamilton', action: 'Failed to sign in', at: '2026-09-27T07:02:00Z', detail: '{\n  "reason": "wrong_password",\n  "attempts": 2\n}' },
]

const KINDS = [{ value: 'Sign-in' }, { value: 'Key' }, { value: 'Member' }, { value: 'Billing' }]

const columns: DataTableColumn<AuditEvent>[] = [
  {
    key: 'action',
    header: 'Event',
    render: (event) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{event.action}</span>
        <span className="text-xs text-foreground-lighter">{event.actor}</span>
      </div>
    ),
    sortValue: (event) => event.action,
    searchValue: (event) => `${event.action} ${event.actor}`,
  },
  {
    key: 'kind',
    header: 'Kind',
    render: (event) => (
      <Badge variant="default" className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal">
        {event.kind}
      </Badge>
    ),
  },
  { key: 'at', header: 'When', render: (event) => <TimestampInfo utcTimestamp={event.at} />, sortValue: (event) => event.at },
]

export default function AuditLog() {
  const [kinds, setKinds] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(() => (kinds.length === 0 ? events : events.filter((event) => kinds.includes(event.kind))), [kinds])
  const open = events.find((event) => event.id === openId)

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Audit log</h3>
        <p className="mt-0.5 text-sm text-foreground-light">Who did what in this workspace. Choose an event to see its details.</p>
      </div>

      <div className="p-6">
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(event) => event.id}
          pageSize={6}
          defaultSort="at:desc"
          searchPlaceholder="Search events or people"
          emptyText="No events match. Clear the search or the kind filter."
          caption="Audit events"
          classNames={{ caption: 'sr-only' }}
          onRowClick={(event) => setOpenId(event.id)}
          toolbar={<MultiSelector values={kinds} onValuesChange={setKinds} options={KINDS} label="All kinds" triggerClassName="w-44" />}
        />
      </div>

      <Sheet
        open={open !== undefined}
        onOpenChange={(next) => !next && setOpenId(null)}
        title={open?.action}
        description={open ? `${open.actor}, ${open.kind.toLowerCase()} event` : undefined}
        footer={null}
      >
        {open && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground-light">
              <TimestampInfo utcTimestamp={open.at} />
            </p>
            <CodeBlock title="Details" language="json" className="language-json" hideCopy>
              {open.detail}
            </CodeBlock>
          </div>
        )}
      </Sheet>
    </div>
  )
}
