'use client'

import { Check, Minus } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import * as React from 'react'

import { getExplicitTabIndex } from '../../../../lib/get-explicit-tab-index'
import { cn } from '../../../../lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, disabled, tabIndex, ...props }, ref) => {
  const computedTabIndex = getExplicitTabIndex(tabIndex, disabled)

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer flex cursor-pointer items-center justify-center h-4 w-4 shrink-0 rounded-sm border border-control bg-control/25 ring-offset-background',
        'transition-colors duration-150 ease-in-out',
        'hover:border-strong',
        'focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-foreground data-[state=checked]:text-background',
        'data-[state=indeterminate]:bg-foreground data-[state=indeterminate]:text-background',
        className
      )}
      {...props}
      disabled={disabled}
      tabIndex={computedTabIndex}
    >
      <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
        {props.checked === 'indeterminate' ? (
          <Minus className="h-3 w-3 text-background" strokeWidth={4} />
        ) : (
          <Check className="h-3 w-3 text-background" strokeWidth={4} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
