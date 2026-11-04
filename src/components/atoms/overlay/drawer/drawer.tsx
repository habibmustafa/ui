import * as React from 'react'

import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from './drawer-parts'
import { Button } from '../../actions/button'
import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { useControllableState } from '../../../../lib/use-controllable-state'

type ButtonVariant = React.ComponentProps<typeof Button>['variant']
type DrawerRootProps = React.ComponentProps<typeof DrawerRoot>
type DrawerContentProps = React.ComponentProps<typeof DrawerContent>

export interface DrawerRenderContext {
  close: () => void
  pending: boolean
}

type Slot = React.ReactNode | ((ctx: DrawerRenderContext) => React.ReactNode)

const renderSlot = (slot: Slot | undefined, ctx: DrawerRenderContext) =>
  typeof slot === 'function' ? slot(ctx) : slot

export interface DrawerClassNames {
  content?: string
  header?: string
  title?: string
  description?: string
  body?: string
  footer?: string
}

export interface DrawerProps {
  open?: boolean
  /** @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the drawer, rendered via DrawerTrigger asChild. */
  trigger?: React.ReactElement
  title?: React.ReactNode
  description?: React.ReactNode
  /** Body content. `undefined`/`null` renders no body wrapper. */
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
  /** Edge of the viewport the drawer slides in from. @default "bottom" */
  direction?: DrawerRootProps['direction']
  className?: string
  classNames?: DrawerClassNames
  slotProps?: {
    content?: Partial<DrawerContentProps>
  }
}

export function DrawerHybrid({
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
  direction,
  className,
  classNames,
  slotProps,
}: DrawerProps) {
  const labels = useLabels()
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [pending, setPending] = React.useState(false)

  const close = React.useCallback(() => setOpen(false), [setOpen])
  const ctx: DrawerRenderContext = { close, pending }

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

  const footerNode =
    footer === null
      ? null
      : footer !== undefined
        ? renderSlot(footer, ctx)
        : onConfirm
          ? (
              <>
                <Button variant={confirmType} onClick={handleConfirm} loading={pending}>
                  {confirmText ?? labels.confirm}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={pending}>
                  {cancelText ?? labels.cancel}
                </Button>
              </>
            )
          : null

  const bodyNode = children != null ? renderSlot(children, ctx) : null

  return (
    <DrawerRoot open={open} onOpenChange={handleOpenChange} direction={direction}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        {...slotProps?.content}
        className={cn(className, classNames?.content, slotProps?.content?.className)}
        {...(description == null && { 'aria-describedby': undefined })}
      >
        <DrawerHeader className={classNames?.header}>
          <DrawerTitle className={cn(!title && 'sr-only', classNames?.title)}>
            {title ?? 'Drawer'}
          </DrawerTitle>
          {description != null && (
            <DrawerDescription className={classNames?.description}>{description}</DrawerDescription>
          )}
        </DrawerHeader>

        {bodyNode != null && <div className={classNames?.body}>{bodyNode}</div>}

        {footerNode != null && <DrawerFooter className={classNames?.footer}>{footerNode}</DrawerFooter>}
      </DrawerContent>
    </DrawerRoot>
  )
}
