---
"@habibmustafa/ui": patch
---

Fixes found while clearing every lint warning:

- `Row` ignored its documented `scrollBehavior` prop; `"auto"` now jumps without the
  sliding transition.
- `RadioGroupCard.Item` / `RadioGroupStacked.Item` accepted `image` but never rendered it.
- `TimestampInfo` re-created its tooltip rows on every render, remounting them and
  dropping the "Copied!" state; `FormItemLayout` did the same with its label contents.
- `DateField`, the DatePicker calendar, `ThemeToggle` and `Sidebar`'s mobile detection
  no longer sync state from effects (no extra render / stale frame).
