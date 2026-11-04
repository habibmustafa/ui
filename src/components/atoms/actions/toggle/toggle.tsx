'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import * as React from 'react'

import { SIZE } from '../../../../lib/constants'
import { cn } from '../../../../lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors text-foreground-light data-[state=on]:bg-accent data-[state=on]:text-foreground aria-checked:bg-accent aria-checked:text-foreground focus-ring disabled:pointer-events-none disabled:opacity-50 bg-surface-200 hover:bg-muted px-3 py-1 h-auto',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'bg-transparent border border-control hover:bg-accent hover:text-accent-foreground',
        segmented:
          'relative z-10 cursor-pointer rounded-sm bg-transparent hover:bg-transparent text-foreground-light hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground aria-checked:bg-transparent aria-checked:text-foreground',
      },
      size: {
        tiny: `${SIZE.height.tiny} px-2.5 text-xs`,
        default: 'h-10 px-3',
        sm: `${SIZE.height.small} px-2.5`,
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ToggleProps
  extends React.ComponentPropsWithRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

// React 19: `ref` is a plain prop, no forwardRef needed for new components.
function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ variant, size, className }))}
      tabIndex={0}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
