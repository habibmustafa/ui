'use client'

import { Minus, Plus } from 'lucide-react'
import * as React from 'react'

import { Input, type InputProps } from '../input'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'

/*
 * A numeric field built on Input's suffix slot: the value is typed freely and committed
 * (parsed, clamped, rounded to `step`'s precision) on blur or Enter, while the − / +
 * buttons and the keyboard (↑/↓, PageUp/PageDown, Home/End) change it immediately.
 * The <input> carries role="spinbutton" with aria-valuenow/-min/-max; the buttons are
 * pointer conveniences and stay out of the tab order, as in the WAI-ARIA spinbutton
 * pattern.
 */

export interface NumberInputProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'type' | 'prefix' | 'suffix' | 'min' | 'max' | 'step'> {
  /** Controlled value; `null` is an empty field. */
  value?: number | null
  /** @default null */
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** @default 1 */
  step?: number
  /** Step for PageUp/PageDown and Shift+↑/↓. @default step * 10 */
  largeStep?: number
  /** Formats the committed value for display, e.g. `(v) => v.toFixed(2)`. */
  format?: (value: number) => string
  /** Hide the − / + buttons. @default false */
  hideControls?: boolean
  /** Rendered before the value, inside the field (e.g. "$"). */
  prefix?: React.ReactNode
  /** Accessible names of the buttons. */
  decrementLabel?: string
  incrementLabel?: string
}

function decimals(n: number) {
  const s = String(n)
  const i = s.indexOf('.')
  return i === -1 ? 0 : s.length - i - 1
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      min = Number.NEGATIVE_INFINITY,
      max = Number.POSITIVE_INFINITY,
      step = 1,
      largeStep = step * 10,
      format,
      hideControls = false,
      prefix,
      decrementLabel = 'Decrease',
      incrementLabel = 'Increase',
      disabled,
      readOnly,
      className,
      onBlur,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState<number | null>({
      value: valueProp,
      defaultValue,
      onChange: onValueChange,
    })
    const precision = Math.max(decimals(step), min === Number.NEGATIVE_INFINITY ? 0 : decimals(min))
    const display = React.useCallback(
      (v: number | null) => (v === null ? '' : format ? format(v) : String(v)),
      [format]
    )

    // What the user is typing; resynced whenever the committed value changes.
    const [draft, setDraft] = React.useState(() => display(value))
    const [lastValue, setLastValue] = React.useState(value)
    if (value !== lastValue) {
      setLastValue(value)
      setDraft(display(value))
    }

    const clamp = (n: number) => Number(Math.min(max, Math.max(min, n)).toFixed(precision))

    const commit = (next: number | null) => {
      const clamped = next === null ? null : clamp(next)
      if (clamped !== value) setValue(clamped)
      setDraft(display(clamped))
    }

    const parse = (text: string) => {
      const cleaned = text.replace(/[^\d.,\-+eE]/g, '').replace(',', '.')
      if (cleaned.trim() === '') return null
      const n = Number(cleaned)
      return Number.isFinite(n) ? n : value
    }

    const stepBy = (delta: number) => {
      if (disabled || readOnly) return
      const base = parse(draft) ?? (min !== Number.NEGATIVE_INFINITY ? min : 0)
      commit(base + delta)
    }

    const canDecrement = !disabled && !readOnly && (value === null || value > min)
    const canIncrement = !disabled && !readOnly && (value === null || value < max)

    const buttonClass =
      'flex h-full items-center justify-center rounded-sm px-1 text-foreground-lighter transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40'

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={precision > 0 || min < 0 ? 'decimal' : 'numeric'}
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuetext={value === null ? undefined : display(value)}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => {
          commit(parse(draft))
          onBlur?.(event)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented) return
          const big = event.shiftKey ? largeStep : step
          const keys: Record<string, () => void> = {
            ArrowUp: () => stepBy(big),
            ArrowDown: () => stepBy(-big),
            PageUp: () => stepBy(largeStep),
            PageDown: () => stepBy(-largeStep),
            Home: () => Number.isFinite(min) && commit(min),
            End: () => Number.isFinite(max) && commit(max),
            Enter: () => commit(parse(draft)),
          }
          const action = keys[event.key]
          if (action) {
            event.preventDefault()
            action()
          }
        }}
        prefix={prefix}
        suffix={
          hideControls ? undefined : (
            <span className="-mr-1 flex h-full items-center gap-0.5">
              <button
                type="button"
                tabIndex={-1}
                aria-label={decrementLabel}
                disabled={!canDecrement}
                onClick={() => stepBy(-step)}
                className={buttonClass}
              >
                <Minus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label={incrementLabel}
                disabled={!canIncrement}
                onClick={() => stepBy(step)}
                className={buttonClass}
              >
                <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </span>
          )
        }
        className={cn('tabular-nums', className)}
        {...props}
      />
    )
  }
)
NumberInput.displayName = 'NumberInput'

export { NumberInput }
