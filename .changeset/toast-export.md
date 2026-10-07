---
"@habibmustafa/ui": minor
---

`toast` is now exported next to `SonnerToaster`, so apps call it from the same sonner
instance the toaster renders, without installing `sonner` separately.

README: the theming section now states exactly what the input variables drive.
`--primary-hue`, `--surface-hue` and `--chroma` control background, text, border and
`primary`. The brand scale (`--brand-*`) has its own values for each theme.
