// Adapted from upstream Radio Group Stacked (see THIRD-PARTY-NOTICES.md); modified to add an options-based API.
import type * as React from 'react'

import { cn } from '../../../../lib/utils'
import { RadioGroupStackedItem, RadioGroupStackedRoot } from './radio-group-stacked-parts'

export type RadioGroupStackedOption = React.ComponentProps<typeof RadioGroupStackedItem>

export interface RadioGroupStackedClassNames {
  item?: string
}

type RootProps = React.ComponentProps<typeof RadioGroupStackedRoot>

type RadioGroupStackedOptionsProps = Omit<RootProps, 'children'> & {
  options: readonly RadioGroupStackedOption[]
  classNames?: RadioGroupStackedClassNames
  children?: never
}

type RadioGroupStackedCompoundProps = RootProps & { options?: never }

export type RadioGroupStackedProps = RadioGroupStackedOptionsProps | RadioGroupStackedCompoundProps

export function RadioGroupStackedHybrid(props: RadioGroupStackedProps) {
  if (props.options === undefined) {
    return <RadioGroupStackedRoot {...props} />
  }

  const { options, classNames, ...rootProps } = props
  return (
    <RadioGroupStackedRoot {...rootProps}>
      {options.map(({ className, ...option }) => (
        <RadioGroupStackedItem
          key={option.value}
          {...option}
          className={cn(classNames?.item, className)}
        />
      ))}
    </RadioGroupStackedRoot>
  )
}
