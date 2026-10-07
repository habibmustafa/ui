---
'@habibmustafa/ui': minor
---

Touch targets and translatable labels.

- On a coarse pointer (a finger), buttons, tabs, switches, checkboxes, radios and
  `role="button"` elements get a 44px hit area. An invisible `::after` grows each small
  control in the direction it falls short, so nothing changes visually or moves in the
  layout and mouse users are unaffected. It sits in `@layer base` behind `:where()`, so a
  utility class on a component wins, and controls that draw their own `after:` pseudo-element
  are left alone.
- New `LocaleProvider` and `useLabels()` for the words the newer components speak: the
  carousel's button and slide names, the image lightbox, mentions' empty state, the date
  range placeholder and Clear, the table of contents label, Rating's value text, the
  Countdown's time left and others. Labels that depend on a number or a name are functions,
  so plurals and word order stay with the translator. Any subset can be overridden, providers
  nest, and a component's own prop (`closeLabel`, `placeholder`, `aria-label`, ...) still wins.
  Without a provider everything stays English.
