import { CalendarIcon, X } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../../../lib/utils'
import { Button } from '../../actions/button'
import { DateField } from '../date-field'
import {
  PopoverAnchor,
  PopoverContent as PopoverContentRoot,
  PopoverRoot,
  PopoverTrigger,
} from '../../overlay/popover'

export const DatePickerRoot = (props: ComponentProps<typeof PopoverRoot>) => {
  return <PopoverRoot {...props} />
}

export const DatePickerTrigger = ({
  asChild = true,
  ...props
}: ComponentProps<typeof PopoverTrigger>) => {
  return <PopoverTrigger asChild={asChild} {...props} />
}

const DatePickerIcon = <CalendarIcon className="h-4 w-4" />

export type DatePickerButtonProps = ComponentProps<typeof Button> & { isInvalid?: boolean }

export const DatePickerButton = ({
  className,
  variant = 'default',
  icon = DatePickerIcon,
  isInvalid = false,
  ...props
}: DatePickerButtonProps) => {
  return (
    <Button
      variant={variant}
      className={cn(
        'justify-start text-left font-normal px-3 py-4',
        {
          'bg-destructive-200! border-destructive-400 focus:border-destructive focus-visible:border-destructive focus-visible:outline-amber-700':
            isInvalid,
        },
        className
      )}
      icon={icon}
      {...props}
    />
  )
}

/**
 * Field-mode trigger for single-date selection: a typeable `DateField` with a
 * calendar-icon button (the actual `PopoverTrigger`) overlaid at its end — MUI's own
 * `DatePicker` composition, field + adornment button, rather than a text-label button.
 */
export type DatePickerFieldProps = ComponentProps<typeof DateField> & { isInvalid?: boolean }

export const DatePickerField = ({
  className,
  isInvalid = false,
  disabled,
  value,
  onChange,
  ...props
}: DatePickerFieldProps) => {
  return (
    <PopoverAnchor asChild>
      <div className="relative inline-flex">
        <DateField
          disabled={disabled}
          aria-invalid={isInvalid}
          value={value}
          onChange={onChange}
          className={cn('pr-14', className)}
          {...props}
        />
        {value && (
          <Button
            type="button"
            variant="text"
            size="tiny"
            icon={<X className="h-3.5 w-3.5" />}
            disabled={disabled}
            aria-label="Clear date"
            onClick={() => onChange?.(null)}
            className="absolute right-8 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          />
        )}
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="text"
            size="tiny"
            icon={DatePickerIcon}
            disabled={disabled}
            aria-label="Open calendar"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          />
        </PopoverTrigger>
      </div>
    </PopoverAnchor>
  )
}

export const DatePickerContent = ({
  className,
  align = 'start',
  ...props
}: ComponentProps<typeof PopoverContentRoot>) => {
  return <PopoverContentRoot className={cn('w-auto p-0', className)} align={align} {...props} />
}
