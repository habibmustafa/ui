'use client'

import { Clock } from 'lucide-react'
import * as React from 'react'

import { InputVariants } from '../input'
import { PopoverAnchor, PopoverContent, PopoverRoot, PopoverTrigger } from '../../overlay/popover'
import { ClockFace, type ClockView } from './time-picker-clock'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'

/*
 * Segmented time field (hours : minutes [: seconds] [AM/PM]) whose value is the same
 * "HH:mm" / "HH:mm:ss" 24-hour string <input type="time"> uses — whatever the display
 * hour cycle. Each segment is a role="spinbutton": ↑/↓ step and wrap, typing digits fills
 * the segment and moves on, Backspace clears, ←/→ move between segments. The value is
 * null until every segment is filled.
 */

type SegmentKey = 'hours' | 'minutes' | 'seconds' | 'period'
type Parts = { hours: number | null; minutes: number | null; seconds: number | null; pm: boolean }

const EMPTY: Parts = { hours: null, minutes: null, seconds: null, pm: false }

function parseTime(value: string | null | undefined): Parts {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? '')
  if (!match) return EMPTY
  const hours = Number(match[1])
  return {
    hours,
    minutes: Number(match[2]),
    seconds: match[3] === undefined ? null : Number(match[3]),
    pm: hours >= 12,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export interface TimePickerProps {
  /** "HH:mm" or "HH:mm:ss" (24-hour), or null when empty. */
  value?: string | null
  /** @default null */
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Display 12-hour with AM/PM, or 24-hour. @default 24 */
  hourCycle?: 12 | 24
  /** Add a seconds segment. @default false */
  showSeconds?: boolean
  /** Arrow-key step for minutes. @default 1 */
  minuteStep?: number
  disabled?: boolean
  /** Name for a hidden input carrying the value in forms. */
  name?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  /** @default "small" */
  size?: 'tiny' | 'small' | 'medium' | 'large'
  /** Show the clock button that opens an analog clock picker. @default true */
  clock?: boolean
  className?: string
}

export function TimePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  hourCycle = 24,
  showSeconds = false,
  minuteStep = 1,
  disabled = false,
  name,
  id,
  'aria-label': ariaLabel = 'Time',
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  size = 'small',
  clock = true,
  className,
}: TimePickerProps) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })

  // Segment state; resynced during render when the value changes from outside.
  const [parts, setParts] = React.useState<Parts>(() => parseTime(value))
  const [lastValue, setLastValue] = React.useState(value)
  const [emitted, setEmitted] = React.useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    if (value !== emitted) {
      setEmitted(value)
      setParts(parseTime(value))
    }
  }

  const twelve = hourCycle === 12
  const keys: SegmentKey[] = [
    'hours',
    'minutes',
    ...(showSeconds ? (['seconds'] as const) : []),
    ...(twelve ? (['period'] as const) : []),
  ]
  const refs = React.useRef<Partial<Record<SegmentKey, HTMLElement | null>>>({})
  const typedRef = React.useRef('')

  const commit = (next: Parts) => {
    setParts(next)
    const complete =
      next.hours !== null && next.minutes !== null && (!showSeconds || next.seconds !== null)
    const out = complete
      ? `${pad(next.hours!)}:${pad(next.minutes!)}${showSeconds ? `:${pad(next.seconds!)}` : ''}`
      : null
    setEmitted(out)
    if (out !== value) setValue(out)
  }

  const focusSegment = (key: SegmentKey | undefined) => {
    if (key) refs.current[key]?.focus()
  }
  const neighbour = (key: SegmentKey, delta: 1 | -1) => keys[keys.indexOf(key) + delta]

  // Display hour for the hours segment (1–12 in 12-hour mode).
  const displayHour = (h: number) => (twelve ? ((h + 11) % 12) + 1 : h)
  const toHour24 = (shown: number, pm: boolean) => (twelve ? (shown % 12) + (pm ? 12 : 0) : shown)

  const segmentInfo = {
    hours: { label: 'Hours', min: twelve ? 1 : 0, max: twelve ? 12 : 23, step: 1 },
    minutes: { label: 'Minutes', min: 0, max: 59, step: minuteStep },
    seconds: { label: 'Seconds', min: 0, max: 59, step: 1 },
  } as const

  const getShown = (key: 'hours' | 'minutes' | 'seconds') => {
    const raw = parts[key]
    if (raw === null) return null
    return key === 'hours' ? displayHour(raw) : raw
  }

  const setSegment = (key: 'hours' | 'minutes' | 'seconds', shown: number | null) => {
    if (key === 'hours') {
      commit({ ...parts, hours: shown === null ? null : toHour24(shown, parts.pm) })
    } else {
      commit({ ...parts, [key]: shown })
    }
  }

  const onSegmentKeyDown = (key: 'hours' | 'minutes' | 'seconds', event: React.KeyboardEvent) => {
    const { min, max, step } = segmentInfo[key]
    const shown = getShown(key)
    // Highest value on the step grid, e.g. 45 for minutes with step 15.
    const top = Math.floor(max / step) * step
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      typedRef.current = ''
      let next: number
      if (event.key === 'ArrowUp') {
        next = shown === null ? min : Math.floor(shown / step) * step + step
        if (next > max) next = min
      } else {
        next = shown === null ? top : Math.ceil(shown / step) * step - step
        if (next < min) next = top
      }
      setSegment(key, next)
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      typedRef.current = ''
      setSegment(key, null)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusSegment(neighbour(key, 1))
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusSegment(neighbour(key, -1))
    } else if (/^\d$/.test(event.key)) {
      event.preventDefault()
      const typed = (typedRef.current + event.key).slice(-2)
      const n = Number(typed)
      // A second digit that would overflow starts a new number instead.
      const accepted = n > max ? Number(event.key) : n
      typedRef.current = n > max ? event.key : typed
      setSegment(key, Math.max(min, Math.min(max, accepted)))
      // Done once two digits are in, or no second digit could still fit.
      if (typedRef.current.length === 2 || accepted * 10 > max) {
        typedRef.current = ''
        focusSegment(neighbour(key, 1))
      }
    }
  }

  const togglePeriod = (pm: boolean) => {
    const hours = parts.hours === null ? null : toHour24(displayHour(parts.hours), pm)
    commit({ ...parts, pm, hours })
  }

  // Analog clock popover (MUI-style): hours first, then minutes (then seconds); each
  // release / Enter moves on, and the last one closes it.
  const [clockOpen, setClockOpen] = React.useState(false)
  const [clockView, setClockView] = React.useState<ClockView>('hours')
  const clockPanelRef = React.useRef<HTMLDivElement>(null)
  const clockViews: ClockView[] = [
    'hours',
    'minutes',
    ...(showSeconds ? (['seconds'] as const) : []),
  ]
  const onClockChange = (shown: number, final: boolean) => {
    setSegment(clockView, shown)
    if (!final) return
    const nextView = clockViews[clockViews.indexOf(clockView) + 1]
    if (nextView) setClockView(nextView)
    else setClockOpen(false)
  }

  const segmentClass =
    'rounded-xs px-0.5 tabular-nums caret-transparent outline-none text-center focus:bg-brand-400 focus:text-foreground dark:focus:bg-brand-500 data-[placeholder]:text-foreground-muted disabled:cursor-not-allowed'

  const field = (
    <div
      id={id}
      role="group"
      aria-label={ariaLabelledby ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-disabled={disabled || undefined}
      className={cn(
        InputVariants({ size }),
        'inline-flex w-auto items-center gap-0.5 font-mono',
        'has-[:focus-visible]:border-control-hover',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {(['hours', 'minutes', 'seconds'] as const)
        .filter((key) => key !== 'seconds' || showSeconds)
        .map((key, index) => {
          const { label, min, max } = segmentInfo[key]
          const shown = getShown(key)
          return (
            <React.Fragment key={key}>
              {index > 0 && (
                <span aria-hidden="true" className="text-foreground-lighter">
                  :
                </span>
              )}
              <span
                ref={(el) => {
                  refs.current[key] = el
                }}
                role="spinbutton"
                tabIndex={disabled ? -1 : 0}
                aria-label={label}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={shown ?? undefined}
                aria-valuetext={shown === null ? 'Empty' : pad(shown)}
                aria-disabled={disabled || undefined}
                data-placeholder={shown === null ? '' : undefined}
                onKeyDown={disabled ? undefined : (event) => onSegmentKeyDown(key, event)}
                onFocus={() => {
                  typedRef.current = ''
                }}
                className={segmentClass}
              >
                {shown === null ? '--' : pad(shown)}
              </span>
            </React.Fragment>
          )
        })}
      {twelve && (
        <span
          ref={(el) => {
            refs.current.period = el
          }}
          role="spinbutton"
          tabIndex={disabled ? -1 : 0}
          aria-label="AM/PM"
          aria-valuetext={parts.pm ? 'PM' : 'AM'}
          aria-disabled={disabled || undefined}
          onKeyDown={
            disabled
              ? undefined
              : (event) => {
                  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault()
                    togglePeriod(!parts.pm)
                  } else if (event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'p') {
                    event.preventDefault()
                    togglePeriod(event.key.toLowerCase() === 'p')
                  } else if (event.key === 'ArrowLeft') {
                    event.preventDefault()
                    focusSegment(neighbour('period', -1))
                  }
                }
          }
          className={cn(segmentClass, 'ml-1')}
        >
          {parts.pm ? 'PM' : 'AM'}
        </span>
      )}
      {clock ? (
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Choose time"
            disabled={disabled}
            className="-mr-1 ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-foreground-lighter transition-colors hover:text-foreground focus-ring disabled:pointer-events-none"
          >
            <Clock aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </PopoverTrigger>
      ) : (
        <Clock
          aria-hidden="true"
          className="ml-2 h-4 w-4 shrink-0 text-foreground-lighter"
          strokeWidth={1.5}
        />
      )}
      {name !== undefined && <input type="hidden" name={name} value={value ?? ''} />}
    </div>
  )

  if (!clock) return field

  return (
    <PopoverRoot
      open={clockOpen}
      onOpenChange={(open) => {
        setClockOpen(open)
        if (open) setClockView('hours')
      }}
    >
      {/* Position the dial against the whole field (its right edge with align="end"),
          not against the small clock button inside it, which sits inset by the
          field's padding. */}
      <PopoverAnchor asChild>{field}</PopoverAnchor>
      <PopoverContent
        align="end"
        aria-label="Choose time"
        className="w-auto p-3 font-sans"
        onOpenAutoFocus={(event) => {
          // Land on the dial, not the first header button.
          event.preventDefault()
          clockPanelRef.current?.querySelector<HTMLElement>('[role="slider"]')?.focus()
        }}
      >
        <div className="mb-3 flex items-center justify-center gap-1">
          {clockViews.map((view, index) => {
            const shown = getShown(view)
            return (
              <React.Fragment key={view}>
                {index > 0 && <span className="text-3xl text-foreground-muted">:</span>}
                <button
                  type="button"
                  aria-label={`Edit ${view}`}
                  aria-pressed={clockView === view}
                  onClick={() => setClockView(view)}
                  className={cn(
                    'rounded-md px-1.5 text-3xl tabular-nums transition-colors focus-ring',
                    clockView === view
                      ? 'bg-brand-200 text-foreground'
                      : 'text-foreground-light hover:text-foreground'
                  )}
                >
                  {shown === null ? '--' : pad(shown)}
                </button>
              </React.Fragment>
            )
          })}
          {twelve && (
            <div className="ml-2 flex flex-col gap-0.5">
              {(['AM', 'PM'] as const).map((period) => {
                const active = (period === 'PM') === parts.pm
                return (
                  <button
                    key={period}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePeriod(period === 'PM')}
                    className={cn(
                      'rounded-sm px-1.5 text-xs transition-colors focus-ring',
                      active
                        ? 'bg-brand-200 text-foreground'
                        : 'text-foreground-light hover:text-foreground'
                    )}
                  >
                    {period}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div ref={clockPanelRef}>
          <ClockFace
            view={clockView}
            value={getShown(clockView)}
            ampm={twelve}
            step={clockView === 'minutes' ? minuteStep : 1}
            onChange={onClockChange}
            disabled={disabled}
          />
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}
