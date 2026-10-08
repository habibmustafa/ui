import { Mail } from 'lucide-react'
import { useId, useState } from 'react'

import { Avatar, Badge, Button, ConfirmPopover, Input, Select, toast } from '../../src'

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

interface Invite {
  email: string
  role: string
  sent: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function InviteMembers() {
  const errorId = useId()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [error, setError] = useState<string | null>(null)
  const [invites, setInvites] = useState<Invite[]>([
    { email: 'grace@example.com', role: 'admin', sent: 'Sent 2 days ago' },
    { email: 'linus@example.com', role: 'viewer', sent: 'Sent 5 days ago' },
  ])

  const send = () => {
    const value = email.trim()
    if (!EMAIL.test(value)) return setError('Enter a valid email address.')
    if (invites.some((invite) => invite.email === value)) return setError('That address already has an invitation.')
    setInvites((current) => [{ email: value, role, sent: 'Sent just now' }, ...current])
    setEmail('')
    setError(null)
    toast.success(`Invitation sent to ${value}`)
  }

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Invite members</h3>
          <p className="mt-0.5 text-sm text-foreground-light">They get an email with a link that works for 7 days.</p>
        </div>
        <p className="shrink-0 pt-1 text-sm tabular-nums text-foreground-light">8 of 10 seats used</p>
      </div>

      <div className="border-b bg-surface-75 px-6 py-5">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            send()
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
            prefix={<Mail className="h-4 w-4 text-foreground-muted" aria-hidden="true" />}
            placeholder="name@company.com"
            aria-label="Email address"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            autoComplete="off"
            size="medium"
            className="flex-1"
          />
          <Select options={ROLES} value={role} onValueChange={setRole} aria-label="Role" className="sm:w-32" />
          <Button type="submit" variant="primary" size="medium">
            Send invite
          </Button>
        </form>
        {error && (
          <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-6">
        <h4 className="text-sm font-medium text-foreground">Waiting for a reply ({invites.length})</h4>
        {invites.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-foreground-light">
            No pending invitations. Invite someone above and they will show up here.
          </p>
        ) : (
          <ul className="mt-4 divide-y rounded-lg border">
            {invites.map((invite) => (
              <li key={invite.email} className="flex items-center gap-3 px-4 py-3 text-sm">
                <Avatar fallback={invite.email[0].toUpperCase()} className="h-9 w-9 text-sm font-medium" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{invite.email}</p>
                  <p className="text-xs text-foreground-lighter">{invite.sent}</p>
                </div>
                <Badge variant="default" className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal">
                  {ROLES.find((r) => r.value === invite.role)?.label}
                </Badge>
                <ConfirmPopover
                  trigger={
                    <Button size="tiny" variant="text">
                      Revoke
                    </Button>
                  }
                  title={`Revoke the invitation for ${invite.email}?`}
                  description="The link in their email stops working."
                  confirmText="Revoke"
                  destructive
                  onConfirm={() => {
                    setInvites((current) => current.filter((item) => item.email !== invite.email))
                    toast.success('Invitation revoked')
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
