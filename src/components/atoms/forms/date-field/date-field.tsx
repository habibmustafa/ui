import * as React from 'react'

import { composeRefs } from '../../../../lib/compose-refs'
import { cn } from '../../../../lib/utils'
import { InputVariants } from '../input'
import { useDateFieldState } from './use-date-field-state'

export interface DateFieldProps {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  /** dayjs tokens; only `YYYY`, `MM`, `DD` and literal separators are supported. */
  format?: string
  /**
   * Range/predicate checks against a *complete* typed date. Never block typing — only
   * mark `aria-invalid` once the date is fully formed, same as MUI's own DateField.
   */
  minDate?: Date
  maxDate?: Date
  isDateInvalid?: (date: Date) => boolean
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge'
  disabled?: boolean
  readOnly?: boolean
  className?: string
  name?: string
  id?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  /** The underlying `<input>`. */
  ref?: React.Ref<HTMLInputElement>
}

const DIGIT_KEYS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])

/**
 * Single real input element whose value is the fully formatted date string; the active
 * segment is the browser's own text selection, moved programmatically with
 * setSelectionRange — the same technique MUI's DateField uses, rather than InputOTP's
 * approach of visually faking one slot per character (there's no natural fixed-count
 * slot here since segments have different widths).
 */
export function DateField({
  value,
  defaultValue = null,
  onChange,
  format = 'DD.MM.YYYY',
  minDate,
  maxDate,
  isDateInvalid,
  size = 'small',
  disabled,
  readOnly,
  className,
  onBlur,
  'aria-invalid': ariaInvalidProp,
  ref,
  ...props
}: DateFieldProps) {
  const {
    displayValue,
    placeholderValue,
    invalid,
    activeIndex,
    numericSegmentCount,
    inputRef,
    moveToIndex,
    step,
    handleDigit,
    handleBackspace,
    handlePaste,
    handleFocus,
    handleBlur,
    indexAtChar,
  } = useDateFieldState({ value, defaultValue, onChange, format, minDate, maxDate, isDateInvalid })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return
    if (DIGIT_KEYS.has(event.key)) {
      event.preventDefault()
      handleDigit(event.key)
      return
    }
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        moveToIndex(activeIndex - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        moveToIndex(activeIndex + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        step(1)
        break
      case 'ArrowDown':
        event.preventDefault()
        step(-1)
        break
      case 'Backspace':
      case 'Delete':
        event.preventDefault()
        handleBackspace()
        break
      case 'Home':
        event.preventDefault()
        moveToIndex(0)
        break
      case 'End':
        event.preventDefault()
        moveToIndex(numericSegmentCount - 1)
        break
      default:
        break
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const charIndex = event.currentTarget.selectionStart ?? 0
    moveToIndex(indexAtChar(charIndex))
  }

  const handlePasteEvent = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    handlePaste(event.clipboardData.getData('text'))
  }

  const handleBlurEvent = (event: React.FocusEvent<HTMLInputElement>) => {
    handleBlur()
    onBlur?.(event)
  }

  return (
    <input
      ref={composeRefs(inputRef, ref)}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      value={displayValue}
      placeholder={placeholderValue}
      onChange={() => {}}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onPaste={handlePasteEvent}
      onFocus={handleFocus}
      onBlur={handleBlurEvent}
      aria-invalid={ariaInvalidProp || invalid}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(InputVariants({ size }), 'font-mono tabular-nums', className)}
      {...props}
    />
  )
}
