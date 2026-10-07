---
"@habibmustafa/ui": minor
---

New components:

- `Menubar` — hybrid, Radix Menubar with DropdownMenu's styling. Props mode:
  `<Menubar menus={[{ key, label, items }]} />` where `items` is the same `MenuItem[]`
  DropdownMenu and ContextMenu take (items, separators, labels, groups, submenus,
  checkbox and radio items). Compound mode: `Menubar.Root/Menu/Trigger/Content/Item/…`.
- `NavigationMenu` — hybrid, Radix NavigationMenu. Props mode: `items` of plain links,
  panels of links (title + description, one or two columns) or custom panel content.
  Compound mode: `NavigationMenu.Root/List/Item/Trigger/Content/Link/Indicator/Viewport`;
  `viewport={false}` positions each panel under its own trigger.
