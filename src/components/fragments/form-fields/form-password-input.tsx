import { Form } from '../../atoms/forms/form'
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
    <Form.Field
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <Form.Control>
            <PasswordInput {...field} {...inputProps} />
          </Form.Control>
        </FormItemLayout>
      )}
    />
  )
}
