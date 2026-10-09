import { DateField, type DateFieldProps } from '../../atoms/forms/date-field'
import { FormControl, FormField } from '../../atoms/forms/form'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout } from './field-shared'

export interface FormDateFieldProps
  extends Omit<DateFieldProps, 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref'>,
    FieldLayoutProps {
  name: string
}

/** Typed date (no calendar); value is a `Date` or null until the date is complete. */
export function FormDateField({ name, ...props }: FormDateFieldProps) {
  const [layoutProps, fieldProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <DateField
              {...fieldProps}
              ref={field.ref}
              name={field.name}
              value={field.value ?? null}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}
