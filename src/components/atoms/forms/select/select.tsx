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
import { useControllableState } from '../../../../lib/use-controllable-state'
import { readOptions, type OptionAccessors, type OptionValue, type ReadOption } from '../../../../lib/options'

export interface SelectOption<V extends OptionValue = string> {
  value: V
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectOptionGroup<T = SelectOption> {
  label?: React.ReactNode
  options: readonly T[]
}

export interface SelectClassNames {
  trigger?: string
  content?: string
  item?: string
}

type RootProps = React.ComponentProps<typeof SelectRoot>

/**
 * With `options` or `groups` the Select renders the whole control; without them it is the
 * Radix root and takes `children` (the compound parts).
 */
export type SelectProps<T = SelectOption, V extends OptionValue | null = string> = Omit<
  RootProps,
  'value' | 'defaultValue' | 'onValueChange'
> &
  OptionAccessors<T> & {
  /** Flat option list. Mutually exclusive with `groups`. */
  options?: readonly T[]
  /** Grouped options, separated by a SelectSeparator. Mutually exclusive with `options`. */
  groups?: readonly SelectOptionGroup<T>[]
  /** The selected option's value (a string or a number); `null` for none. */
  value?: V | null
  /** @default null */
  defaultValue?: V | null
  /**
   * Called with the chosen option's value. With `clearable` it is called with `null` when
   * cleared, so include `null` in the value type: `useState<string | null>`.
   */
  onValueChange?: (value: V) => void
  /** Shows a × (and clears on Backspace/Delete) while a value is selected. @default false */
  clearable?: boolean
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
}

function renderOptions<T>(options: readonly ReadOption<T>[], itemClassName?: string) {
  return options.map((option) => (
    <SelectItem key={option.key} value={option.key} disabled={option.disabled} className={itemClassName}>
      {option.label}
    </SelectItem>
  ))
}

export function SelectHybrid<T = SelectOption, V extends OptionValue | null = string>(
  props: SelectProps<T, V>
) {
  // Own the value so the trigger knows when there is something to clear (unconditional:
  // rules-of-hooks); compound mode ignores it and lets Radix keep its own state.
  const [value, setValue] = useControllableState<V | null>({
    value: props.value as V | null | undefined,
    defaultValue: (props.defaultValue ?? null) as V | null,
    onChange: props.onValueChange as ((value: V | null) => void) | undefined,
  })

  if (props.options === undefined && props.groups === undefined) {
    return <SelectRoot {...(props as unknown as RootProps)} />
  }

  const {
    options,
    groups,
    placeholder,
    clearable = false,
    valueExpr,
    displayExpr,
    getOptionValue,
    getOptionLabel,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    size,
    className,
    classNames,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    ...rootProps
  } = props
  const accessors = { valueExpr, displayExpr, getOptionValue, getOptionLabel }
  const flat = readOptions(groups ? groups.flatMap((group) => group.options) : (options ?? []), accessors)
  // Radix only carries strings: it is given each option's key and we map it back.
  const onKeyChange = (key: string) => {
    const found = flat.find((option) => option.key === key)
    setValue(found ? (found.value as V) : null)
  }
  // A tiny trigger opens a menu at its own scale: its text size, and no 8rem floor
  // that would stick out past the trigger.
  const compact = size === 'tiny'
  const itemClassName = cn(compact && 'py-1 text-xs', classNames?.item)

  return (
    <SelectRoot {...rootProps} value={value == null ? '' : String(value)} onValueChange={onKeyChange}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        size={size}
        className={cn(className, classNames?.trigger)}
        onClear={clearable && value != null && !rootProps.disabled ? () => setValue(null) : undefined}
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
                  {renderOptions(readOptions(group.options, accessors), itemClassName)}
                </SelectGroup>
              </Fragment>
            ))
          : renderOptions(readOptions(options ?? [], accessors), itemClassName)}
      </SelectContent>
    </SelectRoot>
  )
}
