/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for Menubar — Strategy A,
 * discriminator `menus`. Each menu takes the same `MenuItem[]` DropdownMenu and
 * ContextMenu use, so one item definition renders in any of the three.
 */
import type * as React from 'react'

import type { MenuItem } from '../../overlay/dropdown-menu'
import {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarRoot,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './menubar-parts'

function renderMenuItems(items: readonly MenuItem[]): React.ReactNode {
  return items.map((item) => {
    switch (item.type) {
      case 'separator':
        return <MenubarSeparator key={item.key} />
      case 'label':
        return <MenubarLabel key={item.key}>{item.label}</MenubarLabel>
      case 'group':
        return (
          <MenubarGroup key={item.key}>
            {item.label != null && <MenubarLabel>{item.label}</MenubarLabel>}
            {renderMenuItems(item.items)}
          </MenubarGroup>
        )
      case 'submenu':
        return (
          <MenubarSub key={item.key}>
            <MenubarSubTrigger>{item.label}</MenubarSubTrigger>
            <MenubarSubContent>{renderMenuItems(item.items)}</MenubarSubContent>
          </MenubarSub>
        )
      case 'checkbox':
        return (
          <MenubarCheckboxItem
            key={item.key}
            checked={item.checked}
            onCheckedChange={item.onCheckedChange}
            disabled={item.disabled}
          >
            {item.label}
          </MenubarCheckboxItem>
        )
      case 'radio-group':
        return (
          <MenubarRadioGroup key={item.key} value={item.value} onValueChange={item.onValueChange}>
            {item.items.map((radio) => (
              <MenubarRadioItem key={radio.value} value={radio.value}>
                {radio.label}
              </MenubarRadioItem>
            ))}
          </MenubarRadioGroup>
        )
      default:
        return (
          <MenubarItem key={item.key} disabled={item.disabled} onSelect={item.onSelect}>
            {item.icon}
            {item.label}
            {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
          </MenubarItem>
        )
    }
  })
}

export interface MenubarMenuData {
  key: string
  label: React.ReactNode
  items: readonly MenuItem[]
  disabled?: boolean
}

export interface MenubarClassNames {
  trigger?: string
  content?: string
}

type RootProps = React.ComponentProps<typeof MenubarRoot>

type MenubarMenusProps = Omit<RootProps, 'children'> & {
  menus: readonly MenubarMenuData[]
  classNames?: MenubarClassNames
  children?: never
}

type MenubarCompoundProps = RootProps & { menus?: never }

export type MenubarProps = MenubarMenusProps | MenubarCompoundProps

export function MenubarHybrid(props: MenubarProps) {
  if (props.menus === undefined) {
    return <MenubarRoot {...props} />
  }

  const { menus, classNames, ...rootProps } = props

  return (
    <MenubarRoot {...rootProps}>
      {menus.map((menu) => (
        <MenubarMenu key={menu.key}>
          <MenubarTrigger disabled={menu.disabled} className={classNames?.trigger}>
            {menu.label}
          </MenubarTrigger>
          <MenubarContent className={classNames?.content}>{renderMenuItems(menu.items)}</MenubarContent>
        </MenubarMenu>
      ))}
    </MenubarRoot>
  )
}
