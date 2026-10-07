---
"@habibmustafa/ui": minor
---

react-hook-form support for every remaining form control.

- New field wrappers: `FormNumberInput`, `FormPasswordInput`, `FormTimePicker`,
  `FormSlider`, `FormInputOTP`, `FormDateField`, `FormCombobox`, `FormMultiSelect`,
  `FormFileUpload` and `FormToggleGroup`. As with `FormInput`, each one is a single
  `name` + `label` line. The label names the control, a failed submit marks it
  `aria-invalid` and focuses it, and blur marks the field touched.
- `useFormField()` returns `formLabelId`, and `FormLabel` renders with that id. Use it as
  `aria-labelledby` on controls that a `<label for>` can't name.
- `TimePicker`: new `ref` and `onBlur` props. `ref` points at the group, and focusing the
  group moves focus to the first segment. `onBlur` fires only when focus leaves the whole
  field, including the clock dial.
- `Slider`: `aria-describedby` and `aria-invalid` are now set on the thumbs (the focusable
  sliders), which show an invalid border.
- `Combobox`: new `onBlur` prop. Moving focus into the open list doesn't count as a blur.
- `MultiSelector` (options mode): new `ref` prop, and `aria-labelledby`,
  `aria-describedby`, `aria-invalid` and `onBlur` now go to the trigger button. Fixed: a
  `aria-describedby` passed by the consumer used to replace the keyboard hint for
  removing chips. Both are now kept.
- `FileUpload`: `id` is now set on the Browse button, so `<label for>` names it. New
  `aria-labelledby`, `aria-invalid` (styles the drop zone) and `onBlur` props. Focusing
  the forwarded input ref now focuses Browse, and removing a file returns focus to
  Browse instead of the hidden input.
- `DateField`: new `ref` prop (the input). `aria-labelledby` and `aria-describedby` are
  now typed.
- `InputOTP` (slots mode): `ref` is now typed.
- `Select`, `Combobox` and `MultiSelector` triggers now show destructive styling when
  `aria-invalid`.
