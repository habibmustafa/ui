---
'@habibmustafa/ui': minor
---

The props forms now cover more layouts, so fewer screens need the compound parts. `Tabs` takes `layout="inline"` (triggers keep their natural width), `listLabel`, `toolbar` (controls beside the list), and per-item `triggerProps` and `contentClassName`. `Dialog` and `Sheet` take `bare`: only `children` render, with `title` kept as a visually hidden name. `ToggleGroup` items take `className`. `DropdownMenu` radio items take `icon`. `Command.Dialog` takes `title` (a visually hidden name, default "Command palette") and `classNames.root` to swap its roomy default root classes. `ThemeToggle`, `InfoTooltip` and `TimestampInfo` are built on the props forms; their output is unchanged.
