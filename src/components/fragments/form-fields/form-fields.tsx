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
import * as React from 'react'
import type { RefCallBack } from 'react-hook-form'

import { ToggleGroup, type ToggleGroupItemData } from '../../atoms/actions/toggle-group'
import { Checkbox } from '../../atoms/forms/checkbox'
import { DateField, type DateFieldProps } from '../../atoms/forms/date-field'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '../../atoms/forms/form'
import { Input, type InputProps } from '../../atoms/forms/input'
import { InputOTP } from '../../atoms/forms/input-otp'
import { NumberInput, type NumberInputProps } from '../../atoms/forms/number-input'
import { PasswordInput, type PasswordInputProps } from '../../atoms/forms/password-input'
import { RadioGroup, type RadioOption } from '../../atoms/forms/radio-group'
import { Select, type SelectOption, type SelectOptionGroup } from '../../atoms/forms/select'
import { Slider, type SliderProps } from '../../atoms/forms/slider'
import { Switch, type SwitchProps } from '../../atoms/forms/switch'
import { Textarea, type TextareaProps } from '../../atoms/forms/textarea'
import { TimePicker, type TimePickerProps } from '../../atoms/forms/time-picker'
import { Combobox, type ComboboxProps } from '../combobox'
import { DatePicker } from '../date-picker'
import { FileUpload, type FileUploadProps } from '../file-upload'
import { FormItemLayout } from '../form-item-layout'
import { MultiSelector, type MultiSelectorOption, type MultiSelectorProps } from '../multi-select'

/**
 * The label/description/layout knobs every field shares, hand-picked from FormItemLayout's
 * own prop type rather than reusing it wholesale — FormItemLayout's type also carries every
 * native `<div>` attribute (`onAbort` etc.), and intersecting that with an atom's own native
 * element attributes (`<input>`, `<textarea>`) produces an unsatisfiable event-handler type.
 */
interface LayoutProps {
  label?: React.ReactNode
  description?: React.ReactNode
  labelOptional?: React.ReactNode
  align?: 'left' | 'right'
  layout?: 'horizontal' | 'vertical' | 'flex' | 'flex-row-reverse'
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge'
  labelLayout?: 'horizontal' | 'vertical'
}

type FieldLayoutProps = Omit<LayoutProps, 'size'>

function splitLayout<T extends FieldLayoutProps>(props: T) {
  const { label, description, labelOptional, align, layout, labelLayout, ...rest } = props
  return [{ label, description, labelOptional, align, layout, labelLayout }, rest] as const
}

/**
 * FormControl that also hands its render function the label's id, for controls a
 * `<label for>` can't name — a role="group" of segments, slider thumbs, a trigger button
 * nested inside the element that gets FormControl's `id`. `undefined` when the field has
 * no label, so nothing ever points at a missing element.
 */
function LabelledControl({
  labelled,
  children,
}: {
  labelled: boolean
  children: (labelId: string | undefined) => React.ReactElement
}) {
  const { formLabelId } = useFormField()
  return <FormControl>{children(labelled ? formLabelId : undefined)}</FormControl>
}

/**
 * react-hook-form focuses the first invalid field through `field.ref(el).focus()`. For a
 * control whose ref'd element isn't itself focusable, register a stand-in that focuses
 * the first matching descendant instead.
 */
const focusDescendant = (ref: RefCallBack, selector: string) => (el: HTMLElement | null) => {
  if (el) ref({ focus: () => el.querySelector<HTMLElement>(selector)?.focus() })
}

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

export interface FormTextareaProps extends Omit<TextareaProps, 'name'>, LayoutProps {
  name: string
}

export function FormTextarea({ name, ...props }: FormTextareaProps) {
  const { label, description, labelOptional, align, layout, size, labelLayout, ...textareaProps } =
    props
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
            <Textarea {...field} {...textareaProps} />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}

export interface FormSelectProps extends LayoutProps {
  name: string
  placeholder?: React.ReactNode
  className?: string
  options?: readonly SelectOption[]
  groups?: readonly SelectOptionGroup[]
  disabled?: boolean
}

export function FormSelect({
  name,
  label,
  description,
  labelOptional,
  align,
  layout,
  size,
  labelLayout,
  placeholder,
  className,
  options,
  groups,
  disabled,
}: FormSelectProps) {
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
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
              placeholder={placeholder}
              className={className}
              options={options as SelectOption[]}
              groups={groups as SelectOptionGroup[]}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}

