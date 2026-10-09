import { useState } from 'react'

import { Button, Switch, Table, TimePicker, toast, type TableColumn } from '../../src'

const CHANNELS = ['Email', 'Push', 'Slack'] as const
type Channel = (typeof CHANNELS)[number]

const EVENTS = [
  { id: 'mentions', label: 'Mentions and replies', detail: 'When someone writes to you.' },
  { id: 'deploys', label: 'Deploys', detail: 'When a release goes out or fails.' },
  { id: 'billing', label: 'Billing', detail: 'Invoices and failed payments.' },
  { id: 'digest', label: 'Weekly summary', detail: 'One message every Monday.' },
]

type Settings = {
  channels: Record<string, Record<Channel, boolean>>
  quiet: boolean
  from: string | null
  to: string | null
}

const saved: Settings = {
  channels: {
    mentions: { Email: true, Push: true, Slack: true },
    deploys: { Email: false, Push: true, Slack: true },
    billing: { Email: true, Push: false, Slack: false },
    digest: { Email: true, Push: false, Slack: false },
  },
  quiet: true,
  from: '22:00',
  to: '07:00',
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState(saved)
  const [baseline, setBaseline] = useState(saved)
  const changed = JSON.stringify(settings) !== JSON.stringify(baseline)

  const toggle = (id: string, channel: Channel, value: boolean) =>
    setSettings((current) => ({
      ...current,
      channels: { ...current.channels, [id]: { ...current.channels[id], [channel]: value } },
    }))

  const columns: TableColumn<(typeof EVENTS)[number]>[] = [
    {
      key: 'event',
      header: 'Tell me about',
      render: (event) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{event.label}</span>
          <span className="text-xs text-foreground-lighter">{event.detail}</span>
        </div>
      ),
    },
    ...CHANNELS.map((channel) => ({
      key: channel,
      header: channel,
      align: 'right' as const,
      render: (event: (typeof EVENTS)[number]) => (
        <Switch
          checked={settings.channels[event.id][channel]}
          onCheckedChange={(value) => toggle(event.id, channel, value)}
          aria-label={`${event.label} by ${channel.toLowerCase()}`}
        />
      ),
    })),
  ]

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Notifications</h3>
        <p className="mt-0.5 text-sm text-foreground-light">Choose where each kind of message reaches you.</p>
      </div>

      <div className="p-6">
        <div className="overflow-hidden rounded-lg border">
          <Table columns={columns} data={EVENTS} rowKey={(event) => event.id} caption="Notification channels" classNames={{ caption: 'sr-only' }} />
        </div>
      </div>

      <section aria-labelledby="notify-quiet" className="border-t px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 id="notify-quiet" className="text-sm font-medium text-foreground">
              Quiet hours
            </h4>
            <p className="text-xs text-foreground-lighter">Push and Slack wait until the quiet time is over.</p>
          </div>
          <Switch checked={settings.quiet} onCheckedChange={(quiet) => setSettings((current) => ({ ...current, quiet }))} aria-labelledby="notify-quiet" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-foreground-light">
          <span>From</span>
          <TimePicker
            aria-label="Quiet hours start"
            value={settings.from}
            onValueChange={(from) => setSettings((current) => ({ ...current, from }))}
            disabled={!settings.quiet}
          />
          <span>to</span>
          <TimePicker
            aria-label="Quiet hours end"
            value={settings.to}
            onValueChange={(to) => setSettings((current) => ({ ...current, to }))}
            disabled={!settings.quiet}
          />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 border-t bg-surface-75 px-6 py-3.5">
        <p className="text-sm text-foreground-light" aria-live="polite">
          {changed ? 'You have unsaved changes.' : 'All changes saved.'}
        </p>
        <div className="flex gap-2">
          <Button disabled={!changed} onClick={() => setSettings(baseline)}>
            Discard
          </Button>
          <Button
            variant="primary"
            disabled={!changed}
            onClick={() => {
              setBaseline(settings)
              toast.success('Notification settings saved')
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
