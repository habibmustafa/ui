'use client'

import { Check, Copy } from 'lucide-react'
import * as React from 'react'

import { Button, type ButtonProps } from '../button'
import { copyToClipboard } from '../../../../lib/copy-to-clipboard'

/*
 * One-click copy with feedback: the icon turns into a check and the label into "Copied"
 * for `timeout` ms, and a polite live region announces it. Uses the library's
 * copyToClipboard (Safari-safe for async values; toasts on failure).
 */

export interface CopyButtonProps extends Omit<ButtonProps, 'value' | 'onCopy' | 'children'> {
  /** Text to copy, or a function returning it (sync or async, e.g. fetch a signed URL). */
  value: string | (() => string | Promise<string>)
  /** Visible label; omit for an icon-only button. */
  label?: React.ReactNode
  /** Label while in the copied state. @default "Copied" */
  copiedLabel?: React.ReactNode
  /** Accessible name when icon-only. @default "Copy" */
  'aria-label'?: string
  /** Called after a successful copy. */
  onCopied?: () => void
  /** How long the copied state lasts. @default 1500 */
  timeout?: number
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      label,
      copiedLabel = 'Copied',
      'aria-label': ariaLabel = 'Copy',
      onCopied,
      timeout = 1500,
      variant = 'default',
      onClick,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false)

    React.useEffect(() => {
      if (!copied) return
      const timer = setTimeout(() => setCopied(false), timeout)
      return () => clearTimeout(timer)
    }, [copied, timeout])

    const iconOnly = label === undefined

    return (
      <>
        <Button
          ref={ref}
          variant={variant}
          icon={copied ? <Check /> : <Copy />}
          aria-label={iconOnly ? (copied ? String(copiedLabel) : ariaLabel) : undefined}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            const text = typeof value === 'function' ? value() : value
            copyToClipboard(text, () => {
              setCopied(true)
              onCopied?.()
            })
          }}
          {...props}
        >
          {iconOnly ? undefined : copied ? copiedLabel : label}
        </Button>
        <span aria-live="polite" className="sr-only">
          {copied ? 'Copied to clipboard' : ''}
        </span>
      </>
    )
  }
)
CopyButton.displayName = 'CopyButton'

export { CopyButton }
