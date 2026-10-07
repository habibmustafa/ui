'use client'

import { Minus, Plus } from 'lucide-react'
import * as React from 'react'

import { Input, type InputProps } from '../input'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'

/*
 * A numeric field built on Input's suffix slot: only number characters can be typed or
 * pasted (digits, one leading "-" when `min` allows negatives, and in `decimal` mode one
 * "." or "," with at most `decimalPlaces` digits after it). The value is committed
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
  /**
   * `numeric`: whole numbers only. `decimal`: allows a fractional part (`.` or `,`).
   * @default "decimal" when `step` or `min` has decimals, otherwise "numeric"
   */
  mode?: 'numeric' | 'decimal'
  /**
   * Max digits after the separator in `decimal` mode; typing more is blocked and values
   * are rounded to it. @default step's decimals, at least 2
   */
  decimalPlaces?: number
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
      mode: modeProp,
      decimalPlaces,
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
      onFocus,
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
    const stepPrecision = Math.max(
      decimals(step),
      min === Number.NEGATIVE_INFINITY ? 0 : decimals(min)
    )
    const mode = modeProp ?? (stepPrecision > 0 ? 'decimal' : 'numeric')
    const precision = mode === 'numeric' ? 0 : (decimalPlaces ?? Math.max(stepPrecision, 2))
    const allowNegative = min < 0

    // Keeps only what a number in this mode can contain, so letters (and a second "." or
    // "-") never reach the field — whether typed, pasted or dropped.
    const sanitize = (text: string) => {
      let out = ''
      let separator = false
      let fraction = 0
      for (const char of text) {
        if (/\d/.test(char)) {
          if (separator) {
            if (fraction >= precision) continue
            fraction += 1
          }
          out += char
        } else if (char === '-' && allowNegative && out === '') {
          out = '-'
        } else if ((char === '.' || char === ',') && precision > 0 && !separator) {
          separator = true
          out += '.'
        }
      }
      return out
    }
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
      // Untouched formatted text ("1,000.00") is the committed value, not something to parse.
      if (text === display(value)) return value
      const cleaned = sanitize(text)
      if (cleaned === '' || cleaned === '-') return null
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
        inputMode={mode === 'decimal' || allowNegative ? 'decimal' : 'numeric'}
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuetext={value === null ? undefined : display(value)}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        value={draft}
        onChange={(event) => setDraft(sanitize(event.target.value))}
        onFocus={(event) => {
          // Edit the plain number, not its formatted text (a "$" or thousands separator
          // would be stripped as soon as the user typed).
          if (format && value !== null && draft === display(value)) setDraft(String(value))
          onFocus?.(event)
        }}
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
