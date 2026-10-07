'use client'

import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * A dial for a value inside a known range (CPU load, a score, a quota). It is a
 * `role="meter"`, not a progressbar: the value is a measurement, not task progress.
 * `angle` sets the sweep (180 = half circle, 270 = open ring); `thresholds` colour the
 * arc by value, e.g. green until 60, amber until 85, red above.
 */

const toneClass = {
  brand: 'text-brand-default',
  neutral: 'text-foreground',
  success: 'text-success-600',
  warning: 'text-warning-600',
  destructive: 'text-destructive-600',
} as const

type Tone = keyof typeof toneClass

export interface GaugeThreshold {
  /** The tone applies from this value up to the next threshold. */
  from: number
  tone: Tone
}

export interface GaugeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number
  /** @default 0 */
  min?: number
  /** @default 100 */
  max?: number
  /** Sweep of the arc in degrees, 90 to 360. @default 180 */
  angle?: number
  /** Width in px; height follows the arc. @default 160 */
  size?: number
  /** Stroke width in the 100-unit drawing space. @default 10 */
  thickness?: number
  /** @default "brand" */
  tone?: Tone
  /** Colours by value; overrides `tone`. Order doesn't matter. */
  thresholds?: readonly GaugeThreshold[]
  /** Prints the value in the centre. @default true */
  showValue?: boolean
  /** Formats the printed value. */
  formatValue?: (value: number) => React.ReactNode
  /** Small caption under the value. */
  label?: React.ReactNode
  /** Prints `min` and `max` under the arc ends (half circles). @default false */
  showRange?: boolean
  /** Replaces the centre content. */
  children?: React.ReactNode
  classNames?: { track?: string; indicator?: string; value?: string; label?: string }
}

const CX = 50
const CY = 50
const R = 40

/** 0° is 12 o'clock, clockwise. */
function point(angle: number) {
  const rad = (angle * Math.PI) / 180
  return [CX + R * Math.sin(rad), CY - R * Math.cos(rad)] as const
}

function arcPath(start: number, sweep: number) {
  const [x1, y1] = point(start)
  const [x2, y2] = point(start + sweep)
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`
}

const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      angle = 180,
      size = 160,
      thickness = 10,
      tone = 'brand',
      thresholds,
      showValue = true,
      formatValue,
      label,
      showRange = false,
      className,
      classNames,
      children,
      ...props
    },
    ref
  ) => {
    const sweep = Math.min(360, Math.max(90, angle))
    // Arc is centred on the top, so the gap sits at the bottom.
    const start = -sweep / 2
    const clamped = Math.min(max, Math.max(min, value))
    const ratio = max === min ? 0 : (clamped - min) / (max - min)

    const activeTone =
      thresholds && thresholds.length > 0
        ? ([...thresholds].sort((a, b) => a.from - b.from).filter((t) => clamped >= t.from).pop()?.tone ?? tone)
        : tone

    // Only the part of the drawing the arc actually reaches is kept, so a half-circle
    // gauge isn't half empty space. Full-height when the arc dips below the centre line.
    const bottom = sweep <= 180 ? CY + thickness / 2 : CY + R + thickness / 2
    const top = CY - R - thickness / 2
    const height = bottom - top

    return (
      <div
        ref={ref}
        role="meter"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        className={cn('relative inline-block', toneClass[activeTone], className)}
        style={{ width: size }}
        {...props}
      >
        <svg
          aria-hidden="true"
          viewBox={`${CX - R - thickness / 2} ${top} ${2 * R + thickness} ${height}`}
          className="block w-full"
        >
          <path
            d={arcPath(start, sweep)}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            className={cn('stroke-current text-foreground-muted opacity-30', classNames?.track)}
          />
          {ratio > 0 && (
            <path
              d={arcPath(start, sweep * ratio)}
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              className={cn('stroke-current transition-[stroke] duration-300', classNames?.indicator)}
            />
          )}
        </svg>
        <div
          className={cn(
            'absolute inset-x-0 flex flex-col items-center justify-end text-foreground',
            sweep <= 180 ? 'bottom-0' : 'inset-y-0 justify-center'
          )}
        >
          {children ??
            (showValue && (
              <span className={cn('text-2xl font-medium tabular-nums leading-none', classNames?.value)}>
                {formatValue ? formatValue(clamped) : clamped}
              </span>
            ))}
          {label != null && (
            <span className={cn('mt-1 text-xs text-foreground-lighter', classNames?.label)}>{label}</span>
          )}
        </div>
        {showRange && sweep <= 180 && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-5 flex justify-between px-1 text-xs text-foreground-lighter tabular-nums"
          >
            <span>{min}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    )
  }
)
Gauge.displayName = 'Gauge'

export { Gauge }
