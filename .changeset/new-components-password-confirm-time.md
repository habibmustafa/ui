---
"@habibmustafa/ui": minor
---

New components:

- `PasswordInput` — show/hide toggle (a focusable button with `aria-pressed`) and an
  optional strength meter shown as text and colour; `getStrength` for your own scoring,
  `estimatePasswordStrength` exported.
- `ConfirmPopover` — a lightweight "Are you sure?" anchored to its trigger: labelled and
  described dialog, focus starts on Cancel, async `onConfirm` shows loading and blocks
  dismissal while pending, stays open on rejection, `destructive` styling.
- `TimePicker` — segmented time field (24h, or 12h + AM/PM, optional seconds) whose value
  is the `"HH:mm[:ss]"` 24-hour string `<input type="time">` uses; spinbutton segments
  with ↑/↓ (wrap, `minuteStep`), digit entry with auto-advance, ←/→ and Backspace.
