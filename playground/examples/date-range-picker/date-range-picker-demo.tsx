import { useState } from 'react'

import { DateRangePicker, type DateRange } from '../../../src'

const day = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d
}

export default function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange | undefined>()
  return (
    <div className="w-full max-w-sm">
      <DateRangePicker
        value={range}
        onValueChange={setRange}
        aria-label="Report period"
        presets={[
          { label: 'Last 7 days', range: () => ({ from: day(-6), to: day(0) }) },
          { label: 'Last 30 days', range: () => ({ from: day(-29), to: day(0) }) },
        ]}
        maxDate={day(0)}
      />
    </div>
  )
}
