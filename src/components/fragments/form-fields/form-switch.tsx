import * as React from 'react'
import { Form } from '../../atoms/forms/form'
import { Switch, type SwitchProps } from '../../atoms/forms/switch'

export interface FormSwitchProps extends Omit<SwitchProps, 'name' | 'checked' | 'onCheckedChange'> {
  name: string
  label?: React.ReactNode
  description?: React.ReactNode
}

export function FormSwitch({ name, label, description, ...switchProps }: FormSwitchProps) {
  return (
    <Form.Field
      name={name}
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center gap-2">
            <Form.Control>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                {...switchProps}
              />
            </Form.Control>
            {(label || description) && (
              <div className="grid gap-1 leading-none">
                {label && <Form.Label className="font-normal">{label}</Form.Label>}
                {description && <p className="text-sm text-foreground-lighter">{description}</p>}
              </div>
            )}
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  )
}
