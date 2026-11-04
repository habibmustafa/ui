---
'@habibmustafa/ui': minor
---

Select, Combobox and MultiSelect (and `FormSelect`, `FormCombobox`, `FormMultiSelect`) read options of any shape: `valueExpr` / `displayExpr` name the fields (default `value` / `label`), and `getOptionValue` / `getOptionLabel` take functions that win over them. Values may be numbers as well as strings, and the callbacks return the original value. Types are generic over the option and value (`SelectProps<T, V>`); `SelectProps` is now a single type, and with `clearable` the value may be `null`.
