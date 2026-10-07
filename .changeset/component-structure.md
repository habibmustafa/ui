---
"@habibmustafa/ui": patch
---

Source reorganisation; there are no API changes, because everything is still imported
from `@habibmustafa/ui`. `Combobox`, `MultiSelector`, `DatePicker`, `FileUpload` and
`DataInput` moved from `fragments/` to `atoms/forms`, `ShimmeringLoader` to
`atoms/feedback` and `TextLink` to `atoms/navigation`. These are single controls, like
`TimePicker` and `Select`. `fragments/` now holds only ready-made compositions of atoms.
The rule is described in the README, and `tests/structure.test.ts` enforces it.
