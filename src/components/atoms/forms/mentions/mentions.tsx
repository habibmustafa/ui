'use client'

import * as React from 'react'

import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'
import { PopoverAnchor, PopoverContent, PopoverRoot } from '../../overlay/popover'
import { Textarea, type TextareaProps } from '../textarea'

/*
 * A textarea that suggests people (or anything else) when you type a trigger character
 * such as `@`. Focus never leaves the textarea; the highlighted suggestion is exposed with
 * aria-activedescendant and the list with aria-controls. (ARIA does not allow
 * role="combobox" on a <textarea>, so it stays a textbox.) Arrow keys move, Enter
 * or Tab picks, Escape closes. Picking replaces `@que` with `@value ` and puts the caret
 * after it. The list opens under the field rather than at the caret, which keeps it
 * readable and avoids measuring text.
 */

export interface MentionOption {
  /** Inserted into the text after the trigger, e.g. `ada` becomes `@ada`. */
  value: string
  /** Shown in the list. Defaults to `value`. */
  label?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

export interface MentionsProps
  extends Omit<TextareaProps, 'value' | 'defaultValue' | 'onChange' | 'prefix' | 'onSelect'> {
  options: readonly MentionOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Trigger character(s). @default "@" */
  prefix?: string | readonly string[]
  /** Text inserted after the mention. @default " " */
  separator?: string
  /** Custom matching; the default is a case-insensitive "contains" on value and label text. */
  filterOption?: (query: string, option: MentionOption, prefix: string) => boolean
  onSelect?: (option: MentionOption, prefix: string) => void
  /** Shown when nothing matches. @default "No matches" */
  notFoundContent?: React.ReactNode
  /** Classes for the wrapper; `className` goes to the textarea. */
  containerClassName?: string
}

interface Trigger {
  /** Index of the trigger character in the text. */
  start: number
  prefix: string
  query: string
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function findTrigger(text: string, caret: number, prefixes: readonly string[]): Trigger | null {
  const before = text.slice(0, caret)
  const group = prefixes.map(escapeRe).join('|')
  const match = new RegExp(`(?:^|\\s)(${group})(\\S*)$`).exec(before)
  if (!match) return null
  const [whole, prefix, query] = match
  return { start: match.index + whole.length - prefix.length - query.length, prefix, query }
}

const labelText = (option: MentionOption) =>
  typeof option.label === 'string' ? option.label : option.value

const Mentions = React.forwardRef<HTMLTextAreaElement, MentionsProps>(
  (
    {
      options,
      value: valueProp,
      defaultValue = '',
      onValueChange,
      prefix = '@',
      separator = ' ',
      filterOption,
      onSelect,
      notFoundContent = 'No matches',
      containerClassName,
      className,
      onKeyDown,
      onKeyUp,
      onClick,
      onBlur,
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState({
      value: valueProp,
      defaultValue,
      onChange: onValueChange,
    })
    const prefixes = typeof prefix === 'string' ? [prefix] : prefix

    const [trigger, setTrigger] = React.useState<Trigger | null>(null)
    const [active, setActive] = React.useState(0)
    // After Escape the list stays shut until the trigger changes (a new `@` or query).
    const [dismissed, setDismissed] = React.useState<string | null>(null)

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const setRefs = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
    const pendingCaret = React.useRef<number | null>(null)
    const listId = React.useId()

    const matches = React.useMemo(() => {
      if (!trigger) return []
      const test =
        filterOption ??
        ((query: string, option: MentionOption) => {
          const q = query.toLowerCase()
          return option.value.toLowerCase().includes(q) || labelText(option).toLowerCase().includes(q)
        })
      return options.filter((option) => test(trigger.query, option, trigger.prefix))
    }, [trigger, options, filterOption])

    const triggerKey = trigger ? `${trigger.start}:${trigger.prefix}:${trigger.query}` : null
    const open = trigger !== null && dismissed !== triggerKey && !disabled && !readOnly

    React.useLayoutEffect(() => {
      if (pendingCaret.current !== null && textareaRef.current) {
        const caret = pendingCaret.current
        pendingCaret.current = null
        textareaRef.current.setSelectionRange(caret, caret)
      }
    })

    const sync = (el: HTMLTextAreaElement) => {
      const next = findTrigger(el.value, el.selectionStart ?? el.value.length, prefixes)
      setTrigger((prev) => {
        if (next?.query !== prev?.query || next?.start !== prev?.start) setActive(0)
        return next
      })
    }

    const choose = (option: MentionOption) => {
      if (!trigger || option.disabled) return
      const el = textareaRef.current
      const caret = el?.selectionStart ?? value.length
      const head = value.slice(0, trigger.start) + trigger.prefix + option.value + separator
      pendingCaret.current = head.length
      setValue(head + value.slice(caret))
      setTrigger(null)
      onSelect?.(option, trigger.prefix)
    }

    const move = (direction: 1 | -1) => {
      if (matches.length === 0) return
      let next = active
      for (let i = 0; i < matches.length; i++) {
        next = (next + direction + matches.length) % matches.length
        if (!matches[next].disabled) break
      }
      setActive(next)
    }

    const activeOption = open ? matches[active] : undefined

    return (
      <PopoverRoot open={open}>
        <PopoverAnchor asChild>
          <div className={cn('relative w-full', containerClassName)}>
        <Textarea
          {...props}
          ref={setRefs}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={activeOption ? `${listId}-${active}` : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            sync(event.target)
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented || !open) return
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              move(1)
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              move(-1)
            } else if ((event.key === 'Enter' || event.key === 'Tab') && activeOption) {
              event.preventDefault()
              choose(activeOption)
            } else if (event.key === 'Escape') {
              event.preventDefault()
              setDismissed(triggerKey)
            }
          }}
          // Arrow keys and clicks move the caret without a change event.
          onKeyUp={(event) => {
            onKeyUp?.(event)
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End')
              sync(event.currentTarget)
          }}
          onClick={(event) => {
            onClick?.(event)
            sync(event.currentTarget)
          }}
          onBlur={(event) => {
            onBlur?.(event)
            setTrigger(null)
          }}
        />
          </div>
        </PopoverAnchor>
        {/*
          The list lives in a portal (the library's Popover), so a parent with overflow
          hidden, a dialog or a scroll area can't clip it, and it flips above the field when
          there is no room below. It is never given focus: the textarea keeps it.
        */}
        <PopoverContent
          align="start"
          sideOffset={4}
          role="presentation"
          className="max-h-60 overflow-auto p-1 text-sm"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          // The popover's own Escape handler would swallow the key before the textarea sees it.
          onEscapeKeyDown={(event) => {
            event.preventDefault()
            setDismissed(triggerKey)
          }}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          // Keeps focus in the textarea when the list is clicked.
          onMouseDown={(event) => event.preventDefault()}
        >
          <ul id={listId} role="listbox" aria-label="Suggestions">
            {matches.length === 0 ? (
              <li role="presentation" className="px-2 py-1.5 text-foreground-lighter">
                {notFoundContent}
              </li>
            ) : (
              matches.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  aria-disabled={option.disabled || undefined}
                  onMouseEnter={() => !option.disabled && setActive(index)}
                  onClick={() => choose(option)}
                  className={cn(
                    'flex cursor-pointer flex-col rounded-xs px-2 py-1.5',
                    index === active && 'bg-overlay-hover',
                    option.disabled && 'pointer-events-none opacity-50'
                  )}
                >
                  <span className="text-foreground">{option.label ?? option.value}</span>
                  {option.description != null && (
                    <span className="text-xs text-foreground-lighter">{option.description}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </PopoverContent>
      </PopoverRoot>
    )
  }
)
Mentions.displayName = 'Mentions'

export { Mentions }
