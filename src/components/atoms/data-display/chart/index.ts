import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from './chart'
import { Chart as ChartProps } from './chart-props'

export const Chart = Object.assign(ChartProps, {
  Container: ChartContainer,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
  Style: ChartStyle,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
})

export * from './chart'
export type { ChartProps, ChartSeries } from './chart-props'
