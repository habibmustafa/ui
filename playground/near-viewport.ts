import { startTransition, useCallback, useEffect, useRef, useState } from 'react'

// One observer per margin, rather than one per card. Reversible observation lets
// galleries release timers, animations and DOM when cards are far offscreen.
const pools = new Map<string, { observer: IntersectionObserver; callbacks: Map<Element, (visible: boolean) => void> }>()

// A gallery reports many cards as near at once. Mounting all of those live previews in
// one render blocked input for most of a second on a mid-range laptop, so they are
// revealed one per task instead, each as a transition that React may interrupt.
const reveals: (() => void)[] = []
function revealSoon(reveal: () => void) {
  reveals.push(reveal)
  if (reveals.length > 1) return
  const next = () => {
    startTransition(reveals[0])
    reveals.shift()
    if (reveals.length) setTimeout(next, 0)
  }
  setTimeout(next, 0)
}

export function useNearViewport({ initial = false, once = true, margin = '800px 0px' } = {}): [(element: HTMLElement | null) => void, boolean] {
  const [near, setNear] = useState(initial)
  const cleanup = useRef<(() => void) | undefined>(undefined)
  const visibleNow = useRef(initial)
  const ref = useCallback((element: HTMLElement | null) => {
    cleanup.current?.()
    cleanup.current = undefined
    if (!element || (once && near)) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    let pool = pools.get(margin)
    if (!pool) {
      const callbacks = new Map<Element, (visible: boolean) => void>()
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting)
      }, { rootMargin: margin })
      pool = { observer, callbacks }
      pools.set(margin, pool)
    }
    const current = pool
    current.callbacks.set(element, visible => {
      visibleNow.current = visible
      // Hiding is cheap and frees memory right away; showing waits its turn.
      if (!visible) setNear(false)
      else revealSoon(() => { if (visibleNow.current) setNear(true) })
    })
    current.observer.observe(element)
    cleanup.current = () => {
      current.observer.unobserve(element)
      current.callbacks.delete(element)
      if (!current.callbacks.size) {
        current.observer.disconnect()
        if (pools.get(margin) === current) pools.delete(margin)
      }
    }
  }, [margin, near, once])
  useEffect(() => () => cleanup.current?.(), [])
  return [ref, near]
}
