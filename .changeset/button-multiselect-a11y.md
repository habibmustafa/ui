---
"@habibmustafa/ui": patch
---

- `Button` no longer exposes a bogus `defaultVariants` prop (an upstream `cva` config
  slip that nested `defaultVariants` inside `variants`). It never did anything.
- `MultiSelector.Trigger`: chips can be removed from the keyboard — ← / → pick a chip
  (highlighted and announced), Backspace/Delete removes it. The trigger describes these
  keys to screen readers, and the pointer-only × is hidden from them (a button can't be
  nested in the trigger button).
