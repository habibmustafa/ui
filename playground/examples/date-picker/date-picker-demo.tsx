/*
 * Upstream's demo formats the date with `date-fns`'s `format(date, 'PPP')`. We already carry
 * `dayjs` (added for MetricCard's sparkline tooltip) so this uses `dayjs().format('MMMM D, YYYY')`
 * instead of adding a second date-formatting library for one playground demo.
 */
import dayjs from 'dayjs'
import { useState } from 'react'

import {
  Calendar,
  DatePicker,
} from '../../../src'

export default function DatePickerDemo() {
  const [date, setDate] = useState<Date>()

  return (
    <DatePicker.Root>
      <DatePicker.Trigger asChild>
        <DatePicker.Button variant="outline" className="w-[280px]">
          {date ? dayjs(date).format('MMMM D, YYYY') : <span>Pick a date</span>}
        </DatePicker.Button>
      </DatePicker.Trigger>
      <DatePicker.Content>
        <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
      </DatePicker.Content>
    </DatePicker.Root>
  )
}
