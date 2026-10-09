import { FormControl, FormField } from '../../atoms/forms/form'
import { NumberInput, type NumberInputProps } from '../../atoms/forms/number-input'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout } from './field-shared'

export interface FormNumberInputProps
  extends Omit<NumberInputProps, 'name' | 'value' | 'defaultValue' | 'onValueChange'>,
    FieldLayoutProps {
  name: string
}

/** Value is `number | null` (null for an empty field). */
export function FormNumberInput({ name, ...props }: FormNumberInputProps) {
  const [layoutProps, inputProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <NumberInput
              {...inputProps}
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
