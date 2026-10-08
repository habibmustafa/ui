import { Download } from 'lucide-react'

import { Avatar, Badge, Button, Chart, MetricCard } from '../../src'

const day = (offset: number) => `2026-09-${String(offset).padStart(2, '0')}T12:00:00.000Z`

const revenue = [
  { value: 410, timestamp: day(1) },
  { value: 430, timestamp: day(2) },
  { value: 420, timestamp: day(3) },
  { value: 470, timestamp: day(4) },
  { value: 455, timestamp: day(5) },
  { value: 510, timestamp: day(6) },
  { value: 540, timestamp: day(7) },
]
const users = [
  { value: 1180, timestamp: day(1) },
  { value: 1210, timestamp: day(2) },
  { value: 1190, timestamp: day(3) },
  { value: 1260, timestamp: day(4) },
  { value: 1295, timestamp: day(5) },
  { value: 1330, timestamp: day(6) },
  { value: 1384, timestamp: day(7) },
]
const churn = [
  { value: 2.4, timestamp: day(1) },
  { value: 2.5, timestamp: day(2) },
  { value: 2.3, timestamp: day(3) },
  { value: 2.6, timestamp: day(4) },
  { value: 2.8, timestamp: day(5) },
  { value: 2.7, timestamp: day(6) },
  { value: 2.9, timestamp: day(7) },
]

const monthly = [
  { month: 'Apr', revenue: 31, target: 30 },
  { month: 'May', revenue: 34, target: 33 },
  { month: 'Jun', revenue: 33, target: 36 },
  { month: 'Jul', revenue: 39, target: 38 },
  { month: 'Aug', revenue: 42, target: 41 },
  { month: 'Sep', revenue: 48, target: 44 },
]

const activity = [
  { who: 'Grace Hopper', initials: 'GH', what: 'upgraded to Team', when: '4 minutes ago' },
  { who: 'Linus Torvalds', initials: 'LT', what: 'invited 3 members', when: '27 minutes ago' },
  { who: 'Margaret Hamilton', initials: 'MH', what: 'cancelled Pro', when: '2 hours ago', alert: true },
  { who: 'Ada Lovelace', initials: 'AL', what: 'exported a report', when: 'Yesterday' },
]

const metrics = [
  { label: 'Revenue', value: '$54.0k', differential: '+12.4%', variant: 'positive', data: revenue },
  { label: 'Active users', value: '1,384', differential: '+17.3%', variant: 'positive', data: users },
  { label: 'Churn', value: '2.9%', differential: '+0.5%', variant: 'negative', data: churn },
] as const

export default function Dashboard() {
  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Overview</h3>
          <p className="text-sm text-foreground-light">Sep 1 to Sep 7, 2026, against the week before.</p>
        </div>
        <Button icon={<Download />}>Export</Button>
      </div>

      <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <MetricCard
              className="rounded-none border-0 bg-transparent px-6 py-5 shadow-none"
              label={metric.label}
              value={metric.value}
              differential={metric.differential}
              differentialVariant={metric.variant}
              sparklineData={metric.data}
              sparklineDataKey="value"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 border-t lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:divide-x">
        <section aria-labelledby="dash-revenue" className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 id="dash-revenue" className="text-sm font-medium text-foreground">
                Revenue against target
              </h4>
              <p className="text-xs text-foreground-lighter">In thousands of dollars, by month.</p>
            </div>
            <ul className="flex items-center gap-4 text-xs text-foreground-light" aria-label="Legend">
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: 'var(--chart-1)' }} />
                Revenue
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: 'var(--chart-2)' }} />
                Target
              </li>
            </ul>
          </div>
          <Chart
            className="mt-5 aspect-auto h-60 w-full"
            data={monthly}
            xKey="month"
            series={[
              { key: 'revenue', label: 'Revenue', color: 'var(--chart-1)' },
              { key: 'target', label: 'Target', color: 'var(--chart-2)' },
            ]}
          />
        </section>

        <section aria-labelledby="dash-activity" className="border-t p-6 lg:border-t-0">
          <h4 id="dash-activity" className="text-sm font-medium text-foreground">
            Latest activity
          </h4>
          <ul className="mt-5 flex flex-col gap-5">
            {activity.map((item) => (
              <li key={item.who} className="flex items-start gap-3 text-sm">
                <Avatar fallback={item.initials} className="h-8 w-8 text-xs font-medium" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground-light">
                    <span className="font-medium text-foreground">{item.who}</span> {item.what}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-lighter">{item.when}</p>
                </div>
                {item.alert && (
                  <Badge variant="warning" className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal">
                    At risk
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
