---
"@habibmustafa/ui": minor
---

New components:

- `NumberInput` — numeric spinbutton built on `Input`: − / + buttons, `min`/`max`/`step`
  clamping (no float drift), ↑/↓ (Shift ×10), PageUp/PageDown, Home/End; typed text is
  committed on blur/Enter; `format` for display, `prefix` slot.
- `Combobox` — searchable single-value select (Select-styled trigger, Popover + Command
  list) with `options`/`groups`, search `keywords`, `clearable` and a hidden form input
  via `name`.
- `Stepper` — horizontal/vertical progress through steps; `onStepClick` makes completed
  steps clickable; step state is announced to screen readers.
