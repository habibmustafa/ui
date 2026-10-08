import { Avatar, Badge, Chart, MetricCard } from '../../src'

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

export default function Dashboard() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Revenue"
          value="$54.0k"
          differential="+12.4%"
          differentialVariant="positive"
          sparklineData={revenue}
          sparklineDataKey="value"
        />
        <MetricCard
          label="Active users"
          value="1,384"
          differential="+17.3%"
          differentialVariant="positive"
          sparklineData={users}
          sparklineDataKey="value"
        />
        <MetricCard
          label="Churn"
          value="2.9%"
          differential="+0.5%"
          differentialVariant="negative"
          sparklineData={churn}
          sparklineDataKey="value"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="dash-revenue" className="rounded-lg border bg-surface-75 p-5">
          <h3 id="dash-revenue" className="text-sm font-medium text-foreground">
            Revenue against target, in thousands
          </h3>
          <Chart
            className="mt-4 min-h-[220px] w-full"
            data={monthly}
            xKey="month"
            series={[
              { key: 'revenue', label: 'Revenue', color: 'var(--chart-1)' },
              { key: 'target', label: 'Target', color: 'var(--chart-2)' },
            ]}
          />
        </section>

        <section aria-labelledby="dash-activity" className="rounded-lg border bg-surface-75 p-5">
          <h3 id="dash-activity" className="text-sm font-medium text-foreground">
            Latest activity
          </h3>
          <ul className="mt-4 flex flex-col gap-4">
            {activity.map((item) => (
              <li key={item.who} className="flex items-start gap-3 text-sm">
                <Avatar fallback={item.initials} className="h-8 w-8 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground">
                    <span className="font-medium">{item.who}</span> {item.what}
                  </p>
                  <p className="text-xs text-foreground-lighter">{item.when}</p>
                </div>
                {item.alert && (
                  <Badge variant="warning" className="normal-case">
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
