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
  { key: 'date', header: 'Date', render: (invoice) => invoice.date },
  { key: 'amount', header: 'Amount', align: 'right', render: (invoice) => <span className="tabular-nums">{invoice.amount}</span> },
  {
    key: 'status',
    header: 'Status',
    render: (invoice) => (
      <Badge variant={invoice.status === 'Paid' ? 'success' : 'default'} className="normal-case">
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="tabular-nums text-foreground-light">
          {used} of {total} {unit}
        </span>
      </div>
      <Progress value={percent} aria-label={`${label}: ${percent}% used`} />
    </div>
  )
}

export default function Billing() {
  const [plan, setPlan] = useState('pro')

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <section aria-labelledby="billing-plan" className="flex flex-col gap-3">
        <h3 id="billing-plan" className="text-lg font-semibold text-foreground">
          Plan
        </h3>
        <RadioGroupCard
          aria-labelledby="billing-plan"
          value={plan}
          onValueChange={setPlan}
          className="grid gap-3 sm:grid-cols-3"
          options={plans.map((item) => ({
            value: item.value,
            label: (
              <span className="flex flex-col gap-1 text-left">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-foreground">
                  {item.price}
                  <span className="text-xs text-foreground-lighter"> per seat / month</span>
                </span>
                <span className="text-xs text-foreground-light">{item.note}</span>
              </span>
            ),
          }))}
        />
      </section>

      <section aria-labelledby="billing-usage" className="flex flex-col gap-4">
        <h3 id="billing-usage" className="text-lg font-semibold text-foreground">
          This month
        </h3>
        <Usage label="Members" used={8} total={10} unit="seats" />
        <Usage label="Storage" used={62} total={100} unit="GB" />
      </section>

      <section aria-labelledby="billing-invoices" className="flex flex-col gap-3">
        <h3 id="billing-invoices" className="text-lg font-semibold text-foreground">
          Invoices
        </h3>
        <Table columns={columns} data={invoices} rowKey={(invoice) => invoice.id} caption="Past invoices" />
      </section>
    </div>
  )
}
