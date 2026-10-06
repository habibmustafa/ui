# Changelog

## Unreleased

- `Select` (props mode with `options`/`groups`) now forwards `id`, `aria-label`,
  `aria-labelledby`, `aria-describedby` and `aria-invalid` to its trigger. Previously
  they went to Radix's Root, which renders no element, so a `<label htmlFor>` — and
  `FormSelect`'s own label, description and error state — never reached the control.
- `MultiSelector.Trigger` is now a complete combobox: `aria-label` from `label`,
  `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls` pointing at the open
  content.

## 0.2.0

- Fixed a build bug: `vite.config.ts`'s `external` list only matched bare package
  names, so deep imports (`react-syntax-highlighter/dist/esm/languages/*`,
  `dayjs/plugin/*`, `react/compiler-runtime`) were bundled straight into `dist/`
  instead of staying external — `dist/node_modules/...` shipped inside the npm
  tarball. `external` is now a prefix match, so this class of import can't recur.
- Stopped the playground's `public/` assets (favicon, logo) from being copied into
  the library build output (`build.copyPublicDir: false`).
- Tarball size: 419.5 kB → 314.6 kB; unpacked: 1.6 MB → 1.3 MB; files: 441 → 311.

## 0.1.0

Initial release.
