import * as React from 'react'

import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetRoot,
  SheetSection,
  SheetTitle,
  SheetTrigger,
} from './sheet-parts'
import { Button } from '../../actions/button'
import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { useControllableState } from '../../../../lib/use-controllable-state'

type ButtonVariant = React.ComponentProps<typeof Button>['variant']
type SheetContentProps = React.ComponentProps<typeof SheetContent>

export interface SheetRenderContext {
  close: () => void
  pending: boolean
}

type Slot = React.ReactNode | ((ctx: SheetRenderContext) => React.ReactNode)

const renderSlot = (slot: Slot | undefined, ctx: SheetRenderContext) =>
  typeof slot === 'function' ? slot(ctx) : slot

export interface SheetClassNames {
  content?: string
  header?: string
  title?: string
  description?: string
  body?: string
  footer?: string
}

export interface SheetProps {
  open?: boolean
  /** @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the sheet, rendered via SheetTrigger asChild. */
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
  /** @default true */
  closeOnConfirm?: boolean
  /** Allow closing via overlay click / Escape. @default true */
  dismissible?: boolean
  /** Radix's own non-modal mode — no overlay, underlying content stays interactive. @default true */
  modal?: boolean
  /** Edge of the viewport the sheet slides in from. @default "right" */
  side?: SheetContentProps['side']
  /** Sheet width/height. @default "default" */
  size?: SheetContentProps['size']
  /**
   * Drops the header, separator, body padding and footer: only `children` render, with
   * `title` kept as a visually hidden name for assistive tech. For content that brings its
   * own layout (a command palette, a navigation list).
   */
  bare?: boolean
  className?: string
  classNames?: SheetClassNames
  slotProps?: {
    content?: Partial<SheetContentProps>
  }
}

export function SheetHybrid({
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
  modal,
  side,
  size,
  bare = false,
  className,
  classNames,
  slotProps,
}: SheetProps) {
  const labels = useLabels()
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [pending, setPending] = React.useState(false)

  const close = React.useCallback(() => setOpen(false), [setOpen])
  const ctx: SheetRenderContext = { close, pending }

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
                <Button variant="outline" onClick={handleCancel} disabled={pending}>
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
    <SheetRoot open={open} onOpenChange={handleOpenChange} modal={modal}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side={side}
        size={size}
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
        {bare ? (
          <>
            <SheetTitle className="sr-only">{title ?? 'Sheet'}</SheetTitle>
            {bodyNode}
          </>
        ) : (
          <>
            <SheetHeader className={classNames?.header}>
              <SheetTitle className={cn(!title && 'sr-only', classNames?.title)}>
                {title ?? 'Sheet'}
              </SheetTitle>
              {description != null && (
                <SheetDescription className={classNames?.description}>
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>

            {bodyNode != null && (
              <SheetSection className={classNames?.body}>{bodyNode}</SheetSection>
            )}

            {footerNode != null && (
              <SheetFooter className={classNames?.footer}>{footerNode}</SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </SheetRoot>
  )
}
