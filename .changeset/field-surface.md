---
'@habibmustafa/ui': patch
---

Select, Combobox, MultiSelect, DatePicker (button mode) and DateRangePicker triggers now share Input's surface: `bg-field`, `border-control` and the `hover:border-control-hover` hover. Previously they used a raised background (`bg-control-raised`), a transparent background, or a stronger border.
