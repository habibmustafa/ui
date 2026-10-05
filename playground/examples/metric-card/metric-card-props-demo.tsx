import { useEffect, useState } from 'react'

import { MetricCard } from '../../../src'

export default function MetricCardPropsDemo() {
  const [data, setData] = useState<Array<{ value: number; timestamp: string }>>([])

  useEffect(() => {
    const now = new Date()
    setData(
      Array.from({ length: 12 }, (_, i) => ({
        value: Math.floor(4000 + i * 100 + (Math.random() * 2000 - 800)),
        timestamp: new Date(now.getTime() - (11 - i) * 60 * 60 * 1000).toISOString(),
      }))
    )
  }, [])

  const averageValue = data.reduce((acc, curr) => acc + curr.value, 0) / data.length

  const diff = data[data.length - 1]?.value - data[0]?.value || 0
  const diffPercentage = (diff / averageValue) * 100

  return (
    <div className="w-full max-w-sm">
      <MetricCard
        isLoading={!data.length}
        label="Active Users"
        tooltip="The number of active users over the last 24 hours"
        href="#metric-card"
        value={averageValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        differential={`${diffPercentage > 0 ? '+' : '-'}${Math.abs(diffPercentage).toFixed(1)}%`}
        differentialVariant={diffPercentage > 0 ? 'positive' : 'negative'}
        sparklineData={data}
        sparklineDataKey="value"
      />
    </div>
  )
}
