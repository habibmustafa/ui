---
"@habibmustafa/ui": minor
---

- `NumberInput`: new `mode` prop, `"numeric"` (whole numbers) or `"decimal"`, plus
  `decimalPlaces` for the decimal mode. Only number characters can be entered: letters,
  a second separator or a misplaced `-` are dropped as you type or paste, `,` is accepted
  as the decimal separator, and `-` is only allowed when `min` is negative. The default
  mode is `"decimal"` when `step` or `min` has decimals, otherwise `"numeric"`. With
  `format`, the field shows the plain number while focused, so formatted text such as
  `1,234.50` can be edited.
- `TimePicker`: the clock dial is more compact (200px instead of 232px).
