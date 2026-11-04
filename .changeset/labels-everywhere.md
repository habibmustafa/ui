---
'@habibmustafa/ui': minor
---

`LocaleProvider` now covers every built-in word in the library, not only the newer components. That includes:
- Dialog/Sheet close, Confirm/Cancel
- Pagination
- DatePicker and TimePicker
- Breadcrumb and Sidebar toggles
- Command, FileUpload, DataTable, Row, MetricCard, TimestampInfo and ThemeToggle
- Admonition titles
- Copy/Copied, Spinner, Banner, PasswordInput, NumberInput and Stepper

Props such as `confirmText` or `emptyText` still win over the provider. The empty-state text is now "No results found." everywhere, which changes DataTable's (was "No results.") and MultiSelect's (no trailing period). "Toggle Sidebar" is now "Toggle sidebar".
