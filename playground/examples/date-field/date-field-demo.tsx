'use client'

import { useState } from 'react'

import { DateField } from '../../../src'

const MIN_DATE = new Date(2020, 0, 1)
const MAX_DATE = new Date(2030, 11, 31)

export default function DateFieldDemo() {
  const [date, setDate] = useState<Date | null>(null)

  return (
    <div className="flex flex-col gap-2">
      <DateField
        value={date}
        onChange={setDate}
        minDate={MIN_DATE}
        maxDate={MAX_DATE}
        className="w-45"
      />
      <p className="text-sm text-foreground-lighter">
        {date
          ? `${date.toDateString()} — allowed range is 2020–2030`
          : 'No date yet — type, or use the arrow keys.'}
      </p>
    </div>
  )
}
