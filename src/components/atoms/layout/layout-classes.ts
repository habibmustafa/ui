/*
 * Internal class tables for the ui-specific layout primitives.
 *
 * Every utility is written out literally: Tailwind only emits CSS for class names it can
 * read in the source, so an interpolated `gap-${n}` would silently produce nothing.
 * scripts/check-classes.mjs full-scans this file, so a typo here fails `npm run verify`.
 */
import type {
  Breakpoint,
  ColSpan,
  ColStart,
  FlexAlign,
  FlexBasis,
  FlexDirection,
  FlexJustify,
  GridColumns,
  GridFlow,
  GridRows,
  Grow,
  Order,
  Responsive,
  RowSpan,
  Shrink,
  Space,
} from './layout-types'

type BreakpointMaps<T extends string | number> = Record<Breakpoint, Record<T, string>>

const BREAKPOINTS: readonly Breakpoint[] = ['base', 'sm', 'md', 'lg']

/** Look a value up in a base-only table. */
export function baseClass<T extends string | number>(
  value: T | undefined,
  map: Record<T, string>,
): string | undefined {
  return value === undefined ? undefined : map[value]
}

/**
 * Look a (possibly per-breakpoint) value up in `maps`. Never builds a class name — it only
 * returns literals, which is what keeps Tailwind's scanner able to see them.
 */
export function responsiveClasses<T extends string | number>(
  value: Responsive<T> | undefined,
  maps: BreakpointMaps<T>,
): (string | undefined)[] {
  if (value === undefined) return []
  if (typeof value === 'object') {
    return BREAKPOINTS.map((breakpoint) => {
      const step = value[breakpoint]
      return step === undefined ? undefined : maps[breakpoint][step]
    })
  }
  return [maps.base[value]]
}

// --- Box spacing (base only — nest a responsive wrapper from className when needed) ---

export const PADDING: Record<Space, string> = { none: 'p-0', xs: 'p-1', sm: 'p-2', md: 'p-4', lg: 'p-6', xl: 'p-8', '2xl': 'p-12' }
export const PADDING_X: Record<Space, string> = { none: 'px-0', xs: 'px-1', sm: 'px-2', md: 'px-4', lg: 'px-6', xl: 'px-8', '2xl': 'px-12' }
export const PADDING_Y: Record<Space, string> = { none: 'py-0', xs: 'py-1', sm: 'py-2', md: 'py-4', lg: 'py-6', xl: 'py-8', '2xl': 'py-12' }
export const PADDING_TOP: Record<Space, string> = { none: 'pt-0', xs: 'pt-1', sm: 'pt-2', md: 'pt-4', lg: 'pt-6', xl: 'pt-8', '2xl': 'pt-12' }
export const PADDING_RIGHT: Record<Space, string> = { none: 'pr-0', xs: 'pr-1', sm: 'pr-2', md: 'pr-4', lg: 'pr-6', xl: 'pr-8', '2xl': 'pr-12' }
export const PADDING_BOTTOM: Record<Space, string> = { none: 'pb-0', xs: 'pb-1', sm: 'pb-2', md: 'pb-4', lg: 'pb-6', xl: 'pb-8', '2xl': 'pb-12' }
export const PADDING_LEFT: Record<Space, string> = { none: 'pl-0', xs: 'pl-1', sm: 'pl-2', md: 'pl-4', lg: 'pl-6', xl: 'pl-8', '2xl': 'pl-12' }
export const MARGIN: Record<Space, string> = { none: 'm-0', xs: 'm-1', sm: 'm-2', md: 'm-4', lg: 'm-6', xl: 'm-8', '2xl': 'm-12' }
export const MARGIN_X: Record<Space, string> = { none: 'mx-0', xs: 'mx-1', sm: 'mx-2', md: 'mx-4', lg: 'mx-6', xl: 'mx-8', '2xl': 'mx-12' }
export const MARGIN_Y: Record<Space, string> = { none: 'my-0', xs: 'my-1', sm: 'my-2', md: 'my-4', lg: 'my-6', xl: 'my-8', '2xl': 'my-12' }
export const MARGIN_TOP: Record<Space, string> = { none: 'mt-0', xs: 'mt-1', sm: 'mt-2', md: 'mt-4', lg: 'mt-6', xl: 'mt-8', '2xl': 'mt-12' }
export const MARGIN_RIGHT: Record<Space, string> = { none: 'mr-0', xs: 'mr-1', sm: 'mr-2', md: 'mr-4', lg: 'mr-6', xl: 'mr-8', '2xl': 'mr-12' }
export const MARGIN_BOTTOM: Record<Space, string> = { none: 'mb-0', xs: 'mb-1', sm: 'mb-2', md: 'mb-4', lg: 'mb-6', xl: 'mb-8', '2xl': 'mb-12' }
export const MARGIN_LEFT: Record<Space, string> = { none: 'ml-0', xs: 'ml-1', sm: 'ml-2', md: 'ml-4', lg: 'ml-6', xl: 'ml-8', '2xl': 'ml-12' }

