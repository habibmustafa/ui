'use client'

/*
 * Upstream's demo formats dates with `date-fns`. We already carry `dayjs` (added for
 * MetricCard's sparkline tooltip), so this uses dayjs instead of adding a second
 * date library for playground demos — same rationale as date-picker-demo.tsx.
 */
import dayjs from 'dayjs'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { Calendar, cn, DatePicker } from '../../../src'

export default function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: dayjs(new Date(2022, 0, 20)).add(20, 'day').toDate(),
  })

  return (
    <div className={cn('grid gap-2', className)}>
      <DatePicker.Root>
        <DatePicker.Trigger asChild>
          <DatePicker.Button variant="outline" className="w-[300px]">
            {date?.from ? (
              date.to ? (
                <>
                  {dayjs(date.from).format('MMM DD, YYYY')} - {dayjs(date.to).format('MMM DD, YYYY')}
                </>
              ) : (
                dayjs(date.from).format('MMM DD, YYYY')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </DatePicker.Button>
        </DatePicker.Trigger>
        <DatePicker.Content>
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </DatePicker.Content>
      </DatePicker.Root>
    </div>
  )
}
