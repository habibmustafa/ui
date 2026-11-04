---
'@habibmustafa/ui': minor
---

Calendar, DatePicker and `SidebarTrigger` now use the library's own `Button` instead of a second, private shadcn-style button. `SidebarTrigger` takes `Button`'s props, so `variant="ghost"`/`size="icon"` become `variant="text"`/`size="tiny"`. DataInput's copy button is now a `CopyButton` (1.5s copied state, announced to screen readers), and CodeBlock clears its copied timer on unmount.
