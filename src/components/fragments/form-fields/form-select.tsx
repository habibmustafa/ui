import * as React from 'react'
import { FormControl, FormField } from '../../atoms/forms/form'
import { Select, type SelectOption, type SelectOptionGroup } from '../../atoms/forms/select'
import { FormItemLayout } from '../form-item-layout'
import { type LayoutProps } from './field-shared'

export interface FormSelectProps extends LayoutProps {
  name: string
  placeholder?: React.ReactNode
  className?: string
  options?: readonly SelectOption[]
  groups?: readonly SelectOptionGroup[]
  disabled?: boolean
}

export function FormSelect({
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
}: FormSelectProps) {
  return (
    <FormField
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
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
              placeholder={placeholder}
              className={className}
              options={options as SelectOption[]}
              groups={groups as SelectOptionGroup[]}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}
