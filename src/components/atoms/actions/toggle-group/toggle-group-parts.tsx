'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'
import { toggleVariants } from '../toggle'
import { useTabIndicator } from '../../../../lib/use-tab-indicator'

const segmentIndicatorOptions = {
  activeItemSelector: '[data-state="on"]',
  indicatorSelector: '[data-segment-indicator]',
  readyFlag: 'segmentIndicatorReady',
  leftProperty: '--active-segment-left',
  widthProperty: '--active-segment-width',
  insetByPadding: false,
}

const segmentedSelfPaint = 'data-[state=on]:bg-overlay-hover aria-checked:bg-overlay-hover'

const segmentedToneVariants = cva('', {
  variants: {
    tone: {
      outline: 'border border-strong',
      text: '',
      primary: '',
    },
  },
  defaultVariants: { tone: 'text' },
})

const segmentedIndicatorToneVariants = cva('', {
  variants: {
    tone: {
      outline: 'bg-overlay-hover border border-strong shadow-sm',
      text: 'bg-accent',
      primary:
        'bg-brand-400 dark:bg-brand-500 border border-brand-500/75 dark:border-brand-default/30',
    },
  },
  defaultVariants: { tone: 'text' },
})

const toggleGroupVariants = cva('flex items-center justify-center', {
  variants: {
    variant: {
      default: 'gap-1',
      outline: 'gap-1',
      segmented: 'relative isolate w-fit gap-0 p-px rounded-md group/segmented',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & { hasIndicator?: boolean }
>({
  size: 'default',
  variant: 'default',
})

type ToggleGroupRootProps = React.ComponentPropsWithRef<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    allowDeselect?: boolean
    tone?: VariantProps<typeof segmentedToneVariants>['tone']
  }

// React 19: `ref` is a plain prop, no forwardRef needed for new components.
function ToggleGroupRoot({
  ref,
  className,
  variant,
  size,
  tone,
  children,
  allowDeselect = true,
  onValueChange,
  ...props
}: ToggleGroupRootProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  useTabIndicator(rootRef, segmentIndicatorOptions)

  const hasIndicator = variant === 'segmented' && props.type === 'single'

  const ownsValue = !allowDeselect && props.type === 'single' && props.value === undefined
  const [internalValue, setInternalValue] = React.useState(() =>
    typeof props.defaultValue === 'string' ? props.defaultValue : ''
  )

  const handleValueChange = (value: string & string[]) => {
    if (!allowDeselect && value === '') return
    if (ownsValue && typeof value === 'string') setInternalValue(value)
    if (onValueChange) onValueChange(value)
  }

  const rootProps = (
    ownsValue ? { ...props, value: internalValue, defaultValue: undefined } : props
  ) as React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>

  return (
    <ToggleGroupPrimitive.Root
      ref={(node) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(
        toggleGroupVariants({ variant }),
        variant === 'segmented' && segmentedToneVariants({ tone }),
        className
      )}
      {...rootProps}
      onValueChange={handleValueChange}
    >
      {hasIndicator && <ToggleGroupIndicator tone={tone} />}
      <ToggleGroupContext.Provider value={{ variant, size, hasIndicator }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

const ToggleGroupIndicator = ({
  className,
  tone,
  ...props
}: React.ComponentPropsWithRef<'span'> & VariantProps<typeof segmentedIndicatorToneVariants>) => (
  <span
    aria-hidden
    data-segment-indicator
    className={cn(
      'pointer-events-none absolute z-0 left-0 inset-y-px rounded-sm',
      segmentedIndicatorToneVariants({ tone }),
      'w-(--active-segment-width,0) translate-x-(--active-segment-left,0)',
      'transition-none opacity-0',
      'group-data-segment-indicator-ready/segmented:opacity-100',
      'group-data-segment-indicator-ready/segmented:transition-[translate,width]',
      'group-data-segment-indicator-ready/segmented:duration-250',
      'group-data-segment-indicator-ready/segmented:ease-move',
      'motion-reduce:transition-none',
      className
    )}
    {...props}
  />
)

type ToggleGroupItemProps = React.ComponentPropsWithRef<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>

// React 19: `ref` is a plain prop, no forwardRef needed for new components.
function ToggleGroupItem({ ref, className, children, variant, size, ...props }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  const resolvedVariant = context.variant || variant

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: resolvedVariant,
          size: context.size || size,
        }),
        resolvedVariant === 'segmented' && !context.hasIndicator && segmentedSelfPaint,
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export {
  ToggleGroupRoot,
  ToggleGroupIndicator,
  ToggleGroupItem,
  segmentedIndicatorToneVariants,
  segmentedToneVariants,
  toggleGroupVariants,
  type ToggleGroupItemProps,
  type ToggleGroupRootProps,
}
