'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { X as RemoveIcon, Search } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

const CommandRoot = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-overlay text-foreground-light',
      className
    )}
    {...props}
  />
))
CommandRoot.displayName = CommandPrimitive.displayName

// CommandDialog lives in command.tsx — it composes CommandHybrid for the groups-mode API,
// which would be a circular import if defined here.

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    wrapperClassName?: string
    showResetIcon?: boolean
    showSearchIcon?: boolean
    handleReset?: () => void
  }
>(
  (
    {
      className,
      wrapperClassName,
      showResetIcon = false,
      showSearchIcon = true,
      handleReset,
      ...props
    },
    ref
  ) => (
    <div className={cn('flex items-center border-b px-4', wrapperClassName)} cmdk-input-wrapper="">
      {showSearchIcon && <Search className="h-4 w-4 shrink-0 opacity-50" aria-hidden />}
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0',
          className
        )}
        {...props}
      />
      {showResetIcon && (
        <button
          type="button"
          tabIndex={props.disabled || !props.value?.length ? -1 : 0}
          disabled={props.disabled || !props.value?.length}
          onClick={handleReset}
          aria-label="Clear search"
          className={cn(
            'text-foreground-lighter hover:text-foreground-light hover:cursor-pointer transition-all opacity-0 duration-100',
            !!props.value?.length && 'opacity-100'
          )}
        >
          <RemoveIcon size={14} aria-hidden />
        </button>
      )}
    </div>
  )
)

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, onWheel, onTouchMove, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-full overflow-y-auto overflow-x-hidden', className)}
    // A dialog or sheet locks scrolling by cancelling wheel and touch events that land outside
    // it, and a dropdown portals to the body. Keeping both off the document is what lets the
    // list scroll with a trackpad and with a finger while an overlay is open.
    onWheel={(event) => {
      event.stopPropagation()
      onWheel?.(event)
    }}
    onTouchMove={(event) => {
      event.stopPropagation()
      onTouchMove?.(event)
    }}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-6 text-center text-xs', className)}
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground-light **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-foreground-muted',
      '**:[[cmdk-group-heading]]:font-medium',
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border-overlay', className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-xs outline-hidden data-[selected=true]:bg-overlay-hover data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-foreground-muted', className)}
      {...props}
    />
  )
}
CommandShortcut.displayName = 'CommandShortcut'

export {
  CommandRoot,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
