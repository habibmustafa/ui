import { Download } from 'lucide-react'
import { useState } from 'react'

import { Badge, Button, Progress, RadioGroupCard, Table, type TableColumn } from '../../src'

const plans = [
  { value: 'free', name: 'Free', price: '$0', note: '1 project, 3 members' },
  { value: 'pro', name: 'Pro', price: '$12', note: 'Unlimited projects, 10 members' },
  { value: 'team', name: 'Team', price: '$29', note: 'Everything in Pro, SSO and audit log' },
]

interface Invoice {
  id: string
  date: string
  amount: string
  status: 'Paid' | 'Refunded'
}

const invoices: Invoice[] = [
  { id: 'INV-2041', date: 'Sep 1, 2026', amount: '$120.00', status: 'Paid' },
  { id: 'INV-1987', date: 'Aug 1, 2026', amount: '$120.00', status: 'Paid' },
  { id: 'INV-1930', date: 'Jul 1, 2026', amount: '$96.00', status: 'Refunded' },
]

const columns: TableColumn<Invoice>[] = [
  { key: 'id', header: 'Invoice', render: (invoice) => <span className="font-mono text-xs text-foreground">{invoice.id}</span> },
  { key: 'date', header: 'Date', render: (invoice) => invoice.date },
  { key: 'amount', header: 'Amount', align: 'right', render: (invoice) => <span className="tabular-nums">{invoice.amount}</span> },
  {
    key: 'status',
    header: 'Status',
    render: (invoice) => (
      <Badge
        variant={invoice.status === 'Paid' ? 'success' : 'default'}
        className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal"
      >
        {invoice.status}
      </Badge>
    ),
  },
  {
    key: 'download',
    header: <span className="sr-only">Download</span>,
    align: 'right',
    render: (invoice) => (
      <Button size="tiny" icon={<Download />} aria-label={`Download invoice ${invoice.id}`}>
        PDF
      </Button>
    ),
  },
]

function Usage({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const percent = Math.round((used / total) * 100)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-foreground-light">
          {used} of {total} {unit}
        </span>
      </div>
      <Progress value={percent} aria-label={`${label}: ${percent}% used`} />
      <p className="text-xs text-foreground-lighter">
        {total - used} {unit} left
      </p>
    </div>
  )
}

export default function Billing() {
  const [plan, setPlan] = useState('pro')

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Billing and plan</h3>
        <p className="mt-0.5 text-sm text-foreground-light">Your next invoice is $120.00, due on Oct 1, 2026.</p>
      </div>

      <section aria-labelledby="billing-plan" className="px-6 py-6">
        <h4 id="billing-plan" className="text-sm font-medium text-foreground">
          Plan
        </h4>
        <RadioGroupCard
          aria-labelledby="billing-plan"
          value={plan}
          onValueChange={setPlan}
          className="mt-4 grid gap-3 sm:grid-cols-3"
          classNames={{
            item: 'w-full rounded-lg bg-surface-75 p-4 data-[state=checked]:border-brand-default data-[state=checked]:bg-brand-default/5 data-[state=checked]:ring-1 data-[state=checked]:ring-brand-default',
          }}
          options={plans.map((item) => ({
            value: item.value,
            label: (
              <span className="flex flex-col gap-1.5 text-left">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="flex items-baseline gap-1 text-foreground">
                  <span className="text-2xl font-semibold tabular-nums">{item.price}</span>
                  <span className="text-xs text-foreground-lighter">per seat / month</span>
                </span>
                <span className="text-xs leading-relaxed text-foreground-light">{item.note}</span>
              </span>
            ),
          }))}
        />
      </section>

      <section aria-labelledby="billing-usage" className="border-t px-6 py-6">
        <h4 id="billing-usage" className="text-sm font-medium text-foreground">
          This month
        </h4>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Usage label="Members" used={8} total={10} unit="seats" />
          <Usage label="Storage" used={62} total={100} unit="GB" />
        </div>
      </section>

      <section aria-labelledby="billing-invoices" className="border-t px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <h4 id="billing-invoices" className="text-sm font-medium text-foreground">
            Invoices
          </h4>
          <Button size="tiny" icon={<Download />}>
            Download all
          </Button>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <Table columns={columns} data={invoices} rowKey={(invoice) => invoice.id} caption="Past invoices" classNames={{ caption: 'sr-only' }} />
        </div>
      </section>
    </div>
  )
}