// --- Responsive tables ---

export const GAP: BreakpointMaps<Space> = {
  base: { none: 'gap-0', xs: 'gap-1', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8', '2xl': 'gap-12' },
  sm: { none: 'sm:gap-0', xs: 'sm:gap-1', sm: 'sm:gap-2', md: 'sm:gap-4', lg: 'sm:gap-6', xl: 'sm:gap-8', '2xl': 'sm:gap-12' },
  md: { none: 'md:gap-0', xs: 'md:gap-1', sm: 'md:gap-2', md: 'md:gap-4', lg: 'md:gap-6', xl: 'md:gap-8', '2xl': 'md:gap-12' },
  lg: { none: 'lg:gap-0', xs: 'lg:gap-1', sm: 'lg:gap-2', md: 'lg:gap-4', lg: 'lg:gap-6', xl: 'lg:gap-8', '2xl': 'lg:gap-12' },
}

export const GAP_X: BreakpointMaps<Space> = {
  base: { none: 'gap-x-0', xs: 'gap-x-1', sm: 'gap-x-2', md: 'gap-x-4', lg: 'gap-x-6', xl: 'gap-x-8', '2xl': 'gap-x-12' },
  sm: { none: 'sm:gap-x-0', xs: 'sm:gap-x-1', sm: 'sm:gap-x-2', md: 'sm:gap-x-4', lg: 'sm:gap-x-6', xl: 'sm:gap-x-8', '2xl': 'sm:gap-x-12' },
  md: { none: 'md:gap-x-0', xs: 'md:gap-x-1', sm: 'md:gap-x-2', md: 'md:gap-x-4', lg: 'md:gap-x-6', xl: 'md:gap-x-8', '2xl': 'md:gap-x-12' },
  lg: { none: 'lg:gap-x-0', xs: 'lg:gap-x-1', sm: 'lg:gap-x-2', md: 'lg:gap-x-4', lg: 'lg:gap-x-6', xl: 'lg:gap-x-8', '2xl': 'lg:gap-x-12' },
}

export const GAP_Y: BreakpointMaps<Space> = {
  base: { none: 'gap-y-0', xs: 'gap-y-1', sm: 'gap-y-2', md: 'gap-y-4', lg: 'gap-y-6', xl: 'gap-y-8', '2xl': 'gap-y-12' },
  sm: { none: 'sm:gap-y-0', xs: 'sm:gap-y-1', sm: 'sm:gap-y-2', md: 'sm:gap-y-4', lg: 'sm:gap-y-6', xl: 'sm:gap-y-8', '2xl': 'sm:gap-y-12' },
  md: { none: 'md:gap-y-0', xs: 'md:gap-y-1', sm: 'md:gap-y-2', md: 'md:gap-y-4', lg: 'md:gap-y-6', xl: 'md:gap-y-8', '2xl': 'md:gap-y-12' },
  lg: { none: 'lg:gap-y-0', xs: 'lg:gap-y-1', sm: 'lg:gap-y-2', md: 'lg:gap-y-4', lg: 'lg:gap-y-6', xl: 'lg:gap-y-8', '2xl': 'lg:gap-y-12' },
}

/** Horizontal padding used by Container's responsive `padding` prop. */
export const PADDING_X_RESPONSIVE: BreakpointMaps<Space> = {
  base: { none: 'px-0', xs: 'px-1', sm: 'px-2', md: 'px-4', lg: 'px-6', xl: 'px-8', '2xl': 'px-12' },
  sm: { none: 'sm:px-0', xs: 'sm:px-1', sm: 'sm:px-2', md: 'sm:px-4', lg: 'sm:px-6', xl: 'sm:px-8', '2xl': 'sm:px-12' },
  md: { none: 'md:px-0', xs: 'md:px-1', sm: 'md:px-2', md: 'md:px-4', lg: 'md:px-6', xl: 'md:px-8', '2xl': 'md:px-12' },
  lg: { none: 'lg:px-0', xs: 'lg:px-1', sm: 'lg:px-2', md: 'lg:px-4', lg: 'lg:px-6', xl: 'lg:px-8', '2xl': 'lg:px-12' },
}

export const GRID_COLUMNS: BreakpointMaps<GridColumns> = {
  base: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 7: 'grid-cols-7', 8: 'grid-cols-8', 9: 'grid-cols-9', 10: 'grid-cols-10', 11: 'grid-cols-11', 12: 'grid-cols-12' },
  sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6', 7: 'sm:grid-cols-7', 8: 'sm:grid-cols-8', 9: 'sm:grid-cols-9', 10: 'sm:grid-cols-10', 11: 'sm:grid-cols-11', 12: 'sm:grid-cols-12' },
  md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6', 7: 'md:grid-cols-7', 8: 'md:grid-cols-8', 9: 'md:grid-cols-9', 10: 'md:grid-cols-10', 11: 'md:grid-cols-11', 12: 'md:grid-cols-12' },
  lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 7: 'lg:grid-cols-7', 8: 'lg:grid-cols-8', 9: 'lg:grid-cols-9', 10: 'lg:grid-cols-10', 11: 'lg:grid-cols-11', 12: 'lg:grid-cols-12' },
}

