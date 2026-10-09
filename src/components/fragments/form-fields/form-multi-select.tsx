import { FormField } from '../../atoms/forms/form'
import { FormItemLayout } from '../form-item-layout'
import { MultiSelector } from '../../atoms/forms/multi-select'
import { type FieldLayoutProps, splitLayout, LabelledControl, type MultiSelectorOptionsProps } from './field-shared'

export type FormMultiSelectProps = Omit<
  MultiSelectorOptionsProps,
  'values' | 'onValuesChange' | 'onBlur' | 'ref' | 'label' | 'id'
> &
  FieldLayoutProps & {
    name: string
    /** Trigger text while nothing is selected (MultiSelector's own `label`). */
    placeholder?: string
  }

/** Value is a `string[]` of selected option values. */
export function FormMultiSelect({ name, placeholder, ...props }: FormMultiSelectProps) {
  const [layoutProps, selectorProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <MultiSelector
                {...selectorProps}
                label={placeholder}
                ref={field.ref}
                aria-labelledby={labelId}
                values={field.value ?? []}
                onValuesChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          </LabelledControl>
        </FormItemLayout>
      )}
    />
  )
}
