'use client'

import { HoverCard as HoverCardPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

const HoverCardRoot = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & {
    animate?: 'zoom-in' | 'slide-in'
  }
>(({ className, align = 'center', animate = 'zoom-in', sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-64 rounded-md border bg-overlay p-4 text-popover-foreground shadow-md outline-hidden',
        animate === 'zoom-in'
          ? 'animate-in fade-in-0 zoom-in-97 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-97'
          : 'animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        className
      )}
      {...props}
    />
  </HoverCardPrimitive.Portal>
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCardRoot, HoverCardContent, HoverCardTrigger }
