// Adapted from upstream Radio Group Card (see THIRD-PARTY-NOTICES.md); modified to add an options-based API.
import type * as React from 'react'

import { cn } from '../../../../lib/utils'
import { RadioGroupCardItem, RadioGroupCardRoot } from './radio-group-card-parts'

export type RadioGroupCardOption = React.ComponentProps<typeof RadioGroupCardItem>

export interface RadioGroupCardClassNames {
  item?: string
}

type RootProps = React.ComponentProps<typeof RadioGroupCardRoot>

type RadioGroupCardOptionsProps = Omit<RootProps, 'children'> & {
  options: readonly RadioGroupCardOption[]
  classNames?: RadioGroupCardClassNames
  children?: never
}

type RadioGroupCardCompoundProps = RootProps & { options?: never }

export type RadioGroupCardProps = RadioGroupCardOptionsProps | RadioGroupCardCompoundProps

export function RadioGroupCardHybrid(props: RadioGroupCardProps) {
  if (props.options === undefined) {
    return <RadioGroupCardRoot {...props} />
  }

  const { options, classNames, ...rootProps } = props
  return (
    <RadioGroupCardRoot {...rootProps}>
      {options.map(({ className, ...option }) => (
        <RadioGroupCardItem
          key={option.value}
          {...option}
          className={cn(classNames?.item, className)}
        />
      ))}
    </RadioGroupCardRoot>
  )
}
