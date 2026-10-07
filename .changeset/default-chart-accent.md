---
'@habibmustafa/ui': minor
---

The default chart series 2 now follows the default accent (violet) instead of staying blue.
`--chart-2`, `--chart-2-fill` and, through `--chart-in`, the "in" series use exactly the colours
`createTheme({ accent })` generates for the default accent, in light and dark. Before, the
default theme only matched the theme builder's accent swatch once a colour was changed. A test
keeps `charts.css` and the generator in step.
