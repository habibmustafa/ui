---
"@habibmustafa/ui": patch
---

Fixed: `FormCheckbox` and `FormSwitch` had no `FormItem`, so every one of them got the
id `undefined-form-item` (duplicate ids with more than one on a page) and their
validation message was never rendered. Both now render inside a `FormItem` with a
`FormMessage`.
