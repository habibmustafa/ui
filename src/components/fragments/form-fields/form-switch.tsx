import * as React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../atoms/forms/form'
import { Switch, type SwitchProps } from '../../atoms/forms/switch'

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
