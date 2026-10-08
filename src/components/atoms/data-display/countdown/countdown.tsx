'use client'

import * as React from 'react'

import { useLabels } from '../../../../providers/locale-provider'
import { Statistic, type StatisticProps } from '../statistic'

/*
 * Counts down to a deadline and renders the time left through Statistic. `format` uses
 * the tokens D, H, m, s and S (milliseconds); doubled tokens are zero-padded, and a
 * larger unit that is left out of the format is folded into the next one (so `mm:ss`
 * shows 90 minutes as 90:00). The element is a role="timer" (not a live region), so screen
 * readers don't announce every second; its name is the title plus the time left.
 */

export interface CountdownProps
  extends Omit<StatisticProps, 'onChange' | 'value' | 'precision' | 'locale' | 'formatter' | 'animated' | 'duration'> {
  /** The deadline: a Date, a timestamp in ms, or anything `new Date()` accepts. */
  value: Date | number | string
  /** Tokens: `D` days, `H` hours, `m` minutes, `s` seconds, `S` milliseconds. @default "HH:mm:ss" */
  format?: string
  /** Tick length in ms. Defaults to 1000, or 50 when `format` includes `S`. */
  interval?: number
  /** Stops ticking and freezes the display. @default false */
  paused?: boolean
  onFinish?: () => void
  /** Called on every tick with the remaining ms. */
  onChange?: (remaining: number) => void
  /** Replaces the time-left string given to screen readers. */
  getAccessibleLabel?: (remaining: number) => string
}

const UNITS = [
  { token: 'D', ms: 86_400_000 },
  { token: 'H', ms: 3_600_000 },
  { token: 'm', ms: 60_000 },
  { token: 's', ms: 1_000 },
  { token: 'S', ms: 1 },
] as const

export function formatCountdown(remaining: number, format: string) {
  let left = Math.max(0, Math.floor(remaining))
  const parts: Record<string, number> = {}
  for (const { token, ms } of UNITS) {
    if (new RegExp(token).test(format)) {
      parts[token] = Math.floor(left / ms)
      left -= parts[token] * ms
    }
  }
  // Keep literal text in [brackets] untouched, as dayjs does.
  return format.replace(/\[([^\]]*)\]|D+|H+|m+|s+|S+/g, (match, literal: string | undefined) => {
    if (literal !== undefined) return literal
    const value = String(parts[match[0]] ?? 0)
    return match.length === 1 ? value : value.padStart(match.length, '0')
  })
}

const toTimestamp = (value: CountdownProps['value']) =>
  value instanceof Date ? value.getTime() : new Date(value).getTime()

const Countdown = React.forwardRef<HTMLDivElement, CountdownProps>(
  (
    {
      value,
      format = 'HH:mm:ss',
      interval,
      paused = false,
      onFinish,
      onChange,
      getAccessibleLabel,
      title,
      ...props
    },
    ref
  ) => {
    const labels = useLabels()
    const deadline = toTimestamp(value)
    const tick = interval ?? (format.includes('S') ? 50 : 1000)
    // `now` is the last tick; the time left is derived from it, so a new deadline shows
    // up immediately without setting state from inside the effect.
    const [now, setNow] = React.useState(() => Date.now())
    const remaining = Math.max(0, deadline - now)

    const onFinishRef = React.useRef(onFinish)
    const onChangeRef = React.useRef(onChange)
    React.useLayoutEffect(() => {
      onFinishRef.current = onFinish
      onChangeRef.current = onChange
    })

    React.useEffect(() => {
      if (paused) return
      if (deadline - Date.now() <= 0) {
        onFinishRef.current?.()
        return
      }
      const id = setInterval(() => {
        const current = Date.now()
        const next = Math.max(0, deadline - current)
        setNow(current)
        onChangeRef.current?.(next)
        if (next === 0) {
          clearInterval(id)
          onFinishRef.current?.()
        }
      }, tick)
      return () => clearInterval(id)
    }, [deadline, tick, paused])

    return (
      <Statistic
        ref={ref}
        role="timer"
        aria-label={
          getAccessibleLabel
            ? getAccessibleLabel(remaining)
            : typeof title === 'string'
              ? `${title}: ${labels.timeLeft(remaining)}`
              : labels.timeLeft(remaining)
        }
        title={title}
        {...props}
        value={formatCountdown(remaining, format)}
      />
    )
  }
)
Countdown.displayName = 'Countdown'

export { Countdown }
