import * as React from 'react'

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogSection,
  DialogSectionSeparator,
  DialogTitle,
  DialogTrigger,
} from './dialog-parts'
import { Button } from '../../actions/button'
import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { useControllableState } from '../../../../lib/use-controllable-state'

type ButtonVariant = React.ComponentProps<typeof Button>['variant']

export interface DialogRenderContext {
  /** Closes the dialog, same as pressing Cancel or the X button. */
  close: () => void
  /** True while an async `onConfirm` is in flight. */
  pending: boolean
}

type Slot = React.ReactNode | ((ctx: DialogRenderContext) => React.ReactNode)

const renderSlot = (slot: Slot | undefined, ctx: DialogRenderContext) =>
  typeof slot === 'function' ? slot(ctx) : slot

export interface DialogClassNames {
  content?: string
  header?: string
  title?: string
  description?: string
  body?: string
  footer?: string
}

export interface DialogProps {
  /** Controlled open state. */
  open?: boolean
  /** @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the dialog, rendered via DialogTrigger asChild. */
  trigger?: React.ReactElement
  title?: React.ReactNode
  description?: React.ReactNode
  /** Body content. `undefined`/`null` renders no body section. */
  children?: Slot
  /** `undefined` = default Cancel/Confirm buttons (only if `onConfirm` is set), `null` = hidden, node/fn = custom. */
  footer?: Slot | null
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  /** @default "Confirm", from LocaleProvider */
  confirmText?: React.ReactNode
  /** @default "Cancel", from LocaleProvider */
  cancelText?: React.ReactNode
  /** Visual variant of the confirm Button. @default "primary" */
  confirmType?: ButtonVariant
  /** Close the dialog after `onConfirm` resolves. @default true */
  closeOnConfirm?: boolean
  /** Allow closing via overlay click / Escape. @default true */
  dismissible?: boolean
  className?: string
  classNames?: DialogClassNames
  slotProps?: {
    content?: Partial<React.ComponentProps<typeof DialogContent>>
  }
}

export function DialogHybrid({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmType = 'primary',
  closeOnConfirm = true,
  dismissible = true,
  className,
  classNames,
  slotProps,
}: DialogProps) {
  const labels = useLabels()
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [pending, setPending] = React.useState(false)

  const close = React.useCallback(() => setOpen(false), [setOpen])
  const ctx: DialogRenderContext = { close, pending }

  const handleOpenChange = (next: boolean) => {
    if (!next && pending) return
    setOpen(next)
  }

  const handleConfirm = async () => {
    if (!onConfirm) return
    setPending(true)
    try {
      await onConfirm()
      if (closeOnConfirm) setOpen(false)
    } finally {
      setPending(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    close()
  }

  const blockDismiss = (e: Event) => {
    if (!dismissible || pending) e.preventDefault()
  }

  const footerNode =
    footer === null
      ? null
      : footer !== undefined
        ? renderSlot(footer, ctx)
        : onConfirm
          ? (
              <>
                <Button variant="text" onClick={handleCancel} disabled={pending}>
                  {cancelText ?? labels.cancel}
                </Button>
                <Button variant={confirmType} onClick={handleConfirm} loading={pending}>
                  {confirmText ?? labels.confirm}
                </Button>
              </>
            )
          : null

  const bodyNode = children != null ? renderSlot(children, ctx) : null

  const {
    className: contentClassName,
    onInteractOutside,
    onEscapeKeyDown,
    ...contentRest
  } = slotProps?.content ?? {}

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        {...contentRest}
        className={cn(className, classNames?.content, contentClassName)}
        onInteractOutside={(e) => {
          blockDismiss(e)
          onInteractOutside?.(e)
        }}
        onEscapeKeyDown={(e) => {
          blockDismiss(e)
          onEscapeKeyDown?.(e)
        }}
        {...(description == null && { 'aria-describedby': undefined })}
      >
        <DialogHeader className={classNames?.header}>
          {/* Radix requires a Title for a11y even when the caller doesn't show one. */}
          <DialogTitle className={cn(!title && 'sr-only', classNames?.title)}>
            {title ?? 'Dialog'}
          </DialogTitle>
          {description != null && (
            <DialogDescription className={classNames?.description}>{description}</DialogDescription>
          )}
        </DialogHeader>

        {bodyNode != null && (
          <>
            <DialogSectionSeparator />
            <DialogSection className={classNames?.body}>{bodyNode}</DialogSection>
          </>
        )}

        {footerNode != null && <DialogFooter className={classNames?.footer}>{footerNode}</DialogFooter>}
      </DialogContent>
    </DialogRoot>
  )
}
