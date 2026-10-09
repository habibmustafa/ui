import { FormControl, FormField } from '../../atoms/forms/form'
import { PasswordInput, type PasswordInputProps } from '../../atoms/forms/password-input'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout } from './field-shared'

export interface FormPasswordInputProps
  extends Omit<PasswordInputProps, 'name'>,
    FieldLayoutProps {
  name: string
}

export function FormPasswordInput({ name, ...props }: FormPasswordInputProps) {
  const [layoutProps, inputProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <PasswordInput {...field} {...inputProps} />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}
