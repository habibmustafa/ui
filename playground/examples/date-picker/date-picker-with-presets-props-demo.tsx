'use client'

/*
 * Upstream's demo formats dates with `date-fns`. We already carry `dayjs` (added for
 * MetricCard's sparkline tooltip), so this uses dayjs instead of adding a second
 * date library for playground demos — same rationale as date-picker-demo.tsx.
 */
import dayjs from 'dayjs'
import * as React from 'react'

import { DatePicker, Select } from '../../../src'

export default function DatePickerWithPresetsPropsDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <DatePicker
      buttonProps={{ variant: 'outline', className: 'w-70' }}
      triggerLabel={date ? dayjs(date).format('MMMM D, YYYY') : <span>Pick a date</span>}
      contentClassName="flex w-auto flex-col space-y-2 p-2"
      beforeCalendar={
        <Select
          placeholder="Select"
          onValueChange={(value) => setDate(dayjs().add(parseInt(value), 'day').toDate())}
          options={[
            { value: '0', label: 'Today' },
            { value: '1', label: 'Tomorrow' },
            { value: '3', label: 'In 3 days' },
            { value: '7', label: 'In a week' },
          ]}
        />
      }
      calendarProps={{
        mode: 'single',
        selected: date,
        onSelect: setDate,
        className: 'rounded-md border',
      }}
    />
  )
}
