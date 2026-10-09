/*
 * Shared types for the ui-specific layout primitives.
 *
 * These components have no upstream counterpart (upstream composes layout
 * with Tailwind utilities directly), so this vocabulary is ui's own.
 */

/** Breakpoints supported by every responsive prop. `base` is the unprefixed value. */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg'

/** Either a single value, or one value per breakpoint (`{ base, sm, md, lg }`). */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>

/**
 * Named spacing scale. Deliberately not raw Tailwind steps: the scale keeps call sites
 * consistent with the vendored token system.
 *
 *   none → 0 · xs → 1 · sm → 2 · md → 4 · lg → 6 · xl → 8 · 2xl → 12
 */
export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
export type FlexWrap = boolean | 'reverse'

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridRows = 1 | 2 | 3 | 4 | 5 | 6
export type GridFlow = 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense'

export type ColSpan = GridColumns
export type ColStart = GridColumns
export type RowSpan = GridRows
export type Order = GridColumns | 'first' | 'last' | 'none'
export type Grow = 0 | 1
export type Shrink = 0 | 1
export type FlexBasis = 'auto' | 'full' | '0' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4'
