'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandRoot,
  CommandSeparator,
} from '../../atoms/navigation/command'
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../atoms/overlay/popover'
import { selectTriggerVariants, type SelectTriggerSize } from '../../atoms/forms/select'
import { useControllableState } from '../../../lib/use-controllable-state'
import { cn } from '../../../lib/utils'

/*
 * Single-value, searchable select: a Select-styled trigger opening a Popover with a
 * cmdk Command list (shadcn/ui's Combobox recipe). MultiSelect covers several values;
 * this is the one-value counterpart with the same `options`/`groups` shape as Select.
 */

export interface ComboboxOption {
  value: string
  label: string
  /** Extra search terms, e.g. a country code. */
  keywords?: string[]
  disabled?: boolean
  icon?: React.ReactNode
}

export interface ComboboxOptionGroup {
  label?: string
  options: readonly ComboboxOption[]
}

export interface ComboboxClassNames {
  trigger?: string
  content?: string
  item?: string
}

export interface ComboboxProps {
  options?: readonly ComboboxOption[]
  /** Grouped options; used instead of `options` when both are given. */
  groups?: readonly ComboboxOptionGroup[]
  /** Selected value, controlled; `null` for none. */
  value?: string | null
  /** @default null */
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Trigger text when nothing is selected. @default "Select…" */
  placeholder?: React.ReactNode
  /** @default "Search…" */
  searchPlaceholder?: string
  /** Shown when the search matches nothing. @default "No results found." */
  emptyText?: React.ReactNode
  /** Picking the selected option again clears it. @default false */
  clearable?: boolean
  disabled?: boolean
  size?: SelectTriggerSize
  id?: string
  name?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  /** Called when focus leaves the trigger for anywhere but the open list. */
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  className?: string
  classNames?: ComboboxClassNames
}

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      groups,
      value: valueProp,
      defaultValue = null,
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      placeholder = 'Select…',
      searchPlaceholder = 'Search…',
      emptyText = 'No results found.',
      clearable = false,
      disabled,
      size,
      name,
      className,
      classNames,
      onBlur,
      ...triggerProps
    },
    ref
  ) => {
    const [value, setValue] = useControllableState<string | null>({
      value: valueProp,
      defaultValue,
      onChange: onValueChange,
    })
    const [open, setOpen] = useControllableState({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    })
    const contentId = React.useId()
    const contentRef = React.useRef<HTMLDivElement>(null)

    const resolvedGroups: readonly ComboboxOptionGroup[] = groups ?? [{ options: options ?? [] }]
    const selected = resolvedGroups.flatMap((g) => g.options).find((o) => o.value === value)

    return (
      <PopoverRoot open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? contentId : undefined}
            disabled={disabled}
            data-placeholder={selected ? undefined : ''}
            className={cn(selectTriggerVariants({ size }), className, classNames?.trigger)}
            onBlur={(event) => {
              // Opening the list moves focus into its search box; that's not leaving.
              if (contentRef.current?.contains(event.relatedTarget as Node | null)) return
              onBlur?.(event)
            }}
            {...triggerProps}
          >
            <span className="flex min-w-0 items-center gap-2">
              {selected?.icon}
              <span className="truncate">{selected ? selected.label : placeholder}</span>
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-foreground-lighter"
              strokeWidth={1.5}
            />
          </button>
        </PopoverTrigger>
        {name !== undefined && <input type="hidden" name={name} value={value ?? ''} />}
        <PopoverContent
          ref={contentRef}
          id={contentId}
          align="start"
          sameWidthAsTrigger
          className={cn('p-0', classNames?.content)}
        >
          <CommandRoot>
            <CommandInput placeholder={searchPlaceholder} wrapperClassName="px-3" />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {resolvedGroups.map((group, index) => (
                <React.Fragment key={group.label ?? index}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.label}>
                    {group.options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        keywords={[option.label, ...(option.keywords ?? [])]}
                        disabled={option.disabled}
                        onSelect={() => {
                          setValue(clearable && option.value === value ? null : option.value)
                          setOpen(false)
                        }}
                        className={cn('gap-2', classNames?.item)}
                      >
                        {option.icon}
                        <span className="flex-1 truncate">{option.label}</span>
                        <Check
                          aria-hidden="true"
                          className={cn(
                            'h-4 w-4 shrink-0',
                            option.value === value ? 'opacity-100' : 'opacity-0'
                          )}
                          strokeWidth={1.5}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              ))}
            </CommandList>
          </CommandRoot>
        </PopoverContent>
      </PopoverRoot>
    )
  }
)
Combobox.displayName = 'Combobox'

export { Combobox }
