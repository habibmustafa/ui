import type * as React from 'react'

import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu-parts'

export type MenuItem =
  | {
      type?: 'item'
      key: string
      label: React.ReactNode
      icon?: React.ReactNode
      shortcut?: string
      disabled?: boolean
      onSelect?: () => void
    }
  | { type: 'separator'; key: string }
  | { type: 'label'; key: string; label: React.ReactNode }
  | { type: 'group'; key: string; label?: React.ReactNode; items: MenuItem[] }
  | { type: 'submenu'; key: string; label: React.ReactNode; items: MenuItem[] }
  | {
      type: 'checkbox'
      key: string
      label: React.ReactNode
      checked: boolean
      onCheckedChange: (checked: boolean) => void
      disabled?: boolean
    }
  | {
      type: 'radio-group'
      key: string
      value: string
      onValueChange: (value: string) => void
      items: { value: string; label: React.ReactNode; icon?: React.ReactNode }[]
    }

function renderMenuItems(items: readonly MenuItem[]): React.ReactNode {
  return items.map((item) => {
    switch (item.type) {
      case 'separator':
        return <DropdownMenuSeparator key={item.key} />
      case 'label':
        return <DropdownMenuLabel key={item.key}>{item.label}</DropdownMenuLabel>
      case 'group':
        return (
          <DropdownMenuGroup key={item.key}>
            {item.label != null && <DropdownMenuLabel>{item.label}</DropdownMenuLabel>}
            {renderMenuItems(item.items)}
          </DropdownMenuGroup>
        )
      case 'submenu':
        return (
          <DropdownMenuSub key={item.key}>
            <DropdownMenuSubTrigger>{item.label}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>{renderMenuItems(item.items)}</DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )
      case 'checkbox':
        return (
          <DropdownMenuCheckboxItem
            key={item.key}
            checked={item.checked}
            onCheckedChange={item.onCheckedChange}
            disabled={item.disabled}
          >
            {item.label}
          </DropdownMenuCheckboxItem>
        )
      case 'radio-group':
        return (
          <DropdownMenuRadioGroup
            key={item.key}
            value={item.value}
            onValueChange={item.onValueChange}
          >
            {item.items.map((radio) => (
              <DropdownMenuRadioItem key={radio.value} value={radio.value}>
                {radio.icon}
                {radio.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )
      default:
        return (
          <DropdownMenuItem key={item.key} disabled={item.disabled} onSelect={item.onSelect}>
            {item.icon}
            {item.label}
            {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        )
    }
  })
}

type RootProps = React.ComponentProps<typeof DropdownMenuRoot>
type DropdownMenuContentProps = React.ComponentProps<typeof DropdownMenuContent>

type DropdownMenuItemsProps = Omit<RootProps, 'children'> & {
  /** Element that opens the menu, rendered via DropdownMenuTrigger asChild. */
  trigger: React.ReactElement
  items: readonly MenuItem[]
  className?: string
  align?: DropdownMenuContentProps['align']
  children?: never
}

type DropdownMenuCompoundProps = RootProps & { items?: never }

export type DropdownMenuProps = DropdownMenuItemsProps | DropdownMenuCompoundProps

export function DropdownMenuHybrid(props: DropdownMenuProps) {
  if (props.items === undefined) {
    return <DropdownMenuRoot {...props} />
  }

  const { trigger, items, className, align, ...rootProps } = props

  return (
    <DropdownMenuRoot {...rootProps}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        {renderMenuItems(items)}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}
