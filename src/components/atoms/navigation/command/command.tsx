import { Fragment } from 'react'
import type * as React from 'react'
import type { Dialog as DialogPrimitive } from 'radix-ui'

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandRoot,
  CommandSeparator,
  CommandShortcut,
} from './command-parts'
import { DialogContent, DialogRoot } from '../../overlay/dialog'
import { useLabels } from '../../../../providers/locale-provider'

export interface CommandItemData {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  value?: string
  onSelect?: () => void
}

export interface CommandGroupData {
  key: string
  heading?: React.ReactNode
  items: readonly CommandItemData[]
}

export interface CommandClassNames {
  input?: string
  list?: string
  group?: string
  item?: string
}

type RootProps = React.ComponentProps<typeof CommandRoot>

type CommandGroupsProps = Omit<RootProps, 'children'> & {
  groups: readonly CommandGroupData[]
  placeholder?: string
  /** @default "No results found.", from LocaleProvider */
  emptyText?: React.ReactNode
  classNames?: CommandClassNames
  children?: never
}

type CommandCompoundProps = RootProps & { groups?: never }

export type CommandProps = CommandGroupsProps | CommandCompoundProps

export function CommandHybrid(props: CommandProps) {
  const labels = useLabels()
  if (props.groups === undefined) {
    return <CommandRoot {...props} />
  }

  const {
    groups,
    placeholder,
    emptyText = labels.noResults,
    classNames,
    ...rootProps
  } = props

  return (
    <CommandRoot {...rootProps}>
      <CommandInput placeholder={placeholder} className={classNames?.input} />
      <CommandList className={classNames?.list}>
        <CommandEmpty>{emptyText}</CommandEmpty>
        {groups.map((group, index) => (
          <Fragment key={group.key}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading} className={classNames?.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.key}
                  value={item.value}
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                  className={classNames?.item}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          </Fragment>
        ))}
      </CommandList>
    </CommandRoot>
  )
}

const COMMAND_DIALOG_ROOT_CLASSNAME =
  '**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-foreground-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'

export interface CommandDialogProps extends DialogPrimitive.DialogProps {
  /** Renders groups via the same API as props-driven Command, instead of `children`. */
  groups?: readonly CommandGroupData[]
  placeholder?: string
  /** @default "No results found.", from LocaleProvider */
  emptyText?: React.ReactNode
  classNames?: CommandClassNames
}

export function CommandDialog({
  children,
  groups,
  placeholder,
  emptyText,
  classNames,
  ...props
}: CommandDialogProps) {
  return (
    <DialogRoot {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        {groups === undefined ? (
          <CommandRoot className={COMMAND_DIALOG_ROOT_CLASSNAME}>{children}</CommandRoot>
        ) : (
          <CommandHybrid
            className={COMMAND_DIALOG_ROOT_CLASSNAME}
            groups={groups}
            placeholder={placeholder}
            emptyText={emptyText}
            classNames={classNames}
          />
        )}
      </DialogContent>
    </DialogRoot>
  )
}
