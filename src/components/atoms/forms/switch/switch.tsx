'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Switch as SwitchPrimitives } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

const switchRootVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-default data-[state=checked]:hover:bg-brand-600/90 data-[state=unchecked]:bg-control data-[state=unchecked]:hover:bg-border',
  {
    variants: {
      size: {
        small: 'h-4 w-7',
        medium: 'h-5 w-[34px]',
        large: 'h-6 w-11',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  }
)

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-foreground-lighter data-[state=checked]:bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        small:
          'size-3 data-[state=checked]:translate-x-[13px] data-[state=unchecked]:translate-x-px',
        medium:
          'size-4 data-[state=checked]:translate-x-[15px] data-[state=unchecked]:translate-x-px',
        large:
          'h-[18px] w-[18px] data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[3px]',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchRootVariants> {}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(switchRootVariants({ size }), className)}
      tabIndex={0}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={cn(switchThumbVariants({ size }))} />
    </SwitchPrimitives.Root>
  )
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
