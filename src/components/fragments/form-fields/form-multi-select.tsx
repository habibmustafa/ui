import { Form } from '../../atoms/forms/form'
import { FormItemLayout } from '../form-item-layout'
import { MultiSelector, type MultiSelectorOption } from '../../atoms/forms/multi-select'
import type { OptionValue } from '../../../lib/options'
import { type FieldLayoutProps, splitLayout, LabelledControl, type MultiSelectorOptionsProps } from './field-shared'

export type FormMultiSelectProps<T = MultiSelectorOption, V extends OptionValue = string> = Omit<
  MultiSelectorOptionsProps<T, V>,
  'values' | 'onValuesChange' | 'onBlur' | 'ref' | 'label' | 'id'
> &
  FieldLayoutProps & {
    name: string
    /** Trigger text while nothing is selected (MultiSelector's own `label`). */
    placeholder?: string
  }

/** Value is a `string[]` of selected option values. */
export function FormMultiSelect<T = MultiSelectorOption, V extends OptionValue = string>({
  name,
  placeholder,
  ...props
}: FormMultiSelectProps<T, V>) {
  const [layoutProps, selectorProps] = splitLayout(props)
  return (
    <Form.Field
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
