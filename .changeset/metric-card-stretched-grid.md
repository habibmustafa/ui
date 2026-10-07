---
'@habibmustafa/ui': patch
---

`MetricCard`: the content no longer claims `h-full`. Inside a CSS grid row that stretches the
card, that made the content as tall as the whole card and pushed the sparkline below it, where
the card's `overflow-hidden` clipped it. The sparkline now stays inside the card in any layout.
