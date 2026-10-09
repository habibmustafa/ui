import { FormControl, FormField } from '../../atoms/forms/form'
import { InputOTP } from '../../atoms/forms/input-otp'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout } from './field-shared'

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
