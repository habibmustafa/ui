import { FormField } from '../../atoms/forms/form'
import { DateRangePicker, type DateRangePickerProps } from '../../atoms/forms/date-range-picker'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout, LabelledControl } from './field-shared'

export interface FormDateRangePickerProps
  extends Omit<DateRangePickerProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur'>,
    FieldLayoutProps {
  name: string
}

/** Value is a `{ from, to }` range, or `undefined` while nothing is picked. */
export function FormDateRangePicker({ name, ...props }: FormDateRangePickerProps) {
  const [layoutProps, pickerProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <DateRangePicker
                {...pickerProps}
                ref={field.ref}
                aria-labelledby={labelId}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          </LabelledControl>
        </FormItemLayout>
      )}
    />
  )
}