export const FLEX_DIRECTION: BreakpointMaps<FlexDirection> = {
  base: { row: 'flex-row', 'row-reverse': 'flex-row-reverse', column: 'flex-col', 'column-reverse': 'flex-col-reverse' },
  sm: { row: 'sm:flex-row', 'row-reverse': 'sm:flex-row-reverse', column: 'sm:flex-col', 'column-reverse': 'sm:flex-col-reverse' },
  md: { row: 'md:flex-row', 'row-reverse': 'md:flex-row-reverse', column: 'md:flex-col', 'column-reverse': 'md:flex-col-reverse' },
  lg: { row: 'lg:flex-row', 'row-reverse': 'lg:flex-row-reverse', column: 'lg:flex-col', 'column-reverse': 'lg:flex-col-reverse' },
}

export const ALIGN: BreakpointMaps<FlexAlign> = {
  base: { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' },
  sm: { start: 'sm:items-start', center: 'sm:items-center', end: 'sm:items-end', stretch: 'sm:items-stretch', baseline: 'sm:items-baseline' },
  md: { start: 'md:items-start', center: 'md:items-center', end: 'md:items-end', stretch: 'md:items-stretch', baseline: 'md:items-baseline' },
  lg: { start: 'lg:items-start', center: 'lg:items-center', end: 'lg:items-end', stretch: 'lg:items-stretch', baseline: 'lg:items-baseline' },
}

export const JUSTIFY: BreakpointMaps<FlexJustify> = {
  base: { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly' },
  sm: { start: 'sm:justify-start', center: 'sm:justify-center', end: 'sm:justify-end', between: 'sm:justify-between', around: 'sm:justify-around', evenly: 'sm:justify-evenly' },
  md: { start: 'md:justify-start', center: 'md:justify-center', end: 'md:justify-end', between: 'md:justify-between', around: 'md:justify-around', evenly: 'md:justify-evenly' },
  lg: { start: 'lg:justify-start', center: 'lg:justify-center', end: 'lg:justify-end', between: 'lg:justify-between', around: 'lg:justify-around', evenly: 'lg:justify-evenly' },
}

// --- Base-only tables ---

export const GRID_ROWS: Record<GridRows, string> = { 1: 'grid-rows-1', 2: 'grid-rows-2', 3: 'grid-rows-3', 4: 'grid-rows-4', 5: 'grid-rows-5', 6: 'grid-rows-6' }
export const GRID_FLOW: Record<GridFlow, string> = { row: 'grid-flow-row', column: 'grid-flow-col', dense: 'grid-flow-dense', 'row-dense': 'grid-flow-row-dense', 'column-dense': 'grid-flow-col-dense' }

export const COL_SPAN: Record<ColSpan, string> = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8', 9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12' }
export const COL_START: Record<ColStart, string> = { 1: 'col-start-1', 2: 'col-start-2', 3: 'col-start-3', 4: 'col-start-4', 5: 'col-start-5', 6: 'col-start-6', 7: 'col-start-7', 8: 'col-start-8', 9: 'col-start-9', 10: 'col-start-10', 11: 'col-start-11', 12: 'col-start-12' }
export const ROW_SPAN: Record<RowSpan, string> = { 1: 'row-span-1', 2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4', 5: 'row-span-5', 6: 'row-span-6' }
export const ORDER: Record<Order, string> = { 1: 'order-1', 2: 'order-2', 3: 'order-3', 4: 'order-4', 5: 'order-5', 6: 'order-6', 7: 'order-7', 8: 'order-8', 9: 'order-9', 10: 'order-10', 11: 'order-11', 12: 'order-12', first: 'order-first', last: 'order-last', none: 'order-none' }
export const GROW: Record<Grow, string> = { 0: 'grow-0', 1: 'grow' }
export const SHRINK: Record<Shrink, string> = { 0: 'shrink-0', 1: 'shrink' }
export const BASIS: Record<FlexBasis, string> = { auto: 'basis-auto', full: 'basis-full', '0': 'basis-0', '1/2': 'basis-1/2', '1/3': 'basis-1/3', '2/3': 'basis-2/3', '1/4': 'basis-1/4', '3/4': 'basis-3/4' }
