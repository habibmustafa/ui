---
'@habibmustafa/ui': patch
---

TimePicker text and border now match DateField/DatePicker. The `read-only` input styles (lighter text, button border) were also hitting the `<div>` wrappers of TimePicker and of `Input` with `prefix`/`suffix`, because CSS `:read-only` matches any non-editable element. They now apply only to real read-only inputs.
