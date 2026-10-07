'use client'

import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * An endlessly scrolling strip (logos, quotes, tags). The children are rendered several
 * times; every copy after the first is aria-hidden so assistive tech reads the content
 * once. The animation (`marquee-x` / `marquee-y` in motion.css) moves each copy by its
 * own length plus the gap, which makes the loop seamless — as long as the copies together
 * are longer than the box, so the number of copies is worked out from the measured sizes
 * (and kept up to date on resize) unless `repeat` fixes it. It pauses on hover/focus when
 * `pauseOnHover` is set, and for users who prefer reduced motion.
 */

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds for one full pass. @default 30 */
  duration?: number
  /** Scroll the other way. @default false */
  reverse?: boolean
  /** Scroll vertically (give the marquee a height). @default false */
  vertical?: boolean
  /** Pauses while hovered or focused. @default false */
  pauseOnHover?: boolean
  /** Gap between items, in px. @default 16 */
  gap?: number
  /** Copies of the content. Defaults to as many as it takes to always fill the box. */
  repeat?: number
  /** Fades the edges out. @default false */
  fade?: boolean
  classNames?: { track?: string }
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      duration = 30,
      reverse = false,
      vertical = false,
      pauseOnHover = false,
      gap = 16,
      repeat,
      fade = false,
      className,
      classNames,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const trackRef = React.useRef<HTMLDivElement | null>(null)
    const [measured, setMeasured] = React.useState(2)

    // ResizeObserver reports the initial size as soon as it starts observing, so there is
    // no separate first measurement.
    React.useEffect(() => {
      const root = rootRef.current
      const track = trackRef.current
      if (repeat !== undefined || !root || !track || typeof ResizeObserver === 'undefined') return
      const measure = () => {
        const box = vertical ? root.clientHeight : root.clientWidth
        const one = vertical ? track.offsetHeight : track.offsetWidth
        if (one > 0) setMeasured(Math.max(2, Math.ceil(box / (one + gap)) + 1))
      }
      const observer = new ResizeObserver(measure)
      observer.observe(root)
      observer.observe(track)
      return () => observer.disconnect()
    }, [repeat, vertical, gap])

    const copies = Math.max(2, Math.floor(repeat ?? measured))
    const mask = vertical
      ? 'linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)'
      : 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)'

    return (
      <div
        ref={(node) => {
          rootRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        role="group"
        aria-roledescription="marquee"
        className={cn('group flex overflow-hidden', vertical ? 'flex-col' : 'flex-row', className)}
        style={{
          gap,
          ['--marquee-gap' as string]: `${gap}px`,
          ...(fade ? { maskImage: mask, WebkitMaskImage: mask } : null),
          ...style,
        }}
        {...props}
      >
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? trackRef : undefined}
            aria-hidden={i > 0 || undefined}
            className={cn(
              'flex shrink-0 items-center justify-around motion-reduce:[animation-play-state:paused]',
              vertical ? 'flex-col' : 'flex-row',
              pauseOnHover &&
                'group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]',
              classNames?.track
            )}
            style={{
              gap,
              // Longhands, not the `animation` shorthand: the shorthand also sets play-state, and an
              // inline value would beat the pause-on-hover / reduced-motion classes.
              animationName: vertical ? 'marquee-y' : 'marquee-x',
              animationDuration: `${duration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: reverse ? 'reverse' : 'normal',
            }}
          >
            {children}
          </div>
        ))}
      </div>
    )
  }
)
Marquee.displayName = 'Marquee'

export { Marquee }
