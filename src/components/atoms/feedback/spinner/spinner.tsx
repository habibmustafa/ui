import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Standalone loading indicator — the same Loader2 icon Button shows while `loading`.
 * By default it's a polite live region ("Loading"); pass `decorative` when something
 * else already announces the busy state (e.g. inside a button with its own label).
 */

const spinnerVariants = cva('animate-spin text-foreground-lighter', {
  variants: {
    size: {
      small: 'h-3.5 w-3.5',
      medium: 'h-5 w-5',
      large: 'h-8 w-8',
    },
  },
  defaultVariants: { size: 'medium' },
})

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  /** Screen-reader text. @default "Loading" */
  label?: string
  /** Hide from assistive tech (when the busy state is announced elsewhere). */
  decorative?: boolean
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, label = 'Loading', decorative = false, ...props }, ref) => (
    <span
      ref={ref}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative ? true : undefined}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 aria-hidden="true" className={spinnerVariants({ size })} strokeWidth={2} />
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  )
)
Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
