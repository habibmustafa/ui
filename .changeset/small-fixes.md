---
'@habibmustafa/ui': patch
---

Fixes:
- DatePicker's invalid state has a red (destructive) focus outline instead of an amber one.
- ThemeToggle no longer sets a fixed `id`, so two toggles on a page don't clash and Radix pairs the menu with its trigger again.
- `SonnerToaster`'s `theme` prop is optional: it follows the surrounding `ThemeProvider`, or `"system"` without one.
- GlassPanel no longer throws when there is no `ThemeProvider`.
