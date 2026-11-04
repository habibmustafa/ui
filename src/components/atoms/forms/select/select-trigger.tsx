'use client'

import { cva, type VariantProps } from 'class-variance-authority'

import { SIZE_VARIANTS, SIZE_VARIANTS_DEFAULT } from '../../../../lib/constants'

export const selectTriggerVariants = cva(
  'flex w-full cursor-pointer items-center justify-between rounded-md border border-control hover:border-control-hover bg-field text-xs data-placeholder:text-foreground-lighter ring-border-control focus-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors data-[state=open]:border-control-hover aria-invalid:border-invalid-border aria-invalid:bg-invalid-bg aria-invalid:hover:border-destructive gap-2 [&>span]:truncate text-left',
  {
    variants: {
      size: {
        ...SIZE_VARIANTS,
      },
    },
    // Trailing chevron sits 8px from the outer edge (1px border + 7px), like every
    // field's trailing icon; compound classes come after the size padding, so this wins.
    compoundVariants: [
      { size: ['tiny', 'small', 'medium', 'large', 'xlarge'], class: 'pr-1.75' },
    ],
    defaultVariants: {
      size: SIZE_VARIANTS_DEFAULT,
    },
  }
)

export type SelectTriggerVariantProps = VariantProps<typeof selectTriggerVariants>
