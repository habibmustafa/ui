'use client'

import dayjs from 'dayjs'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'

import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'
import { Button } from '../../actions/button'
import { DatePicker } from '../date-picker'

/*
 * One-line range picker: the value is a `{ from, to }` pair, the trigger prints it, and the
 * popover shows two months, optional presets ("Last 7 days"…) and a Clear button. It is
 * DatePicker's props mode with `mode: 'range'` wired up — the "With range" DatePicker
 * example shows the same thing assembled by hand, for when you need full control.
 */

export type { DateRange }

export interface DateRangePreset {
  label: string
  /** A range, or a function so "last 7 days" is computed when it is clicked. */
  range: DateRange | (() => DateRange)
}

export interface DateRangePickerProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'value' | 'defaultValue' | 'onChange'> {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  /** Shown while nothing is selected. @default "Pick a date range" */
  placeholder?: React.ReactNode
  /** dayjs format for the trigger label. @default "MMM DD, YYYY" */
  format?: string
  /** @default 2 */
  numberOfMonths?: number
  /** Dates before this can't be picked. */
  minDate?: Date
  /** Dates after this can't be picked. */
  maxDate?: Date
  /** Quick ranges listed above the calendar. */
  presets?: readonly DateRangePreset[]
  /** Shows a Clear button in the popover. @default true */
  clearable?: boolean
  /** Closes the popover once both ends are chosen. @default true */
  closeOnComplete?: boolean
  /** Marks the trigger invalid. */
  'aria-invalid'?: boolean | 'true' | 'false'
  contentClassName?: string
  /** Label of the Clear button. @default "Clear" */
  clearLabel?: string
}

const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a date range',
      format = 'MMM DD, YYYY',
      numberOfMonths = 2,
      minDate,
      maxDate,
      presets,
      clearable = true,
      closeOnComplete = true,
      contentClassName,
      clearLabel = 'Clear',
      disabled,
      className,
      id: idProp,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const [range, setRange] = useControllableState<DateRange | undefined>({
      value: valueProp,
      defaultValue,
      onChange: onValueChange,
    })
    const [open, setOpen] = React.useState(false)

    const autoId = React.useId()
    const id = idProp ?? autoId
    const fmt = (date: Date) => dayjs(date).format(format)
    const label = range?.from ? (
      range.to ? `${fmt(range.from)} – ${fmt(range.to)}` : fmt(range.from)
    ) : (
      placeholder
    )

    // An aria-label / aria-labelledby replaces the button's own text as its name, which would
    // hide the chosen range from screen readers. Add it back once there is one.
    const valueText = range?.from ? (range.to ? `${fmt(range.from)} – ${fmt(range.to)}` : fmt(range.from)) : undefined
    const accessibleName =
      ariaLabel && valueText ? { 'aria-label': `${ariaLabel}: ${valueText}` } : { 'aria-label': ariaLabel }
    const accessibleLabelledby =
      ariaLabelledby && valueText ? `${ariaLabelledby} ${id}` : ariaLabelledby

    const select = (next: DateRange | undefined) => {
      setRange(next)
      if (closeOnComplete && next?.from && next.to && next.from.getTime() !== next.to.getTime()) {
        setOpen(false)
      }
    }

    const disabledDays = [
      ...(minDate ? [{ before: minDate }] : []),
      ...(maxDate ? [{ after: maxDate }] : []),
    ]
    const invalid = ariaInvalid === true || ariaInvalid === 'true'

    return (
      <DatePicker
        open={open}
        onOpenChange={setOpen}
        buttonProps={{
          ref,
          variant: 'outline',
          disabled,
          isInvalid: invalid,
          id,
          ...accessibleName,
          'aria-labelledby': accessibleLabelledby,
          'aria-invalid': ariaInvalid,
          className: cn('w-full', !range?.from && 'text-foreground-lighter', className),
          ...props,
        }}
        triggerLabel={label}
        contentClassName={contentClassName}
        beforeCalendar={
          (presets && presets.length > 0) || (clearable && range?.from) ? (
            <div className="flex flex-wrap items-center gap-1.5 border-b p-3">
              {presets?.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="tiny"
                  onClick={() => select(typeof preset.range === 'function' ? preset.range() : preset.range)}
                >
                  {preset.label}
                </Button>
              ))}
              {clearable && range?.from && (
                <Button
                  type="button"
                  variant="text"
                  size="tiny"
                  className="ml-auto"
                  onClick={() => setRange(undefined)}
                >
                  {clearLabel}
                </Button>
              )}
            </div>
          ) : undefined
        }
        calendarProps={{
          mode: 'range',
          autoFocus: true,
          defaultMonth: range?.from,
          selected: range,
          onSelect: select,
          numberOfMonths,
          disabled: disabledDays.length > 0 ? disabledDays : undefined,
        }}
      />
    )
  }
)
DateRangePicker.displayName = 'DateRangePicker'

export { DateRangePicker }
