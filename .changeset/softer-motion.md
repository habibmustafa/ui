---
"@habibmustafa/ui": minor
---

Softer, smoother motion across the library (new `styles/motion.css`):

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
