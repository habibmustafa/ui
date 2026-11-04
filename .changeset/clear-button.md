---
'@habibmustafa/ui': minor
---

Select, Combobox and MultiSelect take `clearable` (default `false`): a × next to the trailing icon while there is a value. Select and Combobox clear to `null` and MultiSelect to `[]`. The × is for pointer users and doesn't open the list. On Select and Combobox, Backspace or Delete on the focused trigger clears too. `FormSelect` accepts `clearable`; `FormCombobox` and `FormMultiSelect` pass it through. On Combobox, `clearable` now also shows the × (it still lets picking the selected option again clear it).

`DateRangePicker`'s `clearable` (default `true`) now also shows a × on the trigger that resets the range in one click, next to the Clear button in the popover. A form-style reset of it (value back to `undefined`) no longer leaves the previous range showing until you reset twice: `useControllableState` now tracks the last value even while controlled.

Also: `Rating` no longer flashes the old value while you click a star, and the stars you pick pop in a short wave (skipped under `prefers-reduced-motion`). `DatePicker` now marks its field invalid inside a `FormControl` (it ignored `aria-invalid`), and its `id` and `aria-describedby` reach the field. Invalid fields get stronger `bg-invalid-bg` and `border-invalid-border` tokens, which are now readable on the light theme.
