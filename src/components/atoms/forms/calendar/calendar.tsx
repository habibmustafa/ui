'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type DateLib, type Modifiers } from 'react-day-picker'

import { cn } from '../../../../lib/utils'
import { buttonVariants } from '../../actions/button/shadcn-button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Day-button names that contain the day as shown (WCAG 2.5.3 "label in name"). The
 * default `PPPP` format writes "September 7th" in English, so the visible "7" isn't in
 * the name as a word and voice-control users can't say "click 7". Locales whose full
 * date already contains the plain number keep their own format.
 */
function createDayButtonLabel(
  formatDay?: (date: Date, options?: DateLib['options'], dateLib?: DateLib) => string
) {
  return (date: Date, modifiers: Modifiers, _options?: DateLib['options'], dateLib?: DateLib) => {
    if (!dateLib) return date.toDateString()
    const visible = formatDay
      ? formatDay(date, dateLib.options, dateLib)
      : dateLib.format(date, 'd')
    const full = dateLib.format(date, 'PPPP')
    let label = new RegExp(
      `(^|[^\\p{L}\\p{N}])${escapeRegExp(visible)}([^\\p{L}\\p{N}]|$)`,
      'u'
    ).test(full)
      ? full
      : `${dateLib.format(date, 'EEEE')}, ${dateLib.format(date, 'MMMM')} ${visible}, ${dateLib.format(date, 'yyyy')}`
    if (modifiers.today) label = `Today, ${label}`
    if (modifiers.selected) label = `${label}, selected`
    return label
  }
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  labels,
  ...props
}: CalendarProps) {
  const fullDateRangeSelected =
    props.mode === 'range' && !!props.selected?.from && !!props.selected?.to

  const {
    months,
    month,
    month_caption,
    caption_label,
    button_previous,
    button_next,
    month_grid,
    weekdays,
    weekday,
    week,
    day,
    day_button,
    selected,
    today,
    outside,
    disabled,
    range_start,
    range_middle,
    range_end,
    hidden,
    ...restClassNames
  } = classNames ?? {}

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      labels={{
        labelDayButton: createDayButtonLabel(props.formatters?.formatDay),
        ...labels,
      }}
      className={cn('p-3', className)}
      classNames={{
        months: cn(
          'relative flex flex-col sm:flex-row space-y-4 sm:[&>*:not(nav)+*]:ml-4 sm:space-y-0',
          months
        ),
        month: cn('space-y-4', month),
        month_caption: cn('flex justify-center pt-1 relative items-center', month_caption),
        caption_label: cn('text-sm font-medium', caption_label),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          'z-5',
          'aria-disabled:opacity-25 aria-disabled:hover:opacity-25 aria-disabled:cursor-not-allowed',
          'absolute left-0 top-0',
          button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          'z-5',
          'aria-disabled:opacity-25 aria-disabled:hover:opacity-25 aria-disabled:cursor-not-allowed',
          'absolute right-0 top-0',
          button_next
        ),
        month_grid: cn('w-full border-collapse space-y-1', month_grid),
        weekdays: cn('flex', weekdays),
        weekday: cn('text-foreground-muted rounded-md w-9 font-normal text-[0.8rem]', weekday),
        week: cn('flex w-full mt-2', week),
        day: cn(
          'text-center text-sm p-0 relative',
          'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          'focus-within:relative focus-within:z-20',
          'w-9 box-border',
          day
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal rounded-md aria-selected:opacity-100',
          // Keep selected days from picking up ghost hover bg/text
          'aria-selected:hover:bg-transparent aria-selected:hover:text-inherit',
          day_button
        ),
        selected: cn(
          !fullDateRangeSelected && 'bg-brand-400! dark:bg-brand-500! text-foreground rounded-md',
          selected
        ),
        // Plain accent — range/selected fills use ! so they still win when today is in the selection
        today: cn('bg-accent text-accent-foreground', today),
        outside: cn(
          // Muted colour only (5.4:1+): stacking opacity-50 on top dropped these clickable
          // days to ~2:1. Disabled days keep their opacity; they're exempt from contrast.
          'text-foreground-muted has-[[aria-selected]]:text-foreground',
          outside
        ),
        disabled: cn('text-foreground-muted opacity-50', disabled),
        range_start: cn(
          fullDateRangeSelected && 'bg-brand-400! dark:bg-brand-500! text-foreground rounded-l-md',
          range_start
        ),
        range_middle: cn(
          'bg-brand-200! dark:bg-brand-400! text-foreground rounded-none',
          range_middle
        ),
        range_end: cn(
          fullDateRangeSelected && 'bg-brand-400! dark:bg-brand-500! text-foreground rounded-r-md',
          range_end
        ),
        hidden: cn('invisible', hidden),
        ...restClassNames,
      }}
      components={{
        Chevron: (props) => {
          const { className, ...rest } = props

          if (props.orientation === 'left') {
            return (
              <ChevronLeft className={cn('h-4 w-4 pointer-events-none', className)} {...rest} />
            )
          } else {
            return (
              <ChevronRight className={cn('h-4 w-4 pointer-events-none', className)} {...rest} />
            )
          }
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
