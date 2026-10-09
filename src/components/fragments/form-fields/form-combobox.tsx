import { FormControl, FormField } from '../../atoms/forms/form'
import { Combobox, type ComboboxProps } from '../../atoms/forms/combobox'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout } from './field-shared'

export interface FormComboboxProps
  extends Omit<ComboboxProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur'>,
    FieldLayoutProps {
  name: string
}

/** Value is the selected option's `value`, or null. */
export function FormCombobox({ name, ...props }: FormComboboxProps) {
  const [layoutProps, comboboxProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <Combobox
              {...comboboxProps}
              ref={field.ref}
              name={field.name}
              value={field.value ?? null}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}
