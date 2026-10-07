/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for DatePicker — Strategy A, discriminator
 * `calendarProps`. Not present upstream; the compound parts here are already a thin styled
 * re-export of Popover, so this mode simply wires Trigger → Button → Content → Calendar for
 * the common case (upstream's own demo composes exactly this by hand every time).
 */
import type { ComponentProps, ReactNode } from 'react'
import { dateMatchModifiers } from 'react-day-picker'

import { useControllableState } from '../../../../lib/use-controllable-state'
import { Calendar } from '../calendar'
import { DatePickerCalendar } from './date-picker-calendar-nav'
import {
  DatePickerButton,
  DatePickerContent,
  DatePickerField,
  DatePickerRoot,
  DatePickerTrigger,
  type DatePickerButtonProps,
} from './date-picker-parts'

type RootProps = ComponentProps<typeof DatePickerRoot>
type CalendarProps = ComponentProps<typeof Calendar>

type DatePickerPropsMode = Omit<RootProps, 'children'> & {
  /** Passed straight to Calendar — carries `mode`/`selected`/`onSelect` and everything else. */
  calendarProps: CalendarProps
  /** Trigger button label — only used when `calendarProps.mode !== 'single'`. @default "Pick a date" */
  triggerLabel?: ReactNode
  buttonProps?: Omit<DatePickerButtonProps, 'children'>
  contentClassName?: string
  /** Extra content rendered above the Calendar inside DatePickerContent, e.g. a presets Select. */
  beforeCalendar?: ReactNode
  /** Segment format for the typeable field, single-date mode only. @default 'DD.MM.YYYY' */
  format?: string
  /** Classes for the typeable field's wrapper (single-date mode), e.g. `w-full` inside a form. */
  fieldContainerClassName?: string
  /** Typed-field range check, single-date mode only — marks `aria-invalid`, doesn't block typing. */
  minDate?: Date
  maxDate?: Date
  children?: never
}

type DatePickerCompoundProps = RootProps & { calendarProps?: never }

export type DatePickerProps = DatePickerPropsMode | DatePickerCompoundProps

export function DatePickerHybrid(props: DatePickerProps) {
  // Called unconditionally (rules-of-hooks) even though only the single-date field path
  // below needs to force-close the popover on select — behaves exactly like Radix's own
  // uncontrolled state whenever the caller doesn't pass `open`/`onOpenChange` themselves.
  const [open, setOpen] = useControllableState<boolean>({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  })

  if (props.calendarProps === undefined) {
    return <DatePickerRoot {...props} open={open} onOpenChange={setOpen} />
  }

  const {
    calendarProps,
    triggerLabel,
    buttonProps,
    contentClassName,
    beforeCalendar,
    format,
    fieldContainerClassName,
    minDate,
    maxDate,
    open: _openProp,
    defaultOpen: _defaultOpen,
    onOpenChange: _onOpenChange,
    ...rootProps
  } = props

  const isSingleMode = calendarProps.mode === 'single'

  // `calendarProps.mode === 'single'` narrows to a union of the required/optional
  // single-select prop shapes, so TS keeps `onSelect`'s signature strict on the
  // `required: true` variant (`Date`, not `Date | undefined`) even though we don't know
  // which one we're bridging — cast to the shape both the field and the Calendar call it
  // with. Shared by the field (typing) and the Calendar (clicking a day) so either path
  // closes the popover the moment a full date lands, matching MUI's own DatePicker.
  const handleSingleSelect = isSingleMode
    ? (date: Date | null | undefined, triggerDate: Date, modifiers: unknown, e: unknown) => {
        const onSelect = calendarProps.onSelect as
          | ((selected: Date | undefined, triggerDate: Date, modifiers: unknown, e: unknown) => void)
          | undefined
        onSelect?.(date ?? undefined, triggerDate, modifiers, e)
        if (date) setOpen(false)
      }
    : undefined

  return (
    <DatePickerRoot {...rootProps} open={open} onOpenChange={setOpen}>
      {isSingleMode ? (
        <DatePickerField
          value={calendarProps.selected ?? null}
          onChange={(date) => handleSingleSelect?.(date, date ?? new Date(), undefined, undefined)}
          format={format}
          containerClassName={fieldContainerClassName}
          minDate={minDate}
          maxDate={maxDate}
          isDateInvalid={
            calendarProps.disabled
              ? (candidate: Date) => dateMatchModifiers(candidate, calendarProps.disabled!)
              : undefined
          }
          isInvalid={buttonProps?.isInvalid}
        />
      ) : (
        <DatePickerTrigger asChild>
          <DatePickerButton variant="outline" {...buttonProps}>
            {triggerLabel ?? <span>Pick a date</span>}
          </DatePickerButton>
        </DatePickerTrigger>
      )}
      <DatePickerContent className={contentClassName} align={isSingleMode ? 'end' : 'start'}>
        {beforeCalendar}
        {isSingleMode && handleSingleSelect ? (
          <DatePickerCalendar
            calendarProps={calendarProps as Extract<CalendarProps, { mode: 'single' }>}
            onSelect={handleSingleSelect}
          />
        ) : (
          <Calendar {...calendarProps} />
        )}
      </DatePickerContent>
    </DatePickerRoot>
  )
}
