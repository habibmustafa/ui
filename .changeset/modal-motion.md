---
"@habibmustafa/ui": patch
---

Smoother modal motion.

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
