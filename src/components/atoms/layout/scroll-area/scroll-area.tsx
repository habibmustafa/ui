'use client'

import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Radix ScrollArea: native scrolling with thin, theme-coloured scrollbars that look the
 * same on every OS. The viewport is focusable (tabIndex 0) so keyboard users can scroll it
 * with the arrow keys — a scrollable region with no focusable content otherwise traps them.
 */

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none p-px transition-colors',
      orientation === 'vertical' && 'h-full w-2 border-l border-l-transparent',
      orientation === 'horizontal' && 'h-2 flex-col border-t border-t-transparent',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border-strong hover:bg-foreground-muted" />
  </ScrollAreaPrimitive.Scrollbar>
))
ScrollBar.displayName = 'ScrollBar'

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  /** Which scrollbars to render. @default "vertical" */
  orientation?: 'vertical' | 'horizontal' | 'both'
  /** Class for the scrolling viewport (e.g. a max height). */
  viewportClassName?: string
  /** Accessible name for the scrollable region. */
  'aria-label'?: string
}

const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, ScrollAreaProps>(
  (
    { className, viewportClassName, children, orientation = 'vertical', 'aria-label': ariaLabel, ...props },
    ref
  ) => (
    <ScrollAreaPrimitive.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        tabIndex={0}
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
        className={cn('h-full w-full rounded-[inherit] focus-ring', viewportClassName)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== 'horizontal' && <ScrollBar orientation="vertical" />}
      {orientation !== 'vertical' && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
)
ScrollArea.displayName = 'ScrollArea'

export { ScrollArea, ScrollBar }
