'use client'

import { Check, ChevronRight, Circle } from 'lucide-react'
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Ported from `packages/ui/src/components/shadcn/ui/context-menu.tsx`, but classes
 * are taken from this project's already fidelity-checked `dropdown-menu-parts.tsx`
 * instead of that file's own — upstream's `context-menu.tsx` is stale relative to
 * `dropdown-menu.tsx` on the same branch (old `bg-selection`/`text-muted-foreground`
 * tokens vs. the current `bg-overlay-hover`/`text-foreground-lighter` ones), and the
 * two components render identically in the live design system.
 */

const ContextMenuRoot = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

// React 19: `ref` is a plain prop, no forwardRef needed for new components.
function ContextMenuSubTrigger({
  ref,
  className,
  inset,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center rounded-xs pl-2 pr-1 py-1.5 text-xs outline-hidden focus:bg-overlay-hover data-[state=open]:bg-overlay-hover',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto! shrink-0 text-foreground-lighter" size={12} />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50 min-w-32 overflow-hidden rounded-md border border-overlay bg-overlay p-1 text-foreground-light shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-97 data-[state=open]:zoom-in-97 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        className
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        className={cn(
          'z-50 min-w-32 overflow-hidden rounded-md border border-overlay bg-overlay p-1 text-foreground-light shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-97 data-[state=open]:zoom-in-97 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 w-64',
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  ref,
  className,
  inset,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Item> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-xs outline-hidden transition-colors focus:bg-overlay-hover focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  ref,
  className,
  children,
  checked,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-xs outline-hidden transition-colors focus:bg-overlay-hover data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-xs outline-hidden transition-colors focus:bg-overlay-hover data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  ref,
  className,
  inset,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.Label
      ref={ref}
      className={cn('px-2 py-1.5 text-xs text-foreground-lighter', inset && 'pl-8', className)}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-border-overlay', className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
}

export {
  ContextMenuRoot,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
}
