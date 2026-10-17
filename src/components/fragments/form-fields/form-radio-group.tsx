import { Form } from '../../atoms/forms/form'
import { RadioGroup, type RadioOption } from '../../atoms/forms/radio-group'
import { FormItemLayout } from '../form-item-layout'
import { type LayoutProps } from './field-shared'

export interface FormRadioGroupProps extends LayoutProps {
  name: string
  options: readonly RadioOption[]
  className?: string
  disabled?: boolean
}

export function FormRadioGroup({
  name,
  label,
  description,
  labelOptional,
  align,
  layout,
  size,
  labelLayout,
  options,
  className,
  disabled,
}: FormRadioGroupProps) {
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
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              options={options as RadioOption[]}
              className={className}
              disabled={disabled}
            />
          </Form.Control>
        </FormItemLayout>
      )}
    />
  )
}
