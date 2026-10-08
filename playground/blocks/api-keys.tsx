import { KeyRound } from 'lucide-react'
import { useState } from 'react'

import { Banner, Button, ConfirmPopover, CopyButton, Dialog, Input, Label, Table, toast, type TableColumn } from '../../src'

interface ApiKey {
  id: string
  name: string
  hint: string
  created: string
  used: string
}

const initial: ApiKey[] = [
  { id: 'k1', name: 'Production server', hint: 'a41c', created: 'Aug 12, 2026', used: '2 hours ago' },
  { id: 'k2', name: 'CI pipeline', hint: '7be0', created: 'Jul 3, 2026', used: 'Sep 28, 2026' },
]

/** A made-up secret: shown once, in full, and never stored in the list. */
const makeSecret = () => `sk_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`

export default function ApiKeys() {
  const [keys, setKeys] = useState(initial)
  const [name, setName] = useState('')
  const [secret, setSecret] = useState<string | null>(null)

  const create = () => {
    const value = makeSecret()
    setKeys((current) => [
      { id: value, name: name.trim() || 'Untitled key', hint: value.slice(-4), created: 'Today', used: 'Never' },
      ...current,
    ])
    setSecret(value)
    setName('')
  }

  const columns: TableColumn<ApiKey>[] = [
    { key: 'name', header: 'Name', render: (key) => <span className="font-medium text-foreground">{key.name}</span> },
    {
      key: 'key',
      header: 'Key',
      render: (key) => (
        <code className="rounded-sm border bg-surface-75 px-1.5 py-0.5 font-mono text-xs text-foreground-light">
          sk_live_••••{key.hint}
        </code>
      ),
    },
    { key: 'created', header: 'Created', render: (key) => key.created },
    { key: 'used', header: 'Last used', render: (key) => key.used },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (key) => (
        <ConfirmPopover
          trigger={
            <Button size="tiny" variant="text" aria-label={`Revoke ${key.name}`}>
              Revoke
            </Button>
          }
          title={`Revoke “${key.name}”?`}
          description="Anything using this key stops working right away."
          confirmText="Revoke key"
          destructive
          onConfirm={() => {
            setKeys((current) => current.filter((item) => item.id !== key.id))
            toast.success('Key revoked')
          }}
        />
      ),
    },
  ]

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">API keys</h3>
          <p className="mt-0.5 text-sm text-foreground-light">Keys let a server act on behalf of this project.</p>
        </div>
        <Dialog
          trigger={
            <Button variant="primary" icon={<KeyRound />}>
              Create key
            </Button>
          }
          title="Create an API key"
          description="Give it a name you will recognise later, like the service that will use it."
          confirmText="Create key"
          cancelText="Cancel"
          onConfirm={create}
        >
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="api-key-name">Name</Label>
            <Input
              id="api-key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Production server"
              autoComplete="off"
            />
          </div>
        </Dialog>
      </div>

      <div className="flex flex-col gap-5 p-6">
        {secret && (
          <Banner
            variant="brand"
            title="Copy your new key now"
            dismissible
            open
            onOpenChange={(open) => !open && setSecret(null)}
            action={<CopyButton value={secret} label="Copy key" copiedLabel="Copied" size="tiny" />}
          >
            <code className="font-mono text-xs">{secret}</code>
            <span className="block text-xs">You will not be able to see it again.</span>
          </Banner>
        )}

        {keys.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-surface-75 p-10 text-center text-sm text-foreground-light">
            No keys yet. Create one to connect a server.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table columns={columns} data={keys} rowKey={(key) => key.id} caption="API keys" classNames={{ caption: 'sr-only' }} />
          </div>
        )}
      </div>
    </div>
  )
}
