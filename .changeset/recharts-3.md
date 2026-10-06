---
"@habibmustafa/ui": minor
---

**Breaking:** `recharts` 2 → 3. `ChartTooltipContent` /
`ChartLegendContent` keep their props; their `payload`/`label` types now come from
Recharts 3 (`TooltipContentProps`, `LegendPayload`). Custom chart code written against
Recharts 2 may need the [Recharts 3 migration](https://github.com/recharts/recharts/wiki/3.x-migration-guide).
