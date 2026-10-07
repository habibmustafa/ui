'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Radix Slider styled to match Switch: brand range on a control-coloured track. One thumb
 * is rendered per entry in `value`/`defaultValue`, so a two-value array is a range slider.
 */

const sliderTrackVariants = cva('relative w-full grow overflow-hidden rounded-full bg-control', {
  variants: {
    size: {
      small: 'h-1',
      medium: 'h-1.5',
      large: 'h-2',
    },
  },
  defaultVariants: { size: 'medium' },
})

const sliderThumbVariants = cva(
  'block rounded-full border border-brand-default bg-background shadow-sm transition-colors focus-ring disabled:pointer-events-none aria-[invalid=true]:border-destructive',
  {
    variants: {
      size: {
        small: 'h-3.5 w-3.5',
        medium: 'h-4 w-4',
        large: 'h-5 w-5',
      },
    },
    defaultVariants: { size: 'medium' },
  }
)

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderTrackVariants> {
  /**
   * Accessible name per thumb, e.g. `['Minimum price', 'Maximum price']`. Without it
   * every thumb gets the slider's own `aria-label`/`aria-labelledby` — the thumbs are
   * the focusable `role="slider"` elements, so that's where the name has to live.
   * `aria-describedby` and `aria-invalid` move onto the thumbs for the same reason.
   */
  thumbLabels?: readonly string[]
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      className,
      size,
      thumbLabels,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const thumbCount = (props.value ?? props.defaultValue ?? [props.min ?? 0]).length
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center data-disabled:opacity-50',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            sliderTrackVariants({ size }),
            'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
          )}
        >
          <SliderPrimitive.Range className="absolute h-full bg-brand-default data-[orientation=vertical]:w-full" />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            aria-label={thumbLabels?.[index] ?? ariaLabel}
            aria-labelledby={thumbLabels?.[index] ? undefined : ariaLabelledby}
            aria-describedby={ariaDescribedby}
            aria-invalid={ariaInvalid}
            className={sliderThumbVariants({ size })}
          />
        ))}
      </SliderPrimitive.Root>
    )
  }
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
