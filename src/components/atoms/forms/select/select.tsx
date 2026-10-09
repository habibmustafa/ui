import { Fragment } from 'react'
import type * as React from 'react'

import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectTriggerSize,
} from './select-parts'
import { cn } from '../../../../lib/utils'

export interface SelectOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectOptionGroup {
  label?: React.ReactNode
  options: readonly SelectOption[]
}

export interface SelectClassNames {
  trigger?: string
  content?: string
  item?: string
}

type RootProps = React.ComponentProps<typeof SelectRoot>

type SelectContentModeProps = Omit<RootProps, 'children'> & {
  /** Flat option list. Mutually exclusive with `groups`. */
  options?: readonly SelectOption[]
  /** Grouped options, separated by a SelectSeparator. Mutually exclusive with `options`. */
  groups?: readonly SelectOptionGroup[]
  placeholder?: React.ReactNode
  /** Trigger size. @default "medium" */
  size?: SelectTriggerSize
  className?: string
  classNames?: SelectClassNames
  /**
   * Forwarded to the trigger — the focusable combobox — so a `<label htmlFor>` or
   * FormControl can name and describe it. Radix's Root renders no element of its own.
   */
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  children?: never
}

type SelectCompoundProps = RootProps & { options?: never; groups?: never }

export type SelectProps = SelectContentModeProps | SelectCompoundProps

function renderOptions(options: readonly SelectOption[], itemClassName?: string) {
  return options.map((option) => (
    <SelectItem key={option.value} value={option.value} disabled={option.disabled} className={itemClassName}>
      {option.label}
    </SelectItem>
  ))
}

export function SelectHybrid(props: SelectProps) {
  if (props.options === undefined && props.groups === undefined) {
    // Narrowed by the check above; TS can't discriminate a multi-field OR on its own.
    return <SelectRoot {...(props as SelectCompoundProps)} />
  }

  const {
    options,
    groups,
    placeholder,
    size,
    className,
    classNames,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    ...rootProps
  } = props as SelectContentModeProps
  // A tiny trigger opens a menu at its own scale: its text size, and no 8rem floor
  // that would stick out past the trigger.
  const compact = size === 'tiny'
  const itemClassName = cn(compact && 'py-1 text-xs', classNames?.item)

  return (
    <SelectRoot {...rootProps}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        size={size}
        className={cn(className, classNames?.trigger)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn(compact && 'min-w-0', classNames?.content)}>
        {groups
          ? groups.map((group, index) => (
              <Fragment key={index}>
                {index > 0 && <SelectSeparator />}
                <SelectGroup>
                  {group.label != null && <SelectLabel>{group.label}</SelectLabel>}
                  {renderOptions(group.options, itemClassName)}
                </SelectGroup>
              </Fragment>
            ))
          : renderOptions(options ?? [], itemClassName)}
      </SelectContent>
    </SelectRoot>
  )
}
