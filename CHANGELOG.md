# Changelog

## 0.3.0

### Minor Changes

- 2a9e2f1: react-hook-form support for every remaining form control.
  
  - New field wrappers: `FormNumberInput`, `FormPasswordInput`, `FormTimePicker`,
    `FormSlider`, `FormInputOTP`, `FormDateField`, `FormCombobox`, `FormMultiSelect`,
    `FormFileUpload` and `FormToggleGroup`. As with `FormInput`, each one is a single
    `name` + `label` line. The label names the control, a failed submit marks it
    `aria-invalid` and focuses it, and blur marks the field touched.
  - `useFormField()` returns `formLabelId`, and `FormLabel` renders with that id. Use it as
    `aria-labelledby` on controls that a `<label for>` can't name.
  - `TimePicker`: new `ref` and `onBlur` props. `ref` points at the group, and focusing the
    group moves focus to the first segment. `onBlur` fires only when focus leaves the whole
    field, including the clock dial.
  - `Slider`: `aria-describedby` and `aria-invalid` are now set on the thumbs (the focusable
    sliders), which show an invalid border.
  - `Combobox`: new `onBlur` prop. Moving focus into the open list doesn't count as a blur.
  - `MultiSelector` (options mode): new `ref` prop, and `aria-labelledby`,
    `aria-describedby`, `aria-invalid` and `onBlur` now go to the trigger button. Fixed: a
    `aria-describedby` passed by the consumer used to replace the keyboard hint for
    removing chips. Both are now kept.
  - `FileUpload`: `id` is now set on the Browse button, so `<label for>` names it. New
    `aria-labelledby`, `aria-invalid` (styles the drop zone) and `onBlur` props. Focusing
    the forwarded input ref now focuses Browse, and removing a file returns focus to
    Browse instead of the hidden input.
  - `DateField`: new `ref` prop (the input). `aria-labelledby` and `aria-describedby` are
    now typed.
  - `InputOTP` (slots mode): `ref` is now typed.
  - `Select`, `Combobox` and `MultiSelector` triggers now show destructive styling when
    `aria-invalid`.
- 24d19fd: New `DataTable` component on top of `Table`: search box (columns opt in with
  `searchValue`), click-to-sort headers cycling asc → desc → off (`sortValue`, with
  numeric-aware, stable sorting and empty values last), pagination via `Pagination`, and
  row selection with a page-level select-all. Works in memory, or server-side by
  controlling `search`/`sort`/`page` and passing `totalRows`. The `sortRows`,
  `filterRows`, `nextSort`, `parseSort` and `compareSortValues` helpers are exported.
- 6b9db46: New `FileUpload` component: drop zone with a Browse button, `accept` / `maxSize` /
  `maxFiles` validation (rejections reported via `onReject` and listed under the zone),
  a removable file list, single- or multi-file mode, and a real `<input type="file">`
  kept in sync with the selection so `name` works in plain form submits. The helpers
  `formatFileSize`, `fileMatchesAccept` and `validateFiles` are exported too.
- dc2fb38: New components:
  
  - `Menubar` — hybrid, Radix Menubar with DropdownMenu's styling. Props mode:
    `<Menubar menus={[{ key, label, items }]} />` where `items` is the same `MenuItem[]`
    DropdownMenu and ContextMenu take (items, separators, labels, groups, submenus,
    checkbox and radio items). Compound mode: `Menubar.Root/Menu/Trigger/Content/Item/…`.
  - `NavigationMenu` — hybrid, Radix NavigationMenu. Props mode: `items` of plain links,
    panels of links (title + description, one or two columns) or custom panel content.
    Compound mode: `NavigationMenu.Root/List/Item/Trigger/Content/Link/Indicator/Viewport`;
    `viewport={false}` positions each panel under its own trigger.
- 4e53ab5: New components:
  
  - `NumberInput` — numeric spinbutton built on `Input`: − / + buttons, `min`/`max`/`step`
    clamping (no float drift), ↑/↓ (Shift ×10), PageUp/PageDown, Home/End; typed text is
    committed on blur/Enter; `format` for display, `prefix` slot.
  - `Combobox` — searchable single-value select (Select-styled trigger, Popover + Command
    list) with `options`/`groups`, search `keywords`, `clearable` and a hidden form input
    via `name`.
  - `Stepper` — horizontal/vertical progress through steps; `onStepClick` makes completed
    steps clickable; step state is announced to screen readers.
