'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Star } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { useControllableState } from '../../../../lib/use-controllable-state'

/*
 * Star rating, exposed as a radio group so it works with the keyboard and screen readers
 * out of the box: arrow keys move and select, Home/End jump to the ends. `allowHalf`
 * adds half steps (each star is split into two hit areas), `allowClear` lets a second
 * click on the current value reset it to 0, and `readOnly` renders a static display.
 */

const ratingIconVariants = cva('shrink-0 transition-colors', {
  variants: {
    size: {
      small: 'h-4 w-4',
      medium: 'h-5 w-5',
      large: 'h-6 w-6',
    },
  },
  defaultVariants: { size: 'medium' },
})

export interface RatingProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'defaultValue' | 'onChange' | 'children' | 'dir'
    >,
    VariantProps<typeof ratingIconVariants> {
  value?: number
  /** @default 0 */
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of stars. @default 5 */
  max?: number
  /** Allows half-star values (0.5 steps). @default false */
  allowHalf?: boolean
  /** Clicking the current value again resets it to 0. @default false */
  allowClear?: boolean
  /** Static display: not focusable, not clickable. @default false */
  readOnly?: boolean
  disabled?: boolean
  /** Form field name; renders a hidden input with the value. */
  name?: string
  onBlur?: React.FocusEventHandler<HTMLDivElement>
  /** Accessible text for a value, e.g. `(v, max) => v + " of " + max`. */
  getValueText?: (value: number, max: number) => string
  /** Custom icon; receives the className that sizes and colours it. */
  renderIcon?: (props: { filled: boolean; className: string }) => React.ReactNode
  classNames?: { item?: string; icon?: string }
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value: valueProp,
      defaultValue = 0,
      onValueChange,
      max = 5,
      allowHalf = false,
      allowClear = false,
      readOnly = false,
      disabled = false,
      name,
      size,
      onBlur,
      getValueText: getValueTextProp,
      renderIcon,
      className,
      classNames,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const labels = useLabels()
    const getValueText = getValueTextProp ?? labels.ratingValue
    const step = allowHalf ? 0.5 : 1
    const clamp = (n: number) => Math.min(max, Math.max(0, n))
    const [value, setValue] = useControllableState({
      value: valueProp === undefined ? undefined : clamp(valueProp),
      defaultValue: clamp(defaultValue),
      onChange: onValueChange,
    })
    const [hover, setHover] = React.useState<number | null>(null)
    const itemRefs = React.useRef(new Map<number, HTMLButtonElement>())

    const interactive = !readOnly && !disabled
    const shown = interactive && hover !== null ? hover : value

    const stops: number[] = []
    for (let v = step; v <= max + 1e-9; v += step) stops.push(v)
    // Roving tabindex: the checked stop is the tab stop; with no value, the first one.
    const tabStop = value > 0 ? value : stops[0]

    const commit = (next: number) => {
      if (!interactive) return
      setValue(allowClear && next === value ? 0 : next)
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, stop: number) => {
      const dir = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1
      let target: number | null = null
      if (event.key === 'ArrowRight') target = stop + step * dir
      else if (event.key === 'ArrowLeft') target = stop - step * dir
      else if (event.key === 'ArrowUp') target = stop + step
      else if (event.key === 'ArrowDown') target = stop - step
      else if (event.key === 'Home') target = stops[0]
      else if (event.key === 'End') target = max
      if (target === null) return
      event.preventDefault()
      const next = Math.min(max, Math.max(stops[0], target))
      itemRefs.current.get(next)?.focus()
      setValue(next)
    }

    const star = (index: number) => {
      const fill = Math.min(1, Math.max(0, shown - index))
      const base = cn(ratingIconVariants({ size }), 'text-foreground-muted', classNames?.icon)
      const active = cn(ratingIconVariants({ size }), 'text-warning-600', classNames?.icon)
      return (
        <span className="relative inline-flex" aria-hidden="true">
          {renderIcon ? (
            renderIcon({ filled: false, className: base })
          ) : (
            <Star className={base} />
          )}
          {fill > 0 && (
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              {renderIcon ? (
                renderIcon({ filled: true, className: active })
              ) : (
                <Star className={cn(active, 'fill-current')} />
              )}
            </span>
          )}
        </span>
      )
    }

    const hidden = name !== undefined && <input type="hidden" name={name} value={value} />

    if (readOnly) {
      const text = getValueText(value, max)
      return (
        <div
          ref={ref}
          role="img"
          aria-label={ariaLabel ? `${ariaLabel}: ${text}` : text}
          className={cn('inline-flex items-center gap-0.5', className)}
          {...props}
        >
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className={classNames?.item}>
              {star(i)}
            </span>
          ))}
          {hidden}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlur?.(event)
        }}
        onMouseLeave={() => setHover(null)}
        className={cn('inline-flex items-center gap-0.5', disabled && 'opacity-50', className)}
        {...props}
      >
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={cn('relative inline-flex', classNames?.item)}>
            {star(i)}
            <span className="absolute inset-0 flex">
              {(allowHalf ? [i + 0.5, i + 1] : [i + 1]).map((stop) => (
                <button
                  key={stop}
                  ref={(node) => {
                    if (node) itemRefs.current.set(stop, node)
                    else itemRefs.current.delete(stop)
                  }}
                  type="button"
                  role="radio"
                  aria-checked={value === stop}
                  aria-label={getValueText(stop, max)}
                  disabled={disabled}
                  tabIndex={stop === tabStop ? 0 : -1}
                  onClick={() => commit(stop)}
                  onKeyDown={(event) => onKeyDown(event, stop)}
                  onMouseEnter={() => setHover(stop)}
                  onFocus={() => setHover(null)}
                  className="h-full flex-1 cursor-pointer rounded-sm focus-ring disabled:cursor-not-allowed"
                />
              ))}
            </span>
          </span>
        ))}
        {hidden}
      </div>
    )
  }
)
Rating.displayName = 'Rating'

export { Rating }
