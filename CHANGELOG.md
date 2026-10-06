# Changelog

## Unreleased

- Fixed: form validation errors never appeared. `useFormField` read react-hook-form's
  `formState` proxy straight from context; in the React Compiler build that read was
  memoised away, so `FormMessage`, `FormLabel`'s error colour and `aria-invalid` never
  updated. It now subscribes with `useFormState`.
- Fixed: `FormCheckbox` and `FormSwitch` had no `FormItem`, so every one of them got the
  id `undefined-form-item` (duplicate ids with more than one on a page) and their
  validation message was never rendered. Both now render inside a `FormItem` with a
  `FormMessage`.
- **Breaking (dependencies):** `sonner` 1 → 2. `SonnerToaster` renders sonner 2's
  `<Toaster>`; if your app calls `toast()` from its own `sonner` install, upgrade it to
  2.x too so both share one toast store (otherwise toasts are never shown).
- **Breaking (dependencies):** `recharts` 2 → 3. `ChartTooltipContent` /
  `ChartLegendContent` keep their props; their `payload`/`label` types now come from
  Recharts 3 (`TooltipContentProps`, `LegendPayload`). Custom chart code written against
  Recharts 2 may need the [Recharts 3 migration](https://github.com/recharts/recharts/wiki/3.x-migration-guide).
- **Breaking (dependencies):** `react-day-picker` 9 → 10. `Calendar` (and
  `DatePicker`'s `calendarProps`) no longer accept the long-deprecated `initialFocus`;
  use `autoFocus` instead.
- `framer-motion` 11 → 14 (used internally for `FormMessage` and the DatePicker view
  cross-fade; no API change).
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
