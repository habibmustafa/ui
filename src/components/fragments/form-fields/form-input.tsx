import { FormControl, FormField } from '../../atoms/forms/form'
import { Input, type InputProps } from '../../atoms/forms/input'
import { FormItemLayout } from '../form-item-layout'
import { type LayoutProps } from './field-shared'

export interface FormInputProps
  extends Omit<InputProps, 'name'>,
    Omit<LayoutProps, 'size'> {
  name: string
}

export function FormInput({ name, ...props }: FormInputProps) {
  // `size` is Input's own visual-size variant, not FormItemLayout's label/text size — the two
  // clash on the name, so this field only exposes Input's.
  const { label, description, labelOptional, align, layout, labelLayout, ...inputProps } = props
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout
          label={label}
          description={description}
          labelOptional={labelOptional}
          align={align}
          layout={layout}
          labelLayout={labelLayout}
        >
          <FormControl>
            <Input {...field} {...inputProps} />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}
