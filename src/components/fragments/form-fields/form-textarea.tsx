import { Form } from '../../atoms/forms/form'
import { Textarea, type TextareaProps } from '../../atoms/forms/textarea'
import { FormItemLayout } from '../form-item-layout'
import { type LayoutProps } from './field-shared'

export interface FormTextareaProps extends Omit<TextareaProps, 'name'>, LayoutProps {
  name: string
}

export function FormTextarea({ name, ...props }: FormTextareaProps) {
  const { label, description, labelOptional, align, layout, size, labelLayout, ...textareaProps } =
    props
  return (
    <Form.Field
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
          <Form.Control>
            <Textarea {...field} {...textareaProps} />
          </Form.Control>
        </FormItemLayout>
      )}
    />
  )
}
