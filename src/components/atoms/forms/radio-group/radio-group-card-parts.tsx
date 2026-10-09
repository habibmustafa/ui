// Adapted from upstream Radio Group Card (see THIRD-PARTY-NOTICES.md); modified: the compound root is exported separately.
'use client'

import { Circle } from 'lucide-react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

export type RadioGroupCardRootProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>

const RadioGroupCardRoot = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupCardRootProps
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('relative grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroupCardRoot.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupCardItemProps {
  image?: React.ReactNode
  label: React.ReactNode
  showIndicator?: boolean
}

const RadioGroupCardItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupCardItemProps & React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ id: idProp, children, className, image, label, showIndicator = true, ...props }, ref) => {
  const generatedId = React.useId()
  const id = idProp || generatedId
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={id}
      aria-labelledby={`${id}-label`}
      {...props}
      className={cn(
        'flex flex-col gap-2',
        'w-48',
        'bg-overlay',
        'rounded-md',
        'border',
        'p-2',
        'hover:border-control-hover',
        'hover:z-1 focus-visible:z-1 focus-visible:border-control-hover',
        'outline-hidden',
        'transition-colors',
        'group',
        'data-[state=checked]:border-control-hover',
        className
      )}
    >
      {/* `image` was accepted but never rendered; it previews above the label. */}
      {image}
      {children}
      <div className="flex gap-2 w-full" id={`${id}-label`}>
        {showIndicator && (
          <div
            className="
                aspect-square h-4 w-4
                rounded-full border group-data-[state=checked]:border-control-hover
                group-focus:border-control-hover
                group-hover:border-control-hover
                ring-offset-background
                group-focus:outline-hidden
                group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background
                group-disabled:cursor-not-allowed group-disabled:opacity-50
                flex items-center justify-center
                transition-colors
          "
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-current" />
            </RadioGroupPrimitive.Indicator>
          </div>
        )}

        <div
          className={cn(
            'w-full',
            'text-xs transition-colors text-left',
            'text-light',
            'group-hover:text-foreground group-data-[state=checked]:text-foreground',
            props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {label}
        </div>
      </div>
    </RadioGroupPrimitive.Item>
  )
})

RadioGroupCardItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroupCardRoot, RadioGroupCardItem }
