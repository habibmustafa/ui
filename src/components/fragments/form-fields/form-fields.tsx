/*
 * Terser field components for `react-hook-form` + `zod` forms: each wraps the ceremony
 * shadcn's own pattern needs per field (`FormField` → `FormItem` → `FormLabel` +
 * `FormControl` + `FormDescription` + `FormMessage`, all wired to the same `name`) so a
 * form body reads as `<FormInput name="email" label="Email" />` instead of that whole
 * tree spelled out by hand. `FormField`'s `Controller` resolves `control` from the nearest
 * `<Form {...methods}>` (a `FormProvider`) automatically, so none of these take a `control`
 * prop — just `name`.
 *
 * These are ui's own components, not an upstream port — the atoms they wrap
 * (Input/Textarea/Checkbox/Switch/Select/RadioGroup/DatePicker) and FormItemLayout stay
 * untouched, so using them outside a form is unaffected.
 */
import * as React from 'react'

import { Checkbox } from '../../atoms/forms/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../atoms/forms/form'
import { Input, type InputProps } from '../../atoms/forms/input'
import { RadioGroup, type RadioOption } from '../../atoms/forms/radio-group'
import { Select, type SelectOption, type SelectOptionGroup } from '../../atoms/forms/select'
import { Switch, type SwitchProps } from '../../atoms/forms/switch'
import { Textarea, type TextareaProps } from '../../atoms/forms/textarea'
import { DatePicker } from '../date-picker'
import { FormItemLayout } from '../form-item-layout'

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
