import * as React from 'react'
import { Checkbox } from '../../atoms/forms/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../atoms/forms/form'

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
