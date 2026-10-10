---
'@habibmustafa/ui': minor
---

New theme tokens replace hardcoded colors:
- `--primary-solid-foreground`, `--primary-solid-hover`, `--primary-solid-border` and `--primary-solid-border-hover` for the dark primary Button, Stepper and TimePicker.
- `--backdrop` for every modal dim. The Sheet backdrop now matches Dialog and Drawer.
- `--scroll-shadow` for table scroll edges.

CodeBlock now takes its colors from the `--code-token-*` variables, the same palette as the docs' highlighter. It follows the theme through CSS, so it no longer needs a `ThemeProvider`. Light comments and strings are darkened to reach WCAG AA. `codeBlockTheme` is exported; `monokaiCustomTheme` is deprecated.
