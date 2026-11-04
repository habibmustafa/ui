import { forwardRef, type ElementRef } from 'react'

import { Form } from '../../atoms/forms/form'
import { FormLayout } from './form-layout'

const FormItemLayout = forwardRef<
  ElementRef<typeof FormLayout>,
  React.ComponentPropsWithoutRef<typeof FormLayout> // Use any as placeholder types
>(({ ...props }, ref) => {
  return (
    <Form.Item>
      <FormLayout ref={ref} isReactForm {...props}>
        {props.children}
      </FormLayout>
    </Form.Item>
  )
})

FormItemLayout.displayName = 'FormItemLayout'

export { FormItemLayout }
