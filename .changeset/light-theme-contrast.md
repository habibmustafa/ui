---
"@habibmustafa/ui": patch
---

The light theme no longer looks washed out. Fixes measured in the browser against WCAG:

- Brand fills (switch, slider, checked states) were the dark-mode bright green
  (L 0.76) at **2:1** on white. They now use a darker light-mode fill at 3.3:1
  (WCAG 1.4.11). The primary button fill and its border are stronger too.
- Warning text went from **2.9:1** to 4.75:1 (`--warning-lightness` 0.68 → 0.56).
- Dark theme: destructive text went from **3.4:1** to 4.5:1 on cards
  (`--destructive-lightness` 0.55 → 0.62).
- Light canvas 0.995 → 0.985 so cards separate from the page. Light `--contrast`
  went from 0.53 to 0.6, and borders and input outlines get a higher floor in light
  mode (input outline 1.4 → 1.8:1, dividers 1.2 → 1.4:1). Secondary and helper text
  rise to 11.4:1 and 7.3:1.
- `createTheme()` follows the same rules: light fills are capped at L 0.63, and light
  contrast is offset by +0.1. The default config still reproduces the shipped
  palette exactly.