- 5ad7e47: New components:
  
  - `Pagination` — hybrid. Props mode: `<Pagination totalPages page onPageChange />` with
    first/last page, `siblingCount` pages around the current one and ellipses (constant
    width while paging); `getHref` renders real links instead of buttons. Compound mode:
    `Pagination.Root/Content/Item/Link/Previous/Next/Ellipsis`. `getPaginationRange` is
    exported for custom layouts.
  - `Slider` — Radix slider in `small`/`medium`/`large`; two values make a range, and
    `thumbLabels` names each thumb.
  - `Kbd` / `KbdGroup` — keyboard key hints.
- 927f4df: New components:
  
  - `PasswordInput` — show/hide toggle (a focusable button with `aria-pressed`) and an
    optional strength meter shown as text and colour; `getStrength` for your own scoring,
    `estimatePasswordStrength` exported.
  - `ConfirmPopover` — a lightweight "Are you sure?" anchored to its trigger: labelled and
    described dialog, focus starts on Cancel, async `onConfirm` shows loading and blocks
    dismissal while pending, stays open on rejection, `destructive` styling.
  - `TimePicker` — segmented time field (24h, or 12h + AM/PM, optional seconds) whose value
    is the `"HH:mm[:ss]"` 24-hour string `<input type="time">` uses; spinbutton segments
    with ↑/↓ (wrap, `minuteStep`), digit entry with auto-advance, ←/→ and Backspace.
- 24ed1c4: New components:
  
  - `Spinner` — loading indicator in three sizes; a polite `status` with a label, or
    `decorative` when the busy state is announced elsewhere.
  - `ScrollArea` — Radix ScrollArea with thin themed scrollbars (vertical, horizontal or
    both) and a keyboard-focusable, optionally named viewport.
  - `CopyButton` — copy a string or a (sync/async) function's result; check-mark and
    "Copied" feedback, screen-reader announcement, icon-only or labelled.
  - `Banner` — full-width announcement strip (default, brand, warning, destructive) with
    icon, title, action and optional dismiss; a landmark named by its title.
- f59dae8: - `NumberInput`: new `mode` prop, `"numeric"` (whole numbers) or `"decimal"`, plus
    `decimalPlaces` for the decimal mode. Only number characters can be entered: letters,
    a second separator or a misplaced `-` are dropped as you type or paste, `,` is accepted
    as the decimal separator, and `-` is only allowed when `min` is negative. The default
    mode is `"decimal"` when `step` or `min` has decimals, otherwise `"numeric"`. With
    `format`, the field shows the plain number while focused, so formatted text such as
    `1,234.50` can be edited.
  - `TimePicker`: the clock dial is more compact (200px instead of 232px).
