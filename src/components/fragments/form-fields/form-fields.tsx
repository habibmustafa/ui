/*
 * Terser field components for `react-hook-form` + `zod` forms: each wraps the ceremony
 * shadcn's own pattern needs per field (`FormField` → `FormItem` → `FormLabel` +
 * `FormControl` + `FormDescription` + `FormMessage`, all wired to the same `name`) so a
 * form body reads as `<FormInput name="email" label="Email" />` instead of that whole
 * tree spelled out by hand. `FormField`'s `Controller` resolves `control` from the nearest
 * `<Form {...methods}>` (a `FormProvider`) automatically, so none of these take a `control`
 * prop — just `name`.
 *
 * These are ui's own components, not an upstream port — the atoms they wrap and
 * FormItemLayout stay untouched, so using them outside a form is unaffected.
 *
 * Every field wires all four of react-hook-form's hooks into its control: the value and
 * its change handler, `onBlur` (touched state, `mode: 'onBlur'`) and `ref` (focus on the
 * first invalid field after a failed submit), plus the FormControl ids so the label,
 * description and error message point at the element a user actually reaches.
 */
// Keep fields in separate modules so one text input does not load every picker.
export { FormInput, type FormInputProps } from './form-input'
export { FormTextarea, type FormTextareaProps } from './form-textarea'
export { FormSelect, type FormSelectProps } from './form-select'
export { FormCheckbox, type FormCheckboxProps } from './form-checkbox'
export { FormSwitch, type FormSwitchProps } from './form-switch'
export { FormRadioGroup, type FormRadioGroupProps } from './form-radio-group'
export { FormDatePicker, type FormDatePickerProps } from './form-date-picker'
export { FormNumberInput, type FormNumberInputProps } from './form-number-input'
export { FormPasswordInput, type FormPasswordInputProps } from './form-password-input'
export { FormTimePicker, type FormTimePickerProps } from './form-time-picker'
export { FormSlider, type FormSliderProps } from './form-slider'
export { FormRating, type FormRatingProps } from './form-rating'
export { FormDateRangePicker, type FormDateRangePickerProps } from './form-date-range-picker'
export { FormInputOTP, type FormInputOTPProps } from './form-input-otp'
export { FormDateField, type FormDateFieldProps } from './form-date-field'
export { FormCombobox, type FormComboboxProps } from './form-combobox'
export { FormMultiSelect, type FormMultiSelectProps } from './form-multi-select'
export { FormFileUpload, type FormFileUploadProps } from './form-file-upload'
export { FormToggleGroup, type FormToggleGroupProps } from './form-toggle-group'
