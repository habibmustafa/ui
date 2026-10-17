'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'

import {
  Command,
} from '../../navigation/command'
import { Popover } from '../../overlay/popover'
import { selectTriggerVariants, type SelectTriggerSize } from '../select'
import { FieldClear } from '../select/field-clear'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { readOptions, type OptionAccessors, type OptionValue } from '../../../../lib/options'
import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'

/*
 * Single-value, searchable select: a Select-styled trigger opening a Popover with a
 * cmdk Command list (shadcn/ui's Combobox recipe). MultiSelect covers several values;
 * this is the one-value counterpart with the same `options`/`groups` shape as Select.
 */

export interface ComboboxOption<V extends OptionValue = string> {
  value: V
  label: string
  /** Extra search terms, e.g. a country code. */
  keywords?: string[]
  disabled?: boolean
  icon?: React.ReactNode
}

export interface ComboboxOptionGroup<T = ComboboxOption> {
  label?: string
  options: readonly T[]
}

export interface ComboboxClassNames {
  trigger?: string
  content?: string
  item?: string
}

export interface ComboboxProps<T = ComboboxOption, V extends OptionValue = string>
  extends OptionAccessors<T, string> {
  options?: readonly T[]
  /** Grouped options; used instead of `options` when both are given. */
  groups?: readonly ComboboxOptionGroup<T>[]
  /** Selected value (a string or a number), controlled; `null` for none. */
  value?: V | null
  /** @default null */
  defaultValue?: V | null
  onValueChange?: (value: V | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Trigger text when nothing is selected. @default "Select…" */
  placeholder?: React.ReactNode
  /** @default "Search…" */
  searchPlaceholder?: string
  /** Shown when the search matches nothing. @default "No results found.", from LocaleProvider */
  emptyText?: React.ReactNode
  /**
   * Shows a × and clears on Backspace/Delete while a value is selected; picking the selected
   * option again clears it too. @default false
   */
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
  /** The trigger button. */
  ref?: React.Ref<HTMLButtonElement>
}

function Combobox<T = ComboboxOption, V extends OptionValue = string>({
    options,
    groups,
    valueExpr,
    displayExpr,
    getOptionValue,
    getOptionLabel,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyText: emptyTextProp,
    clearable = false,
    disabled,
    size,
    name,
    className,
    classNames,
    onBlur,
  ref,
  ...triggerProps
}: ComboboxProps<T, V>) {
  const labels = useLabels()
  const emptyText = emptyTextProp ?? labels.noResults
  const [value, setValue] = useControllableState<V | null>({
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

  const accessors = { valueExpr, displayExpr, getOptionValue, getOptionLabel }
  const resolvedGroups = (groups ?? [{ label: undefined, options: options ?? [] }]).map((group) => ({
    label: group.label,
    options: readOptions<any, string>(group.options, accessors),
  }))
  const selectedKey = value == null ? null : String(value)
  const selected = resolvedGroups.flatMap((g) => g.options).find((o) => o.key === selectedKey)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
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
          onKeyDown={(event) => {
            if (clearable && value != null && !disabled && !event.defaultPrevented && (event.key === 'Backspace' || event.key === 'Delete')) {
              event.preventDefault()
              setValue(null)
            }
          }}
          {...triggerProps}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.option.icon}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
          {clearable && value != null && !disabled && <FieldClear onClear={() => setValue(null)} />}
          <ChevronsUpDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-foreground-lighter"
            strokeWidth={1.5}
          />
        </button>
      </Popover.Trigger>
      {name !== undefined && <input type="hidden" name={name} value={value == null ? '' : String(value)} />}
      <Popover.Content
        ref={contentRef}
        id={contentId}
        align="start"
        sameWidthAsTrigger
        className={cn('p-0', classNames?.content)}
      >
        <Command.Root>
          <Command.Input placeholder={searchPlaceholder} wrapperClassName="px-3" />
          <Command.List>
            <Command.Empty>{emptyText}</Command.Empty>
            {resolvedGroups.map((group, index) => (
              <React.Fragment key={group.label ?? index}>
                {index > 0 && <Command.Separator />}
                <Command.Group heading={group.label}>
                  {group.options.map((option) => (
                    <Command.Item
                      key={option.key}
                      value={option.key}
                      keywords={[option.label, ...(option.option.keywords ?? [])]}
                      disabled={option.disabled}
                      onSelect={() => {
                        setValue(clearable && option.key === selectedKey ? null : (option.value as V))
                        setOpen(false)
                      }}
                      className={cn('gap-2', classNames?.item)}
                    >
                      {option.option.icon}
                      <span className="flex-1 truncate">{option.label}</span>
                      <Check
                        aria-hidden="true"
                        className={cn(
                          'h-4 w-4 shrink-0',
                          option.key === selectedKey ? 'opacity-100' : 'opacity-0'
                        )}
                        strokeWidth={1.5}
                      />
                    </Command.Item>
                  ))}
                </Command.Group>
              </React.Fragment>
            ))}
          </Command.List>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  )
}

export { Combobox }
