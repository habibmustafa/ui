'use client'

import { useLayoutEffect, type RefObject } from 'react'

/**
 * Measures the active item in a list and publishes its offset/width as CSS custom
 * properties, so a sibling indicator element can slide to it. Shared by Tabs (the
 * underline) and ToggleGroup's `segmented` variant (the pill) — matching upstream,
 * where both read from one file; the defaults below are Tabs'.
 */
type IndicatorOptions = {
  activeItemSelector?: string
  indicatorSelector?: string
  readyFlag?: string
  leftProperty?: string
  widthProperty?: string
  insetByPadding?: boolean
}

const tabDefaults = {
  activeItemSelector: '[role="tab"][data-state="active"]',
  indicatorSelector: '[data-tab-indicator]',
  readyFlag: 'tabIndicatorReady',
  leftProperty: '--active-tab-left',
  widthProperty: '--active-tab-width',
  insetByPadding: true,
} satisfies Required<IndicatorOptions>

export const useTabIndicator = (
  listRef: RefObject<HTMLElement | null>,
  options: IndicatorOptions = {}
) => {
  const {
    activeItemSelector,
    indicatorSelector,
    readyFlag,
    leftProperty,
    widthProperty,
    insetByPadding,
  } = { ...tabDefaults, ...options }

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !list.querySelector(`:scope > ${indicatorSelector}`)) return

    let cancelled = false

    const measure = () => {
      const trigger = list.querySelector<HTMLElement>(`:scope > ${activeItemSelector}`)
      if (cancelled) return
      if (!trigger) {
        delete list.dataset[readyFlag]
        return
      }

      const styles = getComputedStyle(trigger)
      const paddingLeft = insetByPadding ? parseFloat(styles.paddingLeft) || 0 : 0
      const paddingRight = insetByPadding ? parseFloat(styles.paddingRight) || 0 : 0

      list.style.setProperty(leftProperty, `${trigger.offsetLeft + paddingLeft}px`)
      list.style.setProperty(widthProperty, `${trigger.offsetWidth - paddingLeft - paddingRight}px`)
      if (list.dataset[readyFlag] === undefined) {
        // makes the bar already sitting on the active tab rather than sliding in
        requestAnimationFrame(() => {
          if (!cancelled) list.dataset[readyFlag] = ''
        })
      }
    }

    // Measured from ResizeObserver callbacks, which run after the browser's own layout
    // and before paint: reading offsets there is free, and the bar still sits on the
    // active item in the first frame. Measuring straight from this layout effect forced
    // an extra full-page layout on every mount (over a second on a heavy page).
    // Observing anew also reports every target once, so a new active item or a label
    // that widens when a webfont lands is picked up the same way.
    const resizes = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    const sync = () => {
      if (!resizes) return measure()
      resizes.disconnect()
      resizes.observe(list)
      Array.from(list.children).forEach((child) => resizes.observe(child))
    }

    sync()

    const mutations =
      typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(sync)
    mutations?.observe(list, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
      childList: true,
    })

    return () => {
      cancelled = true
      mutations?.disconnect()
      resizes?.disconnect()
      delete list.dataset[readyFlag]
    }
  }, [
    listRef,
    activeItemSelector,
    indicatorSelector,
    readyFlag,
    leftProperty,
    widthProperty,
    insetByPadding,
  ])
}
