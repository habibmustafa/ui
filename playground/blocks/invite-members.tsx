import { useId, useState } from 'react'

import { Badge, Button, ConfirmPopover, Input, Select, toast } from '../../src'

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

interface Invite {
  email: string
  role: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function InviteMembers() {
  const errorId = useId()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [error, setError] = useState<string | null>(null)
  const [invites, setInvites] = useState<Invite[]>([
    { email: 'grace@example.com', role: 'admin' },
    { email: 'linus@example.com', role: 'viewer' },
  ])

  const send = () => {
    const value = email.trim()
    if (!EMAIL.test(value)) return setError('Enter a valid email address.')
    if (invites.some((invite) => invite.email === value)) return setError('That address already has an invitation.')
    setInvites((current) => [{ email: value, role }, ...current])
    setEmail('')
    setError(null)
    toast.success(`Invitation sent to ${value}`)
  }

  return (
    <div className="w-full max-w-xl">
      <h3 className="text-xl font-semibold text-foreground">Invite members</h3>
      <p className="mt-1 text-sm text-foreground-light">They get an email with a link that works for 7 days.</p>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <Input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setError(null)
          }}
          placeholder="name@company.com"
          aria-label="Email address"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
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

      <h4 className="mt-8 text-sm font-medium text-foreground">Waiting for a reply ({invites.length})</h4>
      {invites.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed p-6 text-center text-sm text-foreground-light">
          No pending invitations. Invite someone above and they will show up here.
        </p>
      ) : (
        <ul className="mt-3 divide-y rounded-md border">
          {invites.map((invite) => (
            <li key={invite.email} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-foreground">{invite.email}</span>
              <Badge variant="default" className="normal-case">
                {ROLES.find((r) => r.value === invite.role)?.label}
              </Badge>
              <Badge variant="warning" className="normal-case">
                Pending
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
  )
}
