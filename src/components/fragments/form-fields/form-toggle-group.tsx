import * as React from 'react'
import { ToggleGroup, type ToggleGroupItemData } from '../../atoms/actions/toggle-group'
import { FormField } from '../../atoms/forms/form'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout, LabelledControl } from './field-shared'

export interface FormToggleGroupProps extends FieldLayoutProps {
  name: string
  items: readonly ToggleGroupItemData[]
  /** `single`: the value is a string (`''` when none); `multiple`: a `string[]`. @default "single" */
  type?: 'single' | 'multiple'
  variant?: React.ComponentProps<typeof ToggleGroup>['variant']
  size?: React.ComponentProps<typeof ToggleGroup>['size']
  disabled?: boolean
  className?: string
}

export function FormToggleGroup({ name, type = 'single', ...props }: FormToggleGroupProps) {
  const [layoutProps, groupProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) =>
              type === 'multiple' ? (
                <ToggleGroup
                  {...groupProps}
                  type="multiple"
                  // Focusing the group moves focus to its active (or first) item.
                  ref={field.ref}
                  aria-labelledby={labelId}
                  value={field.value ?? []}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                />
              ) : (
                <ToggleGroup
                  {...groupProps}
                  type="single"
                  ref={field.ref}
                  aria-labelledby={labelId}
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )
            }
          </LabelledControl>
        </FormItemLayout>
      )}
    />
  )
}
