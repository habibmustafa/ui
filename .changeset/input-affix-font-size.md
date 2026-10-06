---
"@habibmustafa/ui": patch
---

Fixed: an `Input` with `prefix`/`suffix` rendered its value and placeholder at the
browser's default 16px instead of the field's size, because the inner `<input>` didn't
inherit the wrapper's font size.
