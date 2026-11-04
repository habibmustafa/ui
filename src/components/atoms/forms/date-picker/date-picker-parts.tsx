import { CalendarIcon, X } from 'lucide-react'
import type { ComponentProps } from 'react'

import { fieldIconButtonClass, fieldIconClass, fieldIconStrokeWidth } from '../../../../lib/field-icon-button'
import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { Button } from '../../actions/button'
import { DateField } from '../date-field'
import { FieldClear } from '../select/field-clear'
import {
  Popover,
  PopoverContent as PopoverContentRoot,
  PopoverRoot,
  PopoverTrigger,
} from '../../overlay/popover'

export const DatePickerRoot = (props: ComponentProps<typeof PopoverRoot>) => {
  return <Popover.Root {...props} />
}

export const DatePickerTrigger = ({
  asChild = true,
  ...props
}: ComponentProps<typeof PopoverTrigger>) => {
  return <Popover.Trigger asChild={asChild} {...props} />
}

// Trailing, 16px, 1.5 stroke: the same icon as DatePickerField's and every other field's.
// (`!` beats Button's own [&_svg]:h-4.5 icon sizing.)
const DatePickerIcon = (
  <CalendarIcon className={cn(fieldIconClass, 'h-4! w-4! text-foreground-lighter')} strokeWidth={fieldIconStrokeWidth} />
)

export type DatePickerButtonProps = ComponentProps<typeof Button> & {
  isInvalid?: boolean
  /** Shows a × before the calendar icon; omit when there is nothing to clear. */
  onClear?: () => void
}

export const DatePickerButton = ({
  className,
  variant = 'default',
  icon = DatePickerIcon,
  isInvalid = false,
  onClear,
  ...props
}: DatePickerButtonProps) => {
  return (
    <Button
      variant={variant}
      className={cn(
        // A field, not an action: same surface and border as Input.
        'justify-between text-left font-normal pl-3 pr-1.75 py-4 bg-field dark:bg-field border-control hover:border-control-hover',
        {
          'bg-invalid-bg! border-invalid-border focus:border-destructive focus-visible:border-destructive focus-visible:outline-destructive':
            isInvalid,
        },
        className
      )}
      iconRight={
        onClear && !props.disabled ? (
          <span className="flex items-center gap-2">
            <FieldClear onClear={onClear} />
            {icon}
          </span>
        ) : (
          icon
        )
      }
      {...props}
    />
  )
}

/**
 * Field-mode trigger for single-date selection: a typeable `DateField` with a
 * calendar-icon button (the actual `PopoverTrigger`) overlaid at its end — MUI's own
 * `DatePicker` composition, field + adornment button, rather than a text-label button.
 */
export type DatePickerFieldProps = ComponentProps<typeof DateField> & {
  isInvalid?: boolean
  /** Classes for the wrapper around the field and its buttons, e.g. `w-full`. */
  containerClassName?: string
}

export const DatePickerField = ({
  className,
  containerClassName,
  isInvalid = false,
  disabled,
  value,
  onChange,
  ...props
}: DatePickerFieldProps) => {
  const labels = useLabels()
  return (
    <Popover.Anchor asChild>
      <div className={cn('relative inline-flex', containerClassName)}>
        <DateField
          disabled={disabled}
          aria-invalid={isInvalid}
          value={value}
          onChange={onChange}
          className={cn('pr-14', className)}
          {...props}
        />
        {value && (
          <button
            type="button"
            disabled={disabled}
            aria-label={labels.clearDate}
            onClick={() => onChange?.(null)}
            className={cn(fieldIconButtonClass, 'absolute right-7 top-1/2 -translate-y-1/2')}
          >
            <X aria-hidden="true" className={fieldIconClass} strokeWidth={fieldIconStrokeWidth} />
          </button>
        )}
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={labels.openCalendar}
            className={cn(fieldIconButtonClass, 'absolute right-1 top-1/2 -translate-y-1/2')}
          >
            <CalendarIcon aria-hidden="true" className={fieldIconClass} strokeWidth={fieldIconStrokeWidth} />
          </button>
        </Popover.Trigger>
      </div>
    </Popover.Anchor>
  )
}

export const DatePickerContent = ({
  className,
  align = 'start',
  ...props
}: ComponentProps<typeof PopoverContentRoot>) => {
  return <PopoverContentRoot className={cn('w-auto p-0', className)} align={align} {...props} />
}
