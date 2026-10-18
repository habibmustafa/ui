'use client'

/*
 * Upstream's demo formats dates with `date-fns`. We already carry `dayjs` (added for
 * MetricCard's sparkline tooltip), so this uses dayjs instead of adding a second
 * date library for playground demos — same rationale as date-picker-demo.tsx.
 */
import dayjs from 'dayjs'
import * as React from 'react'
import { Calendar, DatePicker, Select } from '../../../src'

export default function DatePickerWithPresets() {
  const [date, setDate] = React.useState<Date>()

  return (
    <DatePicker.Root>
      <DatePicker.Trigger asChild>
        <DatePicker.Button variant="outline" className="w-70">
          {date ? dayjs(date).format('MMMM D, YYYY') : <span>Pick a date</span>}
        </DatePicker.Button>
      </DatePicker.Trigger>
      <DatePicker.Content className="flex w-auto flex-col space-y-2 p-2">
        <Select.Root onValueChange={(value) => setDate(dayjs().add(parseInt(value), 'day').toDate())}>
          <Select.Trigger>
            <Select.Value placeholder="Select" />
          </Select.Trigger>
          <Select.Content position="popper">
            <Select.Item value="0">Today</Select.Item>
            <Select.Item value="1">Tomorrow</Select.Item>
            <Select.Item value="3">In 3 days</Select.Item>
            <Select.Item value="7">In a week</Select.Item>
          </Select.Content>
        </Select.Root>
        <div className="rounded-md border">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </div>
      </DatePicker.Content>
    </DatePicker.Root>
  )
}
