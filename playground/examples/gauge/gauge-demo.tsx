import { useState } from 'react'

import { Button, Gauge } from '../../../src'

const thresholds = [
  { from: 0, tone: 'success' },
  { from: 60, tone: 'warning' },
  { from: 85, tone: 'destructive' },
] as const

export default function GaugeDemo() {
  const [load, setLoad] = useState(42)
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-10">
        <Gauge value={load} thresholds={thresholds} label="CPU load" formatValue={(v) => `${v}%`} showRange aria-label="CPU load" />
        <Gauge value={7.4} min={0} max={10} angle={270} size={140} label="Score" aria-label="Score" />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setLoad((v) => Math.max(0, v - 15))}>Lower</Button>
        <Button onClick={() => setLoad((v) => Math.min(100, v + 15))}>Raise</Button>
      </div>
    </div>
  )
}
