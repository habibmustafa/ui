'use client'

import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

import { Input, type InputProps } from '../input'
import { cn } from '../../../../lib/utils'

/*
 * Password field on Input's suffix slot: a show/hide toggle (a real, focusable button
 * with aria-pressed) and an optional strength meter. Strength is shown as text as well as
 * color and announced politely, so it doesn't rely on color alone.
 */

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

/**
 * A small heuristic, not a security guarantee: length plus character variety, capped by
 * length. Pass your own `getStrength` (e.g. zxcvbn) for real policies.
 */
export function estimatePasswordStrength(password: string): PasswordStrength {
  if (!password) return 0
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (variety >= 2) score++
  if (variety >= 3) score++
  if (password.length < 8) score = Math.min(score, 1)
  return Math.max(1, Math.min(4, score)) as PasswordStrength
}

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
}
const STRENGTH_BAR: Record<PasswordStrength, string> = {
  0: 'bg-control',
  1: 'bg-destructive-600',
  2: 'bg-warning-600',
  3: 'bg-brand-500',
  4: 'bg-brand-default',
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffix'> {
  /** Show a strength meter under the field. */
  showStrength?: boolean
  /** Custom scoring; defaults to `estimatePasswordStrength`. */
  getStrength?: (password: string) => PasswordStrength
  /** Override the meter's labels ("Weak", "Fair", …). */
  strengthLabels?: Partial<Record<PasswordStrength, string>>
  /** Accessible name of the toggle. @default "Show password" */
  showLabel?: string
  /** Whether the password starts visible. @default false */
  defaultVisible?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showStrength = false,
      getStrength = estimatePasswordStrength,
      strengthLabels,
      showLabel = 'Show password',
      defaultVisible = false,
      value,
      defaultValue,
      onChange,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(defaultVisible)
    // Tracked only for the meter; the input itself stays controlled/uncontrolled as given.
    const [typed, setTyped] = React.useState(String(defaultValue ?? ''))
    const current = value !== undefined ? String(value) : typed
    const strength = showStrength ? getStrength(current) : 0
    const labels = { ...STRENGTH_LABELS, ...strengthLabels }
    const meterId = React.useId()

    return (
      <div className="flex w-full flex-col gap-1.5">
        <Input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          autoComplete={props.autoComplete ?? 'current-password'}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          aria-describedby={
            [props['aria-describedby'], showStrength && current ? meterId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          onChange={(event) => {
            setTyped(event.target.value)
            onChange?.(event)
          }}
          className={className}
          suffix={
            <button
              type="button"
              aria-label={showLabel}
              aria-pressed={visible}
              disabled={disabled}
              onClick={() => setVisible((v) => !v)}
              className="-mr-1 flex h-6 w-6 items-center justify-center rounded-sm text-foreground-lighter transition-colors hover:text-foreground focus-ring disabled:pointer-events-none"
            >
              {visible ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          }
        />
        {showStrength && (
          <div className="flex items-center gap-2" aria-hidden={current ? undefined : true}>
            <div className="grid flex-1 grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={cn(
                    'h-1 rounded-full transition-colors',
                    strength >= step ? STRENGTH_BAR[strength] : 'bg-control'
                  )}
                />
              ))}
            </div>
            <span
              id={meterId}
              aria-live="polite"
              className="min-w-12 text-right text-xs text-foreground-light"
            >
              {current ? labels[strength] : ''}
            </span>
          </div>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
