import { DatePickerHybrid } from './date-picker'
import {
  DatePickerButton,
  DatePickerContent,
  DatePickerField,
  DatePickerRoot,
  DatePickerTrigger,
} from './date-picker-parts'

export const DatePicker = Object.assign(DatePickerHybrid, {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  Button: DatePickerButton,
  Field: DatePickerField,
  Content: DatePickerContent,
})

export {
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerButton,
  DatePickerField,
  DatePickerContent,
} from './date-picker-parts'
export type { DatePickerButtonProps, DatePickerFieldProps } from './date-picker-parts'
export type { DatePickerProps } from './date-picker'
