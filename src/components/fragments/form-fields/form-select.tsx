import * as React from 'react'
import { Form } from '../../atoms/forms/form'
import { Select, type SelectOption, type SelectOptionGroup } from '../../atoms/forms/select'
import type { OptionAccessors } from '../../../lib/options'
import { FormItemLayout } from '../form-item-layout'
import { type LayoutProps } from './field-shared'

export interface FormSelectProps<T = SelectOption> extends LayoutProps, OptionAccessors<T> {
  name: string
  placeholder?: React.ReactNode
  className?: string
  options?: readonly T[]
  groups?: readonly SelectOptionGroup<T>[]
  disabled?: boolean
  /** Shows a × that clears the value; the field then holds `undefined`. */
  clearable?: boolean
}

export function FormSelect<T = SelectOption>({
  name,
  label,
  description,
  labelOptional,
  align,
  layout,
  size,
  labelLayout,
  placeholder,
  className,
  options,
  groups,
  disabled,
  clearable,
  valueExpr,
  displayExpr,
  getOptionValue,
  getOptionLabel,
}: FormSelectProps<T>) {
  return (
    <Form.Field
      name={name}
      render={({ field }) => (
        <FormItemLayout
          label={label}
          description={description}
          labelOptional={labelOptional}
          align={align}
          layout={layout}
          size={size}
          labelLayout={labelLayout}
        >
          <Form.Control>
            <Select
              value={field.value}
              // Cleared (null) means no value: report undefined so a required schema fails.
              onValueChange={(next) => field.onChange(next ?? undefined)}
              disabled={disabled}
              placeholder={placeholder}
              clearable={clearable}
              className={className}
              options={options}
              groups={groups}
              valueExpr={valueExpr}
              displayExpr={displayExpr}
              getOptionValue={getOptionValue}
              getOptionLabel={getOptionLabel}
            />
          </Form.Control>
        </FormItemLayout>
      )}
    />
  )
}
