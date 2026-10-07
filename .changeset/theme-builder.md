---
"@habibmustafa/ui": minor
---

Theme generator.

- `createTheme(config)` turns a small config (`brand`, `accent`, `neutral: { hue, tint }`,
  `contrast`, `status: { warningHue, destructiveHue }`, `radius`, `font: { sans, mono }`)
  into CSS custom properties for both modes. Each brand, secondary, warning and
  destructive scale is rebuilt from a profile measured off the shipped palette (the
  lightness and relative chroma of every step, per mode). The default config therefore
  reproduces the current colours, and any other colour keeps the same light/dark
  contrast structure. Only the keys you pass are emitted. Every colour is mapped into
  sRGB.
- `themeToCss(config | tokens)` outputs the theme as a stylesheet. Its selectors use
  `:root` (`:root.light`, `:root[data-theme='dark']`), so they win regardless of
  stylesheet load order.
- `ThemeProvider` has a new `tokens` prop, and the new `<ThemeStyle tokens>` applies a
  theme without a provider.
- `THEME_PRESETS` (7 starting points), plus colour helpers `parseColor`, `toHex`,
  `toOklchCss` and `contrastRatio` (WCAG).
- `Slider`: `aria-valuetext` now goes on the thumbs (the `role="slider"` elements), like
  `aria-label`, `aria-describedby` and `aria-invalid`.

The playground has a new theme builder at `/theme` with a live preview, a contrast
check, presets, CSS/JSON/code export, import and shareable links.
