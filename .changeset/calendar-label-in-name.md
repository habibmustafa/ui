---
"@habibmustafa/ui": patch
---

`Calendar` (and `DatePicker`) day buttons now include the day number exactly as shown in
their accessible name — "Monday, September 7, 2026" instead of react-day-picker's
"Monday, September 7th, 2026" — so voice-control users can say "click 7" (WCAG 2.5.3).
Locales whose full date already contains the plain number keep their own format; a
`labels.labelDayButton` you pass still takes precedence.
