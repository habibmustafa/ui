'use client'

import * as React from 'react'

import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'

/*
 * A thin bar that fills as the page (or a scrollable element) is scrolled. By default it
 * tracks the window and pins itself to the top of the viewport. Pass `target` to follow a
 * scroll container instead and `position="static"` to lay the bar out inline (e.g. inside
 * a sticky header). The bar scales with a transform, so scrolling never triggers layout.
 */

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scrollable element to follow. Defaults to the window. */
  target?: React.RefObject<HTMLElement | null>
  /** `fixed` pins to the viewport; `absolute` to the nearest positioned ancestor. @default "fixed" */
  position?: 'fixed' | 'absolute' | 'static'
  /** Edge it sticks to when `fixed` or `absolute`. @default "top" */
  edge?: 'top' | 'bottom'
  /** Thickness in px. @default 3 */
  thickness?: number
  /** Accessible name. @default "Reading progress" */
  label?: string
  classNames?: { bar?: string }
}

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)

const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  (
    {
      target,
      position = 'fixed',
      edge = 'top',
      thickness = 3,
      label,
      className,
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const labels = useLabels()
    const [ratio, setRatio] = React.useState(0)

    React.useEffect(() => {
      const el = target?.current ?? null
      let frame = 0

      const measure = () => {
        frame = 0
        if (el) {
          setRatio(clamp01(el.scrollTop / (el.scrollHeight - el.clientHeight)))
        } else {
          const doc = document.documentElement
          setRatio(clamp01(window.scrollY / (doc.scrollHeight - window.innerHeight)))
        }
      }
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(measure)
      }

      const source: HTMLElement | Window = el ?? window
      source.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
      schedule()
      return () => {
        source.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
        if (frame) cancelAnimationFrame(frame)
      }
    }, [target])

    const percent = Math.round(ratio * 100)

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label ?? labels.scrollProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className={cn(
          'pointer-events-none inset-x-0 z-50 overflow-hidden',
          position === 'fixed' && 'fixed',
          position === 'absolute' && 'absolute',
          position === 'static' && 'relative w-full',
          position !== 'static' && (edge === 'top' ? 'top-0' : 'bottom-0'),
          className
        )}
        style={{ height: thickness, ...style }}
        {...props}
      >
        <div
          className={cn('h-full w-full origin-left bg-brand-default', classNames?.bar)}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
    )
  }
)
ScrollProgress.displayName = 'ScrollProgress'

export { ScrollProgress }
