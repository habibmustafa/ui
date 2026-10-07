---
'@habibmustafa/ui': patch
---

Two small fixes found while building the playground's Blocks.

- `Table`: the horizontal scroll container is now `position: relative`. An absolutely
  positioned child, such as the `sr-only` text of an icon-only header, used to escape the
  scroller's clipping and widen the whole page on narrow screens.
- `EmptyStatePresentational` renders a `<div>` instead of an `<aside>`. An empty state is
  not complementary content, and several of them on a page produced unnamed duplicate
  `complementary` landmarks.
