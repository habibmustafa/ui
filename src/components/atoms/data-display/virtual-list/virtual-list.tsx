'use client'

import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Renders only the rows that are on screen (plus `overscan`), so a list of 100,000 items
 * costs the same as one of 20. Rows have a known height — one number for all, or a
 * function for mixed heights — which keeps scrolling exact without measuring the DOM.
 * The scroll container is focusable so the keyboard can scroll it, and every row carries
 * `aria-posinset` / `aria-setsize` so assistive tech still hears "item 4,812 of 100,000".
 * Browsers cap a single element at roughly 16-33 million px, so keep `rows × height` below
 * that (about 400,000 rows at 40 px).
 */

export interface VirtualListProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly T[]
  /** Row height in px: a number for equal rows, or a function of the index. */
  itemHeight: number | ((index: number) => number)
  renderItem: (item: T, index: number) => React.ReactNode
  /** Viewport height in px. @default 320 */
  height?: number
  /** Extra rows rendered above and below the viewport. @default 4 */
  overscan?: number
  /** Stable key per item; defaults to the index. */
  getKey?: (item: T, index: number) => React.Key
  /** Shown when `items` is empty. */
  empty?: React.ReactNode
  /** Fires when the user scrolls within `threshold` px of the end (infinite loading). */
  onEndReached?: () => void
  /** @default 120 */
  threshold?: number
  classNames?: { row?: string }
  /** Ref to the scroll container. */
  ref?: React.Ref<HTMLDivElement>
}

/** A plain function component (React 19 passes `ref` as a prop), so it stays generic in `T`. */
function VirtualList<T>({
    items,
    itemHeight,
    renderItem,
    height = 320,
    overscan = 4,
    getKey,
    empty,
    onEndReached,
    threshold = 120,
    className,
    classNames,
    style,
    onScroll,
    ref,
    ...props
  }: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const endReachedFor = React.useRef(-1)

  // offsets[i] is the top of row i; offsets[n] is the total height.
  const offsets = React.useMemo(() => {
    const out = new Array<number>(items.length + 1)
    out[0] = 0
    for (let i = 0; i < items.length; i++) {
      out[i + 1] = out[i] + (typeof itemHeight === 'number' ? itemHeight : itemHeight(i))
    }
    return out
  }, [items.length, itemHeight])

  const total = offsets[items.length]

  // Last row whose top is at or above `y`.
  const rowAt = (y: number) => {
    let lo = 0
    let hi = items.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (offsets[mid] <= y) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  const first = items.length === 0 ? 0 : Math.max(0, rowAt(scrollTop) - overscan)
  const last = items.length === 0 ? -1 : Math.min(items.length - 1, rowAt(scrollTop + height) + overscan)

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    setScrollTop(el.scrollTop)
    onScroll?.(event)
    if (onEndReached && el.scrollTop + height >= total - threshold && endReachedFor.current !== items.length) {
      // Once per list length, so appending items re-arms it.
      endReachedFor.current = items.length
      onEndReached()
    }
  }

  const rows: React.ReactNode[] = []
  for (let i = first; i <= last; i++) {
    rows.push(
      <div
        key={getKey ? getKey(items[i], i) : i}
        role="listitem"
        aria-posinset={i + 1}
        aria-setsize={items.length}
        className={cn('absolute inset-x-0 overflow-hidden', classNames?.row)}
        style={{ top: offsets[i], height: offsets[i + 1] - offsets[i] }}
      >
        {renderItem(items[i], i)}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      // A scroll container must be reachable by keyboard so arrow keys can scroll it.
      tabIndex={0}
      className={cn('relative overflow-auto focus-ring', className)}
      style={{ height, ...style }}
      onScroll={handleScroll}
      {...props}
    >
      {items.length === 0 ? (
        empty
      ) : (
        <div role="list" className="relative w-full" style={{ height: total }}>
          {rows}
        </div>
      )}
    </div>
  )
}

export { VirtualList }
