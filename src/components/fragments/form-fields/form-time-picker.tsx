import { FormField } from '../../atoms/forms/form'
import { TimePicker, type TimePickerProps } from '../../atoms/forms/time-picker'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout, LabelledControl } from './field-shared'

export interface FormTimePickerProps
  extends Omit<TimePickerProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'ref'>,
    FieldLayoutProps {
  name: string
}

/** Value is an "HH:mm" / "HH:mm:ss" string, or null until every segment is filled. */
export function FormTimePicker({ name, ...props }: FormTimePickerProps) {
  const [layoutProps, pickerProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <TimePicker
                {...pickerProps}
                // Focusing the group moves focus to its first segment.
                ref={field.ref}
                aria-labelledby={labelId}
                value={field.value ?? null}
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
