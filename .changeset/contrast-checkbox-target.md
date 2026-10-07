---
"@habibmustafa/ui": patch
---

Accessibility:

- `CodeBlock`'s light theme uses darker versions of its syntax colours; the originals
  measured 1.5–3.9:1 on light backgrounds, now all ≥ 4.5:1 (dark theme unchanged).
- `ErrorDisplay` and `StatusCode` (warning) use neutral text on the warning background
  (the warning text tokens can't reach 4.5:1 there); `StatusCode` (error) uses
  `destructive-600`, which passes in both themes.
- `Checkbox` keeps its 16px box but has a 24×24px click/tap target (WCAG 2.5.8).
