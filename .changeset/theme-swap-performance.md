---
'@habibmustafa/ui': patch
---

Theme changes are much cheaper. `ThemeStyle` (and `ThemeProvider`'s `tokens`) and the
light/dark switch now apply a new theme with CSS transitions briefly off: before, every
element's own `transition-colors` animated the swap and the browser restyled the whole page on
each frame of it, so changing a brand color blocked the page for most of a second on a
mid-range laptop.

`ThemeProvider` also no longer writes the server's guess (light) to `<html>` while hydrating.
A dark page used to flip to light and straight back on load, which could flash and forced two
full restyles.
