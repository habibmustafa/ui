---
"@habibmustafa/ui": minor
---

New components:

- `Pagination` — hybrid. Props mode: `<Pagination totalPages page onPageChange />` with
  first/last page, `siblingCount` pages around the current one and ellipses (constant
  width while paging); `getHref` renders real links instead of buttons. Compound mode:
  `Pagination.Root/Content/Item/Link/Previous/Next/Ellipsis`. `getPaginationRange` is
  exported for custom layouts.
- `Slider` — Radix slider in `small`/`medium`/`large`; two values make a range, and
  `thumbLabels` names each thumb.
- `Kbd` / `KbdGroup` — keyboard key hints.
