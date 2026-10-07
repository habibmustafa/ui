---
"@habibmustafa/ui": patch
---

`Select` (props mode with `options`/`groups`) now forwards `id`, `aria-label`,
`aria-labelledby`, `aria-describedby` and `aria-invalid` to its trigger. Previously
they went to Radix's Root, which renders no element, so a `<label htmlFor>` — and
`FormSelect`'s own label, description and error state — never reached the control.
