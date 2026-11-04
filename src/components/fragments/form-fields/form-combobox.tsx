import { Form } from '../../atoms/forms/form'
import { Combobox, type ComboboxOption, type ComboboxProps } from '../../atoms/forms/combobox'
import type { OptionValue } from '../../../lib/options'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout } from './field-shared'

export interface FormComboboxProps<T = ComboboxOption, V extends OptionValue = string>
  extends Omit<ComboboxProps<T, V>, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur'>,
    FieldLayoutProps {
  name: string
}

/** Value is the selected option's `value`, or null. */
export function FormCombobox<T = ComboboxOption, V extends OptionValue = string>({
  name,
  ...props
}: FormComboboxProps<T, V>) {
  const [layoutProps, comboboxProps] = splitLayout(props)
  return (
    <Form.Field
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <Form.Control>
            <Combobox
              {...comboboxProps}
              ref={field.ref}
              name={field.name}
              value={field.value ?? null}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
            />
          </Form.Control>
        </FormItemLayout>
      )}
    />
  )
}
