import { FormControl, FormField } from '../../atoms/forms/form'
import { DatePicker } from '../../atoms/forms/date-picker'
import { FormItemLayout } from '../form-item-layout'
import { type LayoutProps } from './field-shared'

export interface FormDatePickerProps extends LayoutProps {
  name: string
  format?: string
  minDate?: Date
  maxDate?: Date
  disabled?: (date: Date) => boolean
}

/**
 * Single-date only. For a `{ from, to }` value use `FormDateRangePicker`; to assemble a
 * range picker by hand see date-picker-with-range-props-demo.
 */
export function FormDatePicker({
  name,
  label,
  description,
  labelOptional,
  align,
  layout,
  size,
  labelLayout,
  format,
  minDate,
  maxDate,
  disabled,
}: FormDatePickerProps) {
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
          size={size}
          labelLayout={labelLayout}
        >
          <FormControl>
            <DatePicker
              format={format}
              fieldContainerClassName="w-full"
              minDate={minDate}
              maxDate={maxDate}
              calendarProps={{
                mode: 'single',
                selected: field.value,
                onSelect: field.onChange,
                disabled,
                autoFocus: true,
              }}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}