- 70e5392: **Breaking:** `react-day-picker` 9 → 10. `Calendar` (and
  `DatePicker`'s `calendarProps`) no longer accept the long-deprecated `initialFocus`;
  use `autoFocus` instead.
- 70e5392: **Breaking:** `recharts` 2 → 3. `ChartTooltipContent` /
  `ChartLegendContent` keep their props; their `payload`/`label` types now come from
  Recharts 3 (`TooltipContentProps`, `LegendPayload`). Custom chart code written against
  Recharts 2 may need the [Recharts 3 migration](https://github.com/recharts/recharts/wiki/3.x-migration-guide).
- 5e87941: Softer, smoother motion across the library (new `styles/motion.css`):
  
  - One set of easings and durations: enters decelerate over ~220ms
    (`cubic-bezier(0.22, 1, 0.36, 1)`), exits accelerate away in ~150ms; every
    `transition-*` without its own timing uses a 200ms soft ease instead of 150ms
    ease-in-out. New theme tokens: `ease-soft-out`, `ease-soft-in`, `ease-soft-in-out`,
    `animate-backdrop-show/hide`.
  - Smaller movement: overlays scale from 97% and travel 4px (were 95% / 8px).
  - `Dialog` / `AlertDialog`: the backdrop now fades in (it appeared instantly and slid on
    close) and the panel rises and settles; `Sheet`'s backdrop fades in too.
  - `Tooltip` / `HoverCard` fade from fully transparent and animate out.
  - `Accordion` and collapsible heights animate over ~250ms with a symmetric soft curve.
  - `Calendar` / `DatePicker`: months slide a short way and cross-fade when navigating
    (react-day-picker `animate`; skipped during keyboard navigation). Switching the
    DatePicker between day, month and year views cross-fades and resizes smoothly instead
    of collapsing for a frame.
  - `prefers-reduced-motion: reduce` keeps fades but removes movement and scale.
- 70e5392: **Breaking:** `sonner` 1 → 2. `SonnerToaster` renders sonner 2's
  `<Toaster>`; if your app calls `toast()` from its own `sonner` install, upgrade it to
  2.x too so both share one toast store (otherwise toasts are never shown).
- f1ba4d4: Theme generator.
  
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
- 1a0ea16: `TimePicker`: the clock icon is now a button that opens an analog clock dial, in the
  style of Material UI's time clock — pick hours, then minutes (then seconds), by clicking
  or dragging on the face; 24-hour mode uses an inner ring for 13–23 and 00, 12-hour mode
  adds AM/PM toggles. The dial is a keyboard-operable slider (arrows, PageUp/PageDown,
  Home/End, Enter to continue). Pass `clock={false}` to keep the plain icon.
- 7052de8: `toast` is now exported next to `SonnerToaster`, so apps call it from the same sonner
  instance the toaster renders, without installing `sonner` separately.
  
  README: the theming section now states exactly what the input variables drive.
  `--primary-hue`, `--surface-hue` and `--chroma` control background, text, border and
  `primary`. The brand scale (`--brand-*`) has its own values for each theme.

### Patch Changes

- a56955d: - `Button` no longer exposes a bogus `defaultVariants` prop (an upstream `cva` config
    slip that nested `defaultVariants` inside `variants`). It never did anything.
  - `MultiSelector.Trigger`: chips can be removed from the keyboard — ← / → pick a chip
    (highlighted and announced), Backspace/Delete removes it. The trigger describes these
    keys to screen readers, and the pointer-only × is hidden from them (a button can't be
    nested in the trigger button).
- 70c9332: `Calendar` (and `DatePicker`) day buttons now include the day number exactly as shown in
  their accessible name — "Monday, September 7, 2026" instead of react-day-picker's
  "Monday, September 7th, 2026" — so voice-control users can say "click 7" (WCAG 2.5.3).
  Locales whose full date already contains the plain number keep their own format; a
  `labels.labelDayButton` you pass still takes precedence.
  
  Outside days (previous/next month) are no longer dimmed with an extra `opacity-50` on
  top of the muted text colour: they're clickable, and the stack measured 2.1:1 (light) /
  2.5:1 (dark); they're now 5.4:1+ and still visibly muted.
- 24d19fd: `Checkbox` now renders `checked="indeterminate"` properly: filled like the checked
  state with a dash instead of an invisible check mark.
- 6b0e16b: Source reorganisation; there are no API changes, because everything is still imported
  from `@habibmustafa/ui`. `Combobox`, `MultiSelector`, `DatePicker`, `FileUpload` and
  `DataInput` moved from `fragments/` to `atoms/forms`, `ShimmeringLoader` to
  `atoms/feedback` and `TextLink` to `atoms/navigation`. These are single controls, like
  `TimePicker` and `Select`. `fragments/` now holds only ready-made compositions of atoms.
  The rule is described in the README, and `tests/structure.test.ts` enforces it.
- c528e0a: Accessibility:
  
  - `CodeBlock`'s light theme uses darker versions of its syntax colours; the originals
    measured 1.5–3.9:1 on light backgrounds, now all ≥ 4.5:1 (dark theme unchanged).
  - `ErrorDisplay` and `StatusCode` (warning) use neutral text on the warning background
    (the warning text tokens can't reach 4.5:1 there); `StatusCode` (error) uses
    `destructive-600`, which passes in both themes.
  - `Checkbox` keeps its 16px box but has a 24×24px click/tap target (WCAG 2.5.8).
- 70e5392: Fixed: `FormCheckbox` and `FormSwitch` had no `FormItem`, so every one of them got the
  id `undefined-form-item` (duplicate ids with more than one on a page) and their
  validation message was never rendered. Both now render inside a `FormItem` with a
  `FormMessage`.
- 70e5392: Fixed: form validation errors never appeared. `useFormField` read react-hook-form's
  `formState` proxy straight from context; in the React Compiler build that read was
  memoised away, so `FormMessage`, `FormLabel`'s error colour and `aria-invalid` never
  updated. It now subscribes with `useFormState`.
- 70e5392: `framer-motion` 11 → 14 (used internally for `FormMessage` and the DatePicker view
  cross-fade; no API change).
- 24d19fd: Fixed: an `Input` with `prefix`/`suffix` rendered its value and placeholder at the
  browser's default 16px instead of the field's size, because the inner `<input>` didn't
  inherit the wrapper's font size.
- 756e6fd: The light theme no longer looks washed out. Fixes measured in the browser against WCAG:
  
  - Brand fills (switch, slider, checked states) were the dark-mode bright green
    (L 0.76) at **2:1** on white. They now use a darker light-mode fill at 3.3:1
    (WCAG 1.4.11). The primary button fill and its border are stronger too.
  - Warning text went from **2.9:1** to 4.75:1 (`--warning-lightness` 0.68 → 0.56).
  - Dark theme: destructive text went from **3.4:1** to 4.5:1 on cards
    (`--destructive-lightness` 0.55 → 0.62).
  - Light canvas 0.995 → 0.985 so cards separate from the page. Light `--contrast`
    went from 0.53 to 0.6, and borders and input outlines get a higher floor in light
    mode (input outline 1.4 → 1.8:1, dividers 1.2 → 1.4:1). Secondary and helper text
    rise to 11.4:1 and 7.3:1.
  - `createTheme()` follows the same rules: light fills are capped at L 0.63, and light
    contrast is offset by +0.1. The default config still reproduces the shipped
    palette exactly.
- f07d756: Fixes found while clearing every lint warning:
  
  - `Row` ignored its documented `scrollBehavior` prop; `"auto"` now jumps without the
    sliding transition.
  - `RadioGroupCard.Item` / `RadioGroupStacked.Item` accepted `image` but never rendered it.
  - `TimestampInfo` re-created its tooltip rows on every render, remounting them and
    dropping the "Copied!" state; `FormItemLayout` did the same with its label contents.
  - `DateField`, the DatePicker calendar, `ThemeToggle` and `Sidebar`'s mobile detection
    no longer sync state from effects (no extra render / stale frame).
- ea75ead: Smoother modal motion.
  
  - `Dialog`, `AlertDialog` and `Sheet` backdrops no longer use `backdrop-blur`. The blur
    was recomputed every frame under the opening panel, which dropped the open animation
    to about 30fps (9–11 frames in 300ms, compared with a steady 20 without it). The dim
    is now slightly deeper instead.
  - `Dialog` and `AlertDialog`: the panel no longer seems to arrive late. The dim moved
    to the overlay's `::before`, and only that fades in, so the panel's own fade-in is no
    longer multiplied by the backdrop's (the panel used to show at 10% opacity while each
    layer was at 32%).
  - `AlertDialog` now plays its close animation. A wrapper `<div>` inside its portal made
    Radix unmount the dialog immediately.
- 70e5392: `MultiSelector.Trigger` is now a complete combobox: `aria-label` from `label`,
  `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls` pointing at the open
  content.
- 70e5392: `Select` (props mode with `options`/`groups`) now forwards `id`, `aria-label`,
  `aria-labelledby`, `aria-describedby` and `aria-invalid` to its trigger. Previously
  they went to Radix's Root, which renders no element, so a `<label htmlFor>` — and
  `FormSelect`'s own label, description and error state — never reached the control.

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
