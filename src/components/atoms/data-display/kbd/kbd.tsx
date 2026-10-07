import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Keyboard key hint, styled like the playground header's "⌘ K" chip. `Kbd` is one key;
 * `KbdGroup` lays out a shortcut (`<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>`).
 */

const kbdVariants = cva(
  'pointer-events-none inline-flex select-none items-center justify-center gap-1 rounded-sm border border-strong bg-surface-200 font-mono font-medium text-foreground-light',
  {
    variants: {
      size: {
        small: 'h-4 min-w-4 px-1 text-[10px]',
        medium: 'h-5 min-w-5 px-1.5 text-[11px]',
        large: 'h-6 min-w-6 px-2 text-xs',
      },
    },
    defaultVariants: { size: 'medium' },
  }
)

export interface KbdProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof kbdVariants> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, size, ...props }, ref) => (
  <kbd ref={ref} className={cn(kbdVariants({ size }), className)} {...props} />
))
Kbd.displayName = 'Kbd'

export type KbdGroupProps = React.HTMLAttributes<HTMLElement>

const KbdGroup = React.forwardRef<HTMLElement, KbdGroupProps>(({ className, ...props }, ref) => (
  <kbd ref={ref} className={cn('inline-flex items-center gap-1', className)} {...props} />
))
KbdGroup.displayName = 'KbdGroup'

export { Kbd, KbdGroup, kbdVariants }
