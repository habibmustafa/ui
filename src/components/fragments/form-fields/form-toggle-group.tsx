import * as React from 'react'
import { ToggleGroup, type ToggleGroupItemData } from '../../atoms/actions/toggle-group'
import { Form } from '../../atoms/forms/form'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout, LabelledControl } from './field-shared'
import { cn } from '../../../lib/utils'

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
    <Form.Field
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) =>
              type === 'multiple' ? (
                <ToggleGroup
                  {...groupProps}
                  className={cn('justify-start', groupProps.className)}
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
                  className={cn('justify-start', groupProps.className)}
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
