/*
 * Same dayjs substitution as date-picker-demo.tsx — see that file's header comment.
 */
import dayjs from 'dayjs'
import { useState } from 'react'

import { DatePicker } from '../../../src'

export default function DatePickerPropsDemo() {
  const [date, setDate] = useState<Date>()

  return (
    <DatePicker
      triggerLabel={date ? dayjs(date).format('MMMM D, YYYY') : undefined}
      buttonProps={{ className: 'w-[280px]' }}
      calendarProps={{ mode: 'single', selected: date, onSelect: setDate, autoFocus: true }}
    />
  )
}
