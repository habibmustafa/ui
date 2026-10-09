// Adapted from upstream Alert Dialog (see THIRD-PARTY-NOTICES.md); modified to add a props-driven composition.
import * as React from 'react'

import { cn } from '../../../../lib/utils'
import {
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog-parts'

export interface AlertDialogClassNames {
  content?: string
  header?: string
  title?: string
  description?: string
  body?: string
  footer?: string
}

export interface AlertDialogProps {
  open?: boolean
  /** @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactElement
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  /** Called by AlertDialogAction; async loading and close behavior come from the part. */
  onConfirm?: () => void | Promise<void>
  /** @default "Cancel" (or "Close" when onConfirm is absent) */
  cancelText?: React.ReactNode
  /** @default "Confirm" */
  confirmText?: React.ReactNode
  confirmVariant?: React.ComponentProps<typeof AlertDialogAction>['variant']
  className?: string
  classNames?: AlertDialogClassNames
  slotProps?: {
    content?: Partial<React.ComponentProps<typeof AlertDialogContent>>
    action?: Partial<React.ComponentProps<typeof AlertDialogAction>>
    cancel?: Partial<React.ComponentProps<typeof AlertDialogCancel>>
  }
}

export function AlertDialogHybrid({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  onConfirm,
  cancelText,
  confirmText = 'Confirm',
  confirmVariant,
  className,
  classNames,
  slotProps,
}: AlertDialogProps) {
  const { className: contentClassName, ...contentProps } = slotProps?.content ?? {}
  return (
    <AlertDialogRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        {...contentProps}
        className={cn(className, classNames?.content, contentClassName)}
        {...(description == null && { 'aria-describedby': undefined })}
      >
        <AlertDialogHeader className={classNames?.header}>
          <AlertDialogTitle className={classNames?.title}>{title}</AlertDialogTitle>
          {description != null && (
            <AlertDialogDescription className={classNames?.description}>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children != null && <AlertDialogBody className={classNames?.body}>{children}</AlertDialogBody>}
        <AlertDialogFooter className={classNames?.footer}>
          <AlertDialogCancel {...slotProps?.cancel}>
            {cancelText ?? (onConfirm ? 'Cancel' : 'Close')}
          </AlertDialogCancel>
          {onConfirm && (
            <AlertDialogAction {...slotProps?.action} variant={confirmVariant} onClick={onConfirm}>
              {confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  )
}
