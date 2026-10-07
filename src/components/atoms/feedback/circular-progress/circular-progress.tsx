'use client'

import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Ring-shaped progress. With a `value` it is a determinate progressbar; without one it
 * spins (and drops `aria-valuenow`, which is how an indeterminate progressbar is
 * announced). Whatever is passed as `children` is centred inside the ring; `showValue`
 * is shorthand for printing the percentage there.
 */

const toneClass = {
  brand: 'text-brand-default',
  neutral: 'text-foreground',
  success: 'text-success-600',
  warning: 'text-warning',
  destructive: 'text-destructive',
} as const

export interface CircularProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value between 0 and `max`. Leave it out for an indeterminate spinner. */
  value?: number
  /** @default 100 */
  max?: number
  /** Diameter in px. @default 64 */
  size?: number
  /** Ring thickness in px. @default 6 */
  thickness?: number
  /** @default "brand" */
  tone?: keyof typeof toneClass
  /** Prints the rounded percentage in the centre. @default false */
  showValue?: boolean
  /** Centre content; replaces `showValue`. */
  children?: React.ReactNode
  /** Rounded line ends. @default true */
  rounded?: boolean
  classNames?: { track?: string; indicator?: string; content?: string }
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 64,
      thickness = 6,
      tone = 'brand',
      showValue = false,
      rounded = true,
      className,
      classNames,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const determinate = value !== undefined
    const ratio = determinate ? Math.min(1, Math.max(0, value / max)) : 0.25
    const radius = (size - thickness) / 2
    const circumference = 2 * Math.PI * radius
    const percent = Math.round(ratio * 100)

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={determinate ? Math.min(max, Math.max(0, value)) : undefined}
        className={cn('relative inline-flex shrink-0 items-center justify-center', toneClass[tone], className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className={cn('-rotate-90', !determinate && 'animate-spin motion-reduce:animate-none')}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className={cn('stroke-current text-foreground-muted opacity-30', classNames?.track)}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap={rounded ? 'round' : 'butt'}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            className={cn('stroke-current transition-[stroke-dashoffset] duration-300', classNames?.indicator)}
          />
        </svg>
        {(children != null || showValue) && (
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center text-xs font-medium tabular-nums text-foreground',
              classNames?.content
            )}
          >
            {children ?? (determinate ? `${percent}%` : null)}
          </span>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = 'CircularProgress'

export { CircularProgress }
