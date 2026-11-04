import { Chart } from '../../../src'

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
]

export default function ChartPropsDemo() {
  return (
    <Chart
      className="min-h-50 w-full"
      data={chartData}
      xKey="month"
      series={[
        { key: 'desktop', label: 'Desktop', color: '#2563eb' },
        { key: 'mobile', label: 'Mobile', color: '#60a5fa' },
      ]}
    />
  )
}
