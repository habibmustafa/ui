'use client'

import * as React from 'react'

import { Button } from '../../actions/button'
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../popover'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'

/*
 * A lightweight "Are you sure?" anchored to the control that triggered it — for actions
 * that deserve a second click but not a full AlertDialog (removing a row, revoking a
 * key). The panel is a labelled, described dialog; focus moves to Cancel so a stray
 * Enter doesn't confirm; async onConfirm shows a loading state, keeps the panel open
 * while pending and on rejection, and closes on success.
 */

export interface ConfirmPopoverProps {
  /** The element that opens the confirmation, rendered via PopoverTrigger asChild. */
  trigger: React.ReactElement
  title: React.ReactNode
  description?: React.ReactNode
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  /** @default "Confirm" */
  confirmText?: React.ReactNode
  /** @default "Cancel" */
  cancelText?: React.ReactNode
  /** Style the confirm button as destructive. */
  destructive?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: React.ComponentProps<typeof PopoverContent>['side']
  align?: React.ComponentProps<typeof PopoverContent>['align']
  className?: string
}

export function ConfirmPopover({
  trigger,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side,
  align = 'start',
  className,
}: ConfirmPopoverProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [pending, setPending] = React.useState(false)
  const titleId = React.useId()
  const descriptionId = React.useId()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const confirm = async () => {
    try {
      setPending(true)
      await onConfirm()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(next) => {
        // Don't let outside clicks / Escape close it mid-request.
        if (pending && !next) return
        if (!next) onCancel?.()
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={description != null ? descriptionId : undefined}
        side={side}
        align={align}
        className={cn('w-72 p-4', className)}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          cancelRef.current?.focus()
        }}
      >
        <p id={titleId} className="text-sm font-medium text-foreground">
          {title}
        </p>
        {description != null && (
          <div id={descriptionId} className="mt-1 text-xs text-foreground-light">
            {description}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            ref={cancelRef}
            variant="default"
            size="tiny"
            disabled={pending}
            onClick={() => {
              onCancel?.()
              setOpen(false)
            }}
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="tiny"
            loading={pending}
            disabled={pending}
            onClick={() => {
              confirm().catch(() => {
                // Rejected: stay open so the user can retry; the caller reports the error.
              })
            }}
          >
            {confirmText}
          </Button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}
