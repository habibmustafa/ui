import { MenubarHybrid } from './menubar'
import {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
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

export const Menubar = Object.assign(MenubarHybrid, {
  Root: MenubarRoot,
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
  Item: MenubarItem,
  CheckboxItem: MenubarCheckboxItem,
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  Label: MenubarLabel,
  Separator: MenubarSeparator,
  Shortcut: MenubarShortcut,
  Group: MenubarGroup,
  Portal: MenubarPortal,
  Sub: MenubarSub,
  SubTrigger: MenubarSubTrigger,
  SubContent: MenubarSubContent,
})

export {
  MenubarRoot,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarGroup,
  MenubarPortal,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
export type {
  MenubarRootProps,
  MenubarTriggerProps,
  MenubarContentProps,
  MenubarItemProps,
} from './menubar-parts'
export type { MenubarProps, MenubarMenuData, MenubarClassNames } from './menubar'
