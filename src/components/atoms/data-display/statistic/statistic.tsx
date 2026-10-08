'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../../../lib/utils'
import { Skeleton } from '../../feedback/skeleton'

/*
 * A headline number with a title: prefix/suffix slots, locale formatting and an optional
 * count-up animation whenever the value changes. The animation is skipped for users who
 * prefer reduced motion, and screen readers always get the final value, not the frames.
 */

const statisticValueVariants = cva('font-medium tabular-nums leading-none tracking-tight text-foreground', {
  variants: {
    size: {
      small: 'text-xl',
      medium: 'text-3xl',
      large: 'text-5xl',
    },
  },
  defaultVariants: { size: 'medium' },
})

export interface StatisticProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'>,
    VariantProps<typeof statisticValueVariants> {
  title?: React.ReactNode
  /** A number is formatted with `locale`/`precision`; a string is shown as is. */
  value?: number | string
  /** Fraction digits shown for a numeric `value`. */
  precision?: number
  /** BCP 47 tag(s) passed to `Intl.NumberFormat`. Defaults to the runtime locale. */
  locale?: string | string[]
  /** Replaces the default number formatting. Also used for every animation frame. */
  formatter?: (value: number) => string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  /** Small line under the value (e.g. a comparison). */
  description?: React.ReactNode
  /** Counts up/down to a changed numeric `value`. @default false */
  animated?: boolean
  /** Animation length in ms. @default 800 */
  duration?: number
  /** Shows a skeleton in place of the value. @default false */
  loading?: boolean
  classNames?: {
    title?: string
    value?: string
    prefix?: string
    suffix?: string
    description?: string
  }
}

/** Fraction digits of a number as written ("14340" is 0, "93210.5" is 1); undefined if unclear. */
function decimalsOf(n: number | undefined) {
  if (n === undefined) return undefined
  const text = String(n)
  if (text.includes('e')) return undefined
  const dot = text.indexOf('.')
  return dot < 0 ? 0 : text.length - dot - 1
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Eases a number toward `target`; returns `target` immediately when disabled. */
function useAnimatedNumber(target: number | undefined, enabled: boolean, duration: number) {
  const [display, setDisplay] = React.useState(target)
  const current = React.useRef(target)

  React.useEffect(() => {
    if (target === undefined || !enabled || prefersReducedMotion() || current.current === undefined) {
      current.current = target
      setDisplay(target)
      return
    }
    const from = current.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      current.current = from + (target - from) * eased
      setDisplay(current.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, enabled, duration])

  return enabled ? display : target
}

const Statistic = React.forwardRef<HTMLDivElement, StatisticProps>(
  (
    {
      title,
      value,
      precision,
      locale,
      formatter,
      prefix,
      suffix,
      description,
      animated = false,
      duration = 800,
      loading = false,
      size,
      className,
      classNames,
      ...props
    },
    ref
  ) => {
    const numeric = typeof value === 'number' ? value : undefined
    const animatedValue = useAnimatedNumber(numeric, animated, duration)

    // While counting, intermediate frames use the target's decimals (a whole-number target
    // never flashes "13,519.361").
    const digits = precision ?? (animated ? decimalsOf(numeric) : undefined)
    const format = (n: number) =>
      formatter
        ? formatter(n)
        : new Intl.NumberFormat(locale, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          }).format(n)

    const text = numeric !== undefined ? format(animatedValue ?? numeric) : value
    // What assistive tech should read: always the settled value.
    const finalText = numeric !== undefined ? format(numeric) : value

    return (
      <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props}>
        {title != null && (
          <div className={cn('text-sm text-foreground-light', classNames?.title)}>{title}</div>
        )}
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className={cn('flex items-baseline gap-1.5', classNames?.value)}>
            {prefix != null && (
              <span className={cn('text-foreground-light', classNames?.prefix)}>{prefix}</span>
            )}
            <span className={statisticValueVariants({ size })}>
              <span aria-hidden={animated || undefined}>{text}</span>
              {animated && <span className="sr-only">{finalText}</span>}
            </span>
            {suffix != null && (
              <span className={cn('text-sm text-foreground-light', classNames?.suffix)}>{suffix}</span>
            )}
          </div>
        )}
        {description != null && !loading && (
          <div className={cn('text-xs text-foreground-lighter', classNames?.description)}>
            {description}
          </div>
        )}
      </div>
    )
  }
)
Statistic.displayName = 'Statistic'

export { Statistic }
