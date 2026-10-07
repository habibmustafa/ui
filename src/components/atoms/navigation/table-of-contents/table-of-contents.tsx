'use client'

import * as React from 'react'

import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'

/*
 * "On this page" navigation with scroll-spy. Each item points at an element id; the
 * active item is the last heading that has reached `offset` px from the top of the
 * scroll area (the window, or `scrollRoot`). Clicking scrolls smoothly (instantly for
 * reduced-motion users) and updates the URL hash without a jump. Links stay real
 * `href="#id"` anchors, so they work with a middle-click or before hydration.
 */

export interface TableOfContentsItem {
  /** The id of the element to scroll to. */
  id: string
  label: React.ReactNode
  /** Nesting depth for indentation: 1 is top level. @default 1 */
  level?: 1 | 2 | 3 | 4
}

export interface TableOfContentsProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'title'> {
  items: readonly TableOfContentsItem[]
  /** Active id (controlled). */
  activeId?: string
  defaultActiveId?: string
  onActiveChange?: (id: string) => void
  /** Distance in px from the top of the scroll area at which a heading counts as reached. @default 0 */
  offset?: number
  /** Scroll container to watch instead of the window. */
  scrollRoot?: HTMLElement | null
  /** Writes `#id` to the URL when a link is clicked. @default true */
  updateHash?: boolean
  /** Heading above the list. */
  title?: React.ReactNode
  classNames?: { title?: string; list?: string; link?: string }
}

const indent = { 1: 'pl-3', 2: 'pl-6', 3: 'pl-9', 4: 'pl-12' } as const

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scrolls `el` to the top of `root` (or the window), writes the hash, and returns the time
 * until which scroll-spy should stay quiet so the highlight doesn't flicker mid-scroll.
 */
function scrollToHeading(
  el: HTMLElement,
  root: HTMLElement | null,
  offset: number,
  id: string,
  updateHash: boolean
) {
  const smooth = !prefersReducedMotion()
  const behavior = smooth ? 'smooth' : 'auto'
  if (root) {
    const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - offset
    if (typeof root.scrollTo === 'function') root.scrollTo({ top, behavior })
    else root.scrollTop = top
  } else if (typeof window.scrollTo === 'function' && offset !== 0) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior })
  } else {
    el.scrollIntoView?.({ behavior, block: 'start' })
  }
  try {
    if (updateHash) history.replaceState(null, '', `#${id}`)
  } catch {
    // history can be unavailable (sandboxed frames); the scroll already happened.
  }
  return performance.now() + (smooth ? 700 : 0)
}

const TableOfContents = React.forwardRef<HTMLElement, TableOfContentsProps>(
  (
    {
      items,
      activeId: activeIdProp,
      defaultActiveId,
      onActiveChange,
      offset = 0,
      scrollRoot,
      updateHash = true,
      title,
      className,
      classNames,
      'aria-label': ariaLabelProp,
      ...props
    },
    ref
  ) => {
    const labels = useLabels()
    const ariaLabel = ariaLabelProp ?? labels.tableOfContents
    const [active, setActive] = useControllableState<string | undefined>({
      value: activeIdProp,
      defaultValue: defaultActiveId ?? items[0]?.id,
      onChange: (id) => id !== undefined && onActiveChange?.(id),
    })

    const ids = items.map((item) => item.id).join('\u0000')

    // Scroll-spy. Skipped while a click-initiated smooth scroll is in flight, otherwise the
    // highlight would flicker through every heading it passes.
    const lockedUntil = React.useRef(0)
    const setActiveRef = React.useRef(setActive)
    React.useLayoutEffect(() => {
      setActiveRef.current = setActive
    })

    React.useEffect(() => {
      if (activeIdProp !== undefined) return
      const source: HTMLElement | Window = scrollRoot ?? window
      let frame = 0

      const measure = () => {
        frame = 0
        if (performance.now() < lockedUntil.current) return
        const rootTop = scrollRoot ? scrollRoot.getBoundingClientRect().top : 0
        let current: string | undefined
        for (const id of ids.split('\u0000')) {
          const el = document.getElementById(id)
          if (!el) continue
          if (el.getBoundingClientRect().top - rootTop <= offset + 1) current = id
          else break
        }
        // Scrolled all the way down: the last heading may never reach the top (a short final
        // section), so it takes over once there is nothing left to scroll.
        const doc = document.documentElement
        const atBottom = scrollRoot
          ? scrollRoot.scrollHeight > scrollRoot.clientHeight &&
            scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 2
          : doc.scrollHeight > window.innerHeight && window.scrollY + window.innerHeight >= doc.scrollHeight - 2
        const all = ids.split('\u0000')
        setActiveRef.current(atBottom ? all[all.length - 1] : (current ?? all[0]))
      }
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(measure)
      }

      source.addEventListener('scroll', schedule, { passive: true })
      schedule()
      return () => {
        source.removeEventListener('scroll', schedule)
        if (frame) cancelAnimationFrame(frame)
      }
    }, [ids, offset, scrollRoot, activeIdProp])

    const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      event.preventDefault()
      lockedUntil.current = scrollToHeading(el, scrollRoot ?? null, offset, id, updateHash)
      setActive(id)
    }

    return (
      <nav ref={ref} aria-label={ariaLabel} className={cn('text-sm', className)} {...props}>
        {title != null && (
          <p className={cn('mb-2 font-medium text-foreground', classNames?.title)}>{title}</p>
        )}
        <ul className={cn('flex flex-col border-l border-border-strong', classNames?.list)}>
          {items.map((item) => {
            const isActive = item.id === active
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={(event) => go(event, item.id)}
                  className={cn(
                    '-ml-px block border-l py-1 pr-2 transition-colors focus-ring rounded-r-sm',
                    indent[item.level ?? 1],
                    isActive
                      ? 'border-brand-default text-foreground'
                      : 'border-transparent text-foreground-lighter hover:text-foreground',
                    classNames?.link
                  )}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }
)
TableOfContents.displayName = 'TableOfContents'

export { TableOfContents }
