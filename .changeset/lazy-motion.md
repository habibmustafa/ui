---
'@habibmustafa/ui': patch
---

`Form` (the animated `FormMessage`) and `DatePicker` (the day/month/year view switch) now use
`LazyMotion` with the `domAnimation` feature set and the `m` component instead of the full
`motion` component. The animations are unchanged; the framer-motion code a consumer ships for
these two components drops from about 123 kB to about 77 kB (raw, before gzip).
