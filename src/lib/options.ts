import type * as React from 'react'

/*
 * One reading of "an option" for Select, Combobox and MultiSelect: the default shape is
 * `{ value, label }`, and any other shape is mapped with `valueExpr` / `displayExpr` (a field
 * name) or `getOptionValue` / `getOptionLabel` (a function, which wins). A value may be a
 * string or a number; the DOM, Radix and cmdk only carry strings, so each option also has
 * a string `key`, and the components map the key back to the original value on selection.
 */

export type OptionValue = string | number

export interface OptionAccessors<T, L = React.ReactNode> {
  /** Field of each option that holds its value (a string or a number). @default 'value' */
  valueExpr?: string
  /** Field of each option that holds what to show. @default 'label' */
  displayExpr?: string
  /** Reads an option's value; wins over `valueExpr`. */
  getOptionValue?: (option: T) => OptionValue
  /** Reads what to show for an option; wins over `displayExpr`. */
  getOptionLabel?: (option: T) => L
}

export interface ReadOption<T, L = React.ReactNode> {
  option: T
  value: OptionValue
  /** `String(value)`: what Radix, cmdk and the DOM carry. */
  key: string
  label: L
  disabled?: boolean
}

export function readOption<T, L = React.ReactNode>(
  option: T,
  accessors: OptionAccessors<T, L>
): ReadOption<T, L> {
  const record = option as Record<string, unknown>
  const value = accessors.getOptionValue
    ? accessors.getOptionValue(option)
    : (record[accessors.valueExpr ?? 'value'] as OptionValue)
  const label = accessors.getOptionLabel
    ? accessors.getOptionLabel(option)
    : (record[accessors.displayExpr ?? 'label'] as L | undefined)
  return {
    option,
    value,
    key: String(value),
    // Nothing to show: fall back to the value itself.
    label: (label ?? String(value)) as L,
    disabled: record.disabled === true,
  }
}

export const readOptions = <T, L = React.ReactNode>(
  options: readonly T[],
  accessors: OptionAccessors<T, L>
) => options.map((option) => readOption(option, accessors))
