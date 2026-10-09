import { useMemo, useState } from 'react'

import { Chart, DateRangePicker, Gauge, Statistic, Table, type DateRange, type TableColumn } from '../../src'

/** Fixed so the block renders the same everywhere; a real page would use today. */
const TODAY = new Date(2026, 8, 30)
const day = (offset: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + offset)
const MS_PER_DAY = 86_400_000
const daysIn = (range: DateRange) => Math.round(((range.to ?? range.from!).getTime() - range.from!.getTime()) / MS_PER_DAY) + 1

const label = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/** Made-up but steady numbers: the same day always gives the same visitors. */
const visitorsOn = (date: Date) => {
  const index = Math.round(date.getTime() / MS_PER_DAY)
  return Math.round(1000 + 450 * Math.sin(index / 2.2) + (index % 7) * 60)
}

const pages = [
  { path: '/pricing', share: 0.31, conversion: 4.8 },
  { path: '/docs/getting-started', share: 0.26, conversion: 2.1 },
  { path: '/blog/release-notes', share: 0.18, conversion: 1.2 },
  { path: '/signup', share: 0.12, conversion: 18.4 },
]

interface Row {
  path: string
  visits: number
  conversion: number
}

const columns: TableColumn<Row>[] = [
  { key: 'path', header: 'Page', render: (row) => <span className="font-mono text-xs text-foreground">{row.path}</span> },
  { key: 'visits', header: 'Visits', align: 'right', render: (row) => <span className="tabular-nums">{row.visits.toLocaleString('en-US')}</span> },
  { key: 'conversion', header: 'Conversion', align: 'right', render: (row) => <span className="tabular-nums">{row.conversion}%</span> },
]

export default function Analytics() {
  const [range, setRange] = useState<DateRange | undefined>({ from: day(-6), to: day(0) })

  const data = useMemo(() => {
    if (!range?.from) return null
    const days = Array.from({ length: daysIn(range) }, (_, index) => {
      const date = new Date(range.from!.getFullYear(), range.from!.getMonth(), range.from!.getDate() + index)
      return { date, visitors: visitorsOn(date) }
    })
    // At most eight bars, so a 90-day period stays readable.
    const size = Math.ceil(days.length / 8)
    const buckets = Array.from({ length: Math.ceil(days.length / size) }, (_, index) => {
      const slice = days.slice(index * size, (index + 1) * size)
      return { period: label(slice[0].date), visitors: slice.reduce((sum, item) => sum + item.visitors, 0) }
    })
    const visitors = days.reduce((sum, item) => sum + item.visitors, 0)
    return { buckets, visitors, rows: pages.map((page) => ({ path: page.path, visits: Math.round(visitors * page.share), conversion: page.conversion })) }
  }, [range])

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Analytics</h3>
          <p className="text-sm text-foreground-light">Traffic and sign-ups for the marketing site.</p>
        </div>
        <DateRangePicker
          value={range}
          onValueChange={setRange}
          aria-label="Report period"
          className="w-72"
          maxDate={day(0)}
          presets={[
            { label: 'Last 7 days', range: () => ({ from: day(-6), to: day(0) }) },
            { label: 'Last 30 days', range: () => ({ from: day(-29), to: day(0) }) },
            { label: 'Last 90 days', range: () => ({ from: day(-89), to: day(0) }) },
          ]}
        />
      </div>

      {data ? (
        <>
          <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-6">
              <Statistic title="Visitors" value={data.visitors} locale="en-US" size="large" />
            </div>
            <div className="p-6">
              <Statistic title="Sign-ups" value={Math.round(data.visitors * 0.034)} locale="en-US" size="large" />
            </div>
            <div className="flex items-center justify-between gap-4 p-6">
              <Gauge value={38} label="Bounce rate" formatValue={(value) => `${value}%`} size={96} aria-label="Bounce rate" />
            </div>
          </div>

          <div className="border-t p-6">
            <h4 className="text-sm font-medium text-foreground">Visitors over the period</h4>
            <Chart
              className="mt-4 aspect-auto h-56 w-full"
              data={data.buckets}
              xKey="period"
              showGrid
              series={[{ key: 'visitors', label: 'Visitors', color: 'var(--chart-1)' }]}
            />
          </div>

          <div className="border-t p-6">
            <h4 className="text-sm font-medium text-foreground">Top pages</h4>
            <div className="mt-4 overflow-hidden rounded-lg border">
              <Table columns={columns} data={data.rows} rowKey={(row) => row.path} caption="Top pages" classNames={{ caption: 'sr-only' }} />
            </div>
          </div>
        </>
      ) : (
        <p className="p-12 text-center text-sm text-foreground-light">Pick a period to see how the site did.</p>
      )}
    </div>
  )
}
