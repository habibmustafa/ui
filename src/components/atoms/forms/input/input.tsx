import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { SIZE_VARIANTS, SIZE_VARIANTS_DEFAULT } from '../../../../lib/constants'
import { cn } from '../../../../lib/utils'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>,
    VariantProps<typeof InputVariants> {
  /** Rendered inside the field's own border, before the value (e.g. an icon or "$"). */
  prefix?: React.ReactNode
  /** Rendered inside the field's own border, after the value (e.g. a unit or button). */
  suffix?: React.ReactNode
}

export const InputVariants = cva(
  cn(
    'flex h-10 w-full rounded-md border border-control hover:border-control-hover read-only:border-button bg-field px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-muted read-only:text-foreground-light',
    'focus:border-control-hover focus-ring disabled:cursor-not-allowed disabled:text-foreground-muted transition-colors duration-200',
    'aria-[invalid=true]:bg-destructive-200 aria-[invalid=true]:border-destructive-400 aria-[invalid=true]:hover:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus-visible:border-destructive'
  ),
  {
    variants: {
      size: {
        ...SIZE_VARIANTS,
      },
    },
    defaultVariants: {
      size: SIZE_VARIANTS_DEFAULT,
    },
  }
)

/**
 * `prefix`/`suffix` are ui's own addition, not upstream — a lighter-weight
 * alternative to composing the full `InputGroup`/`InputGroupAddon` shell
 * (`src/components/atoms/forms/form/input-group.tsx`) for the common case of one
 * icon or short label glued to the field. Only this branch renders a wrapper div;
 * plain `<Input />` (no prefix/suffix — the overwhelming majority of call sites)
 * renders the exact same bare `<input>` as before, byte-for-byte.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size = 'small', prefix, suffix, disabled, ...props }, ref) => {
    if (prefix === undefined && suffix === undefined) {
      return (
        <input
          type={type}
          ref={ref}
          disabled={disabled}
          {...props}
          className={cn(InputVariants({ size }), className)}
        />
      )
    }

    return (
      <div
        className={cn(
          InputVariants({ size }),
          'flex cursor-text items-center gap-2',
          'has-[:focus-visible]:outline-hidden has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background has-[:focus-visible]:border-control-hover',
          'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
          'has-[:read-only]:border-button',
          'has-[[aria-invalid=true]]:bg-destructive-200 has-[[aria-invalid=true]]:border-destructive-400 has-[[aria-invalid=true]]:hover:border-destructive',
          className
        )}
        // The field's padding lives on this wrapper (matching the plain-Input look),
        // but padding isn't part of the inner <input> element itself here — a click
        // there would otherwise land on the div and never focus the field, unlike a
        // real padded input where padding is inside the same focusable element.
        // Redirect only when the click didn't already hit a real interactive child
        // (the input itself, or a button in prefix/suffix).
        onClick={(event) => {
          const target = event.target as HTMLElement
          if (target.closest('button, a, input, textarea, select')) return
          event.currentTarget.querySelector('input')?.focus()
        }}
      >
        {prefix !== undefined && (
          <span className="flex shrink-0 items-center text-foreground-lighter [&_svg]:size-4">
            {prefix}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          disabled={disabled}
          {...props}
          // The arbitrary-property class below (not shadow-none) is deliberate:
          // Tailwind's shadow-none utility only zeroes the --tw-shadow layer of the
          // composite box-shadow, leaving --tw-ring-shadow etc. as whatever they
          // resolved to elsewhere (here, a stray blue ring) — setting the literal
          // property bypasses that composite entirely. Same for [font-size:inherit]:
          // `text-inherit` only inherits the colour, and form controls don't inherit
          // font-size by default, so without it the value rendered at the browser's
          // 16px instead of the wrapper's size (text-xs for tiny, etc.).
          className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-inherit [font-size:inherit] outline-none [box-shadow:none] placeholder:text-foreground-muted disabled:cursor-not-allowed"
        />
        {suffix !== undefined && (
          <span className="flex shrink-0 items-center text-foreground-lighter [&_svg]:size-4">
            {suffix}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