export interface FormCheckboxProps {
  name: string
  label?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * Checkbox/Switch read better with the control before the label, not above it — this
 * mirrors upstream's own checkbox-with-text.tsx layout rather than routing through
 * FormItemLayout's label-above-content grid.
 */
export function FormCheckbox({ name, label, description, disabled, className }: FormCheckboxProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        // FormItem gives the control/label/message a shared id (without it every
        // FormCheckbox shared one "undefined-…" id); FormMessage shows the error.
        <FormItem>
          <div className="items-top flex space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                className={className}
              />
            </FormControl>
            {(label || description) && (
              <div className="grid gap-1.5 leading-none">
                {label && <FormLabel className="font-normal">{label}</FormLabel>}
                {description && <p className="text-sm text-foreground-lighter">{description}</p>}
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export interface FormSwitchProps extends Omit<SwitchProps, 'name' | 'checked' | 'onCheckedChange'> {
  name: string
  label?: React.ReactNode
  description?: React.ReactNode
}

export function FormSwitch({ name, label, description, ...switchProps }: FormSwitchProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                {...switchProps}
              />
            </FormControl>
            {(label || description) && (
              <div className="grid gap-1 leading-none">
                {label && <FormLabel className="font-normal">{label}</FormLabel>}
                {description && <p className="text-sm text-foreground-lighter">{description}</p>}
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

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
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              options={options as RadioOption[]}
              className={className}
              disabled={disabled}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}

export interface FormDatePickerProps extends LayoutProps {
  name: string
  format?: string
  minDate?: Date
  maxDate?: Date
  disabled?: (date: Date) => boolean
}

/**
 * Single-date only — react-day-picker's mode: 'range' needs a `selected`/`onSelect`
 * shape RHF's single `field.value`/`field.onChange` doesn't map onto cleanly (a range field
 * would want its own `{ from, to }` value type). Compose a range picker by hand with
 * `DatePicker`'s own `calendarProps` for that case — see date-picker-with-range-props-demo.
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


export interface FormNumberInputProps
  extends Omit<NumberInputProps, 'name' | 'value' | 'defaultValue' | 'onValueChange'>,
    FieldLayoutProps {
  name: string
}

/** Value is `number | null` (null for an empty field). */
export function FormNumberInput({ name, ...props }: FormNumberInputProps) {
  const [layoutProps, inputProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <NumberInput
              {...inputProps}
              ref={field.ref}
              name={field.name}
              value={field.value ?? null}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}

export interface FormPasswordInputProps
  extends Omit<PasswordInputProps, 'name'>,
    FieldLayoutProps {
  name: string
}

export function FormPasswordInput({ name, ...props }: FormPasswordInputProps) {
  const [layoutProps, inputProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <PasswordInput {...field} {...inputProps} />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}

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

export interface FormSliderProps
  extends Omit<SliderProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur'>,
    FieldLayoutProps {
  name: string
}

/** Value is a `number[]` — one entry per thumb, so two values make a range. */
export function FormSlider({ name, ...props }: FormSliderProps) {
  const [layoutProps, sliderProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <Slider
                {...sliderProps}
                ref={focusDescendant(field.ref, '[role="slider"]')}
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

export interface FormInputOTPProps extends FieldLayoutProps {
  name: string
  /** Number of character slots. */
  slots: number
  /** Splits the slots into groups of this size. */
  groupSize?: number
  /** Allowed characters, e.g. `REGEXP_ONLY_DIGITS`. */
  pattern?: string
  disabled?: boolean
  onComplete?: (value: string) => void
  className?: string
  containerClassName?: string
}

/** Value is the typed string (`''` when empty). */
export function FormInputOTP({ name, ...props }: FormInputOTPProps) {
  const [layoutProps, otpProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <InputOTP
              {...otpProps}
              ref={field.ref}
              name={field.name}
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}

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

export interface FormComboboxProps
  extends Omit<ComboboxProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur'>,
    FieldLayoutProps {
  name: string
}

/** Value is the selected option's `value`, or null. */
export function FormCombobox({ name, ...props }: FormComboboxProps) {
  const [layoutProps, comboboxProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <FormControl>
            <Combobox
              {...comboboxProps}
              ref={field.ref}
              name={field.name}
              value={field.value ?? null}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
            />
          </FormControl>
        </FormItemLayout>
      )}
    />
  )
}

type MultiSelectorOptionsProps = Extract<
  MultiSelectorProps,
  { options: readonly MultiSelectorOption[] }
>

export type FormMultiSelectProps = Omit<
  MultiSelectorOptionsProps,
  'values' | 'onValuesChange' | 'onBlur' | 'ref' | 'label' | 'id'
> &
  FieldLayoutProps & {
    name: string
    /** Trigger text while nothing is selected (MultiSelector's own `label`). */
    placeholder?: string
  }

/** Value is a `string[]` of selected option values. */
export function FormMultiSelect({ name, placeholder, ...props }: FormMultiSelectProps) {
  const [layoutProps, selectorProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <MultiSelector
                {...selectorProps}
                label={placeholder}
                ref={field.ref}
                aria-labelledby={labelId}
                values={field.value ?? []}
                onValuesChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          </LabelledControl>
        </FormItemLayout>
      )}
    />
  )
}

export interface FormFileUploadProps
  extends Omit<
      FileUploadProps,
      'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'label' | 'id'
    >,
    FieldLayoutProps {
  name: string
  /** Heading inside the drop zone (FileUpload's own `label`). */
  dropzoneLabel?: React.ReactNode
}

/** Value is a `File[]`. */
export function FormFileUpload({ name, dropzoneLabel, ...props }: FormFileUploadProps) {
  const [layoutProps, uploadProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <FileUpload
                {...uploadProps}
                label={dropzoneLabel}
                // The forwarded ref is the hidden file input; focusing it focuses Browse.
                ref={field.ref}
                aria-labelledby={labelId}
                value={field.value ?? []}
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

export interface FormToggleGroupProps extends FieldLayoutProps {
  name: string
  items: readonly ToggleGroupItemData[]
  /** `single`: the value is a string (`''` when none); `multiple`: a `string[]`. @default "single" */
  type?: 'single' | 'multiple'
  variant?: React.ComponentProps<typeof ToggleGroup>['variant']
  size?: React.ComponentProps<typeof ToggleGroup>['size']
  disabled?: boolean
  className?: string
}

export function FormToggleGroup({ name, type = 'single', ...props }: FormToggleGroupProps) {
  const [layoutProps, groupProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) =>
              type === 'multiple' ? (
                <ToggleGroup
                  {...groupProps}
                  type="multiple"
                  // Focusing the group moves focus to its active (or first) item.
                  ref={field.ref}
                  aria-labelledby={labelId}
                  value={field.value ?? []}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                />
              ) : (
                <ToggleGroup
                  {...groupProps}
                  type="single"
                  ref={field.ref}
                  aria-labelledby={labelId}
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )
            }
          </LabelledControl>
        </FormItemLayout>
      )}
    />
  )
}
