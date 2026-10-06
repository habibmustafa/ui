import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../../lib/utils'
import { buttonVariants } from '../../atoms/actions/button/shadcn-button'
import { Calendar } from '../../atoms/forms/calendar'

type CalendarProps = ComponentProps<typeof Calendar>
type SingleCalendarProps = Extract<CalendarProps, { mode: 'single' }>
type SingleOnSelect = (
  selected: Date | undefined,
  triggerDate: Date,
  modifiers: unknown,
  e: unknown
) => void

type View = 'day' | 'month' | 'year'

const YEAR_PAGE_SIZE = 12
const gridCell = cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-full rounded-md font-normal')
const headerButton = cn(buttonVariants({ variant: 'ghost' }), 'h-7 rounded-md px-2 text-sm font-medium')
const pagerButton = cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')

/** Cross-fades between day/month/year views instead of an instant swap. */
function GridView({ viewKey, children }: { viewKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * MUI's own `DateCalendar`: clicking the month/year caption swaps the day grid for a
 * 12-cell month grid; clicking that grid's year swaps to a paged year grid. react-day-picker
 * has no such cascading view of its own (only a flat `captionLayout="dropdown"` native
 * `<select>`, which was tried and explicitly rejected in favor of this) — so day view still
 * renders the real `Calendar` (DayPicker), but month/year views are plain grids we own,
 * sized to roughly match the day grid so the popover doesn't jump around switching views.
 */
export function DatePickerCalendar({
  calendarProps,
  onSelect,
}: {
  calendarProps: SingleCalendarProps
  onSelect: SingleOnSelect
}) {
  const [view, setView] = useState<View>('day')
  const [displayMonth, setDisplayMonth] = useState(
    () => calendarProps.selected ?? calendarProps.defaultMonth ?? new Date()
  )

  // Typing a date into the field (or any other external change to `selected`) should
  // still bring the calendar to that month — this replaces the old one-shot
  // `defaultMonth` injection now that `month` is fully controlled here.
  // Adjusted during render (not in an effect) so the grid never shows the old month
  // for a frame after the date changes.
  const selectedTime = calendarProps.selected?.getTime()
  const [prevSelectedTime, setPrevSelectedTime] = useState(selectedTime)
  if (selectedTime !== prevSelectedTime) {
    setPrevSelectedTime(selectedTime)
    if (calendarProps.selected) setDisplayMonth(calendarProps.selected)
  }

  const content =
    view === 'year' ? (
      <YearGrid
        displayMonth={displayMonth}
        onPick={(year) => {
          setDisplayMonth(dayjs(displayMonth).set('year', year).toDate())
          setView('month')
        }}
      />
    ) : view === 'month' ? (
      <MonthGrid
        displayMonth={displayMonth}
        onPick={(monthIndex) => {
          setDisplayMonth(dayjs(displayMonth).set('month', monthIndex).toDate())
          setView('day')
        }}
        onHeaderClick={() => setView('year')}
        onPrevYear={() => setDisplayMonth(dayjs(displayMonth).subtract(1, 'year').toDate())}
        onNextYear={() => setDisplayMonth(dayjs(displayMonth).add(1, 'year').toDate())}
      />
    ) : (
      <Calendar
        {...calendarProps}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        onSelect={onSelect}
        className={cn('p-2', calendarProps.className)}
        classNames={{
          ...calendarProps.classNames,
          // A bit more compact than the Calendar atom's own upstream-faithful default
          // (w-9/h-9 day cells) — explicit user request for the DatePicker's day grid,
          // scoped here rather than in the shared atom so other Calendar consumers keep
          // the upstream sizing.
          weekday: cn('w-8', calendarProps.classNames?.weekday),
          day: cn('w-8', calendarProps.classNames?.day),
          day_button: cn('h-8 w-8', calendarProps.classNames?.day_button),
          month: cn('space-y-2', calendarProps.classNames?.month),
          week: cn('mt-1', calendarProps.classNames?.week),
        }}
        components={{
          // `calendarMonth` and `displayIndex` are DayPicker's own caption metadata, not
          // DOM attributes — spreading them onto the div made React warn about unknown props.
          MonthCaption: ({ calendarMonth: _month, displayIndex: _index, ...captionProps }) => (
            <div {...captionProps}>
              <button type="button" onClick={() => setView('month')} className={headerButton}>
                {dayjs(displayMonth).format('MMMM YYYY')}
              </button>
            </div>
          ),
          // `components` isn't merged with Calendar's own default — passing this prop at
          // all replaces its whole `components` object, including the Chevron override
          // that swaps in the lucide icon. Without re-declaring it here, DayPicker falls
          // back to its own built-in chevron, which paints with a hardcoded black `fill`
          // instead of `currentColor` (invisible in dark mode) — same icon Calendar.tsx uses.
          Chevron: (chevronProps) => {
            const { className, orientation, ...rest } = chevronProps
            const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
            return <Icon className={cn('h-4 w-4 pointer-events-none', className)} {...rest} />
          },
        }}
      />
    )

  return <GridView viewKey={view}>{content}</GridView>
}

function GridHeader({
  label,
  onLabelClick,
  onPrev,
  onNext,
}: {
  label: string
  onLabelClick?: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between px-2 pt-2">
      <button type="button" onClick={onPrev} aria-label="Previous" className={pagerButton}>
        <ChevronLeft className="h-4 w-4 pointer-events-none" />
      </button>
      {onLabelClick ? (
        <button type="button" onClick={onLabelClick} className={headerButton}>
          {label}
        </button>
      ) : (
        <span className="text-sm font-medium">{label}</span>
      )}
      <button type="button" onClick={onNext} aria-label="Next" className={pagerButton}>
        <ChevronRight className="h-4 w-4 pointer-events-none" />
      </button>
    </div>
  )
}

const GRID_COLUMNS = 3

/**
 * The month and year views are a single-choice list laid out in a grid, so they're
 * exposed as a listbox rather than `role="grid"` — a grid would require row elements
 * this flat CSS grid doesn't have. Focus roves with the arrow keys (only the selected
 * option is tabbable), matching how the day grid behaves inside DayPicker.
 */
function PickerGrid({
  label,
  options,
  activeIndex,
  onPick,
}: {
  label: string
  options: { key: string | number; text: string }[]
  activeIndex: number
  onPick: (index: number) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(options.length - 1, index))
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[clamped]?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step =
      event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowLeft'
          ? -1
          : event.key === 'ArrowDown'
            ? GRID_COLUMNS
            : event.key === 'ArrowUp'
              ? -GRID_COLUMNS
              : undefined

    if (step !== undefined) {
      event.preventDefault()
      focusAt(index + step)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusAt(0)
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusAt(options.length - 1)
    }
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      className="mt-2 grid grid-cols-3 gap-1"
    >
      {options.map((option, index) => (
        <button
          key={option.key}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={() => onPick(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={cn(gridCell, index === activeIndex && 'bg-accent text-accent-foreground')}
        >
          {option.text}
        </button>
      ))}
    </div>
  )
}

function MonthGrid({
  displayMonth,
  onPick,
  onHeaderClick,
  onPrevYear,
  onNextYear,
}: {
  displayMonth: Date
  onPick: (monthIndex: number) => void
  onHeaderClick: () => void
  onPrevYear: () => void
  onNextYear: () => void
}) {
  return (
    <div className="w-[238px] p-2 pt-0">
      <GridHeader
        label={dayjs(displayMonth).format('YYYY')}
        onLabelClick={onHeaderClick}
        onPrev={onPrevYear}
        onNext={onNextYear}
      />
      <PickerGrid
        label="Select month"
        activeIndex={displayMonth.getMonth()}
        onPick={onPick}
        options={Array.from({ length: 12 }, (_, i) => ({
          key: i,
          text: dayjs().month(i).format('MMM'),
        }))}
      />
    </div>
  )
}

function YearGrid({
  displayMonth,
  onPick,
}: {
  displayMonth: Date
  onPick: (year: number) => void
}) {
  const activeYear = displayMonth.getFullYear()
  const [pageStart, setPageStart] = useState(() => Math.floor(activeYear / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE)
  const years = Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => pageStart + i)

  return (
    <div className="w-[238px] p-2 pt-0">
      <GridHeader
        label={`${years[0]}–${years[years.length - 1]}`}
        onPrev={() => setPageStart((p) => p - YEAR_PAGE_SIZE)}
        onNext={() => setPageStart((p) => p + YEAR_PAGE_SIZE)}
      />
      <PickerGrid
        label="Select year"
        activeIndex={years.indexOf(activeYear)}
        onPick={(index) => onPick(years[index])}
        options={years.map((year) => ({ key: year, text: String(year) }))}
      />
    </div>
  )
}
