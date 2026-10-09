import { Laptop, Smartphone, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDialog, Badge, Button, ConfirmPopover, Switch, toast } from '../../src'

interface Session {
  id: string
  device: string
  place: string
  seen: string
  current?: boolean
  phone?: boolean
}

const initial: Session[] = [
  { id: 's1', device: 'MacBook Pro, Chrome', place: 'Baku, Azerbaijan', seen: 'This device', current: true },
  { id: 's2', device: 'iPhone 15, Safari', place: 'Baku, Azerbaijan', seen: '2 hours ago', phone: true },
  { id: 's3', device: 'Windows PC, Edge', place: 'Istanbul, Türkiye', seen: 'Sep 18' },
]

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(true)
  const [sessions, setSessions] = useState(initial)

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Security</h3>
        <p className="mt-0.5 text-sm text-foreground-light">Keep your account safe and see where you are signed in.</p>
      </div>

      <section aria-labelledby="security-signin" className="flex flex-col gap-4 px-6 py-6">
        <h4 id="security-signin" className="text-sm font-medium text-foreground">
          Signing in
        </h4>
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-surface-75 px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">Password</p>
            <p className="text-xs text-foreground-lighter">Last changed 4 months ago.</p>
          </div>
          <Button size="small">Change password</Button>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-surface-75 px-4 py-3.5">
          <div>
            <p id="security-2fa-label" className="text-sm font-medium text-foreground">
              Two-factor sign-in
            </p>
            <p className="text-xs text-foreground-lighter">Ask for a code from your authenticator app.</p>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} aria-labelledby="security-2fa-label" />
        </div>
        {!twoFactor && (
          <Alert
            variant="warning"
            icon={<TriangleAlert />}
            title="Two-factor sign-in is off"
            description="Anyone with your password can open this account. Turn it back on to stay protected."
          />
        )}
      </section>

      <section aria-labelledby="security-sessions" className="border-t px-6 py-6">
        <h4 id="security-sessions" className="text-sm font-medium text-foreground">
          Where you are signed in
        </h4>
        <ul className="mt-4 divide-y rounded-lg border">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-surface-75 text-foreground-light [&_svg]:h-4 [&_svg]:w-4"
              >
                {session.phone ? <Smartphone /> : <Laptop />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{session.device}</p>
                <p className="text-xs text-foreground-lighter">
                  {session.place}, {session.seen}
                </p>
              </div>
              {session.current ? (
                <Badge variant="success" className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal">
                  This device
                </Badge>
              ) : (
                <ConfirmPopover
                  trigger={
                    <Button size="tiny" variant="text" aria-label={`Sign out ${session.device}`}>
                      Sign out
                    </Button>
                  }
                  title="Sign out this device?"
                  description="It will have to sign in again."
                  confirmText="Sign out"
                  destructive
                  onConfirm={() => {
                    setSessions((current) => current.filter((item) => item.id !== session.id))
                    toast.success('Device signed out')
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="security-danger" className="border-t px-6 py-6">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border-destructive/60 px-4 py-3.5">
          <div>
            <h4 id="security-danger" className="text-sm font-medium text-foreground">
              Delete account
            </h4>
            <p className="text-xs text-foreground-lighter">Removes your profile and every project you own.</p>
          </div>
          <AlertDialog
            trigger={<Button variant="danger">Delete account</Button>}
            title="Delete your account?"
            description="This cannot be undone. Your projects and API keys are deleted right away."
            confirmText="Delete account"
            confirmVariant="danger"
            onConfirm={() => {
              toast.success('Account scheduled for deletion')
            }}
          />
        </div>
      </section>
    </div>
  )
}
