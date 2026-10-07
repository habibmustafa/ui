---
'@habibmustafa/ui': minor
---

Sixteen new components.

- `Carousel`: dependency-free scroll-snap slides. Props mode (`items`, with `arrows={null}` /
  `dots={null}` to hide parts) and compound mode (`Carousel.Root` / `Content` / `Item` /
  `Previous` / `Next` / `Dots`). Supports `loop`, `autoPlay` (pauses on hover and focus, and
  for reduced-motion users), vertical orientation, a controlled `index`, arrow-key
  navigation and several slides per view with `slidesPerView` and `gap`.
- `Rating`: star rating exposed as a radio group (arrow keys, Home/End, roving tabindex).
  `allowHalf`, `allowClear`, `readOnly`, `disabled`, `size`, a custom `renderIcon` and a
  `name` for native forms. New `FormRating` field wrapper for react-hook-form.
- `Statistic`: a headline number with `prefix`/`suffix`, `precision` and locale formatting,
  `loading` skeleton and an optional count-up `animated` mode that respects reduced motion
  and keeps the final value for screen readers.
- `Countdown`: counts down to a deadline through `Statistic`. `format` takes `D`, `H`, `m`,
  `s`, `S` tokens (omitted larger units fold into the next one, `[literal]` text is kept),
  with `paused`, `onChange` and `onFinish`. `role="timer"` with a stable label. The
  `formatCountdown` helper is exported.
- `Image`: an `<img>` with a loading skeleton, a `fallback` for failed or missing sources,
  `aspectRatio`/`fit`/`radius`, and an optional `preview` lightbox (Radix Dialog) that can
  point at a larger file.
- `CircularProgress`: ring-shaped progress. Determinate (`value`/`max`, `role="progressbar"`)
  or, without a `value`, an indeterminate spinner. `size`, `thickness`, `tone`, `showValue`
  or any centred `children`.
- `Gauge`: a dial for a value in a range (`role="meter"`). `angle` for a half circle or an
  open ring, `thresholds` to colour the arc by value, `formatValue`, `label` and `showRange`.
- `DateRangePicker`: a `{ from, to }` picker in one line: two months, `presets`, `minDate` /
  `maxDate`, a Clear button and closing once the range is complete. Built on `DatePicker`,
  whose "With range" example stays as the hand-assembled version. New `FormDateRangePicker`
  field wrapper for react-hook-form.
- `Mentions`: a textarea that suggests options after a trigger character (`@` by default,
  several allowed). Focus stays in the textarea; `aria-activedescendant` points at the
  highlighted suggestion, arrow keys move, Enter or Tab picks, Escape closes. Custom
  `filterOption`, `separator`, `onSelect`, disabled options and a not-found message.
- `Descriptions`: label/value pairs as a `<dl>` with `columns`, per-item `span`, a vertical
  layout, `bordered` grid, a title with `extra` actions and a placeholder for empty values.
- `Result`: a full-section outcome with a status icon, title, description and `extra`
  actions. `success`, `error`, `warning`, `info`, plus `403`, `404` and `500` pages.
- `TableOfContents`: on-this-page navigation with scroll-spy, nested levels, smooth
  scrolling and hash updates. Watches the window or a `scrollRoot`; `activeId` can be
  controlled.
- `ScrollProgress`: a thin bar that fills with page or container scroll. `fixed`, `absolute`
  or `static` placement, top or bottom edge. Uses a transform, so scrolling never lays out.
- `Marquee`: an endlessly scrolling strip, horizontal or vertical, with `reverse`,
  `pauseOnHover`, `fade` and `gap`. Copies are `aria-hidden`; honours reduced motion.
- `QRCode`: a dependency-free QR encoder rendered as one SVG path. Byte mode, versions
  1-10, error-correction levels L/M/Q/H (up to 271 bytes at L). Black on white by default so
  it stays scannable in any theme. `qrCapacity` is exported; input that does not fit
  renders `fallback` and calls `onError`.
- `VirtualList`: renders only the visible rows. Fixed or per-row `itemHeight`, `overscan`,
  `onEndReached` for infinite loading, `aria-posinset` / `aria-setsize` on every row.
