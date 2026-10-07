'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { Button } from '../../actions/button'

/*
 * Scroll-snap carousel with no runtime dependency: the browser does the swiping and
 * snapping, the components only track which slide is current and move between slides.
 * `CarouselRoot` owns the state (index, loop, autoplay); `CarouselContent` is the scroll
 * track, and each direct child of it is a slide (use `CarouselItem`).
 */

type Orientation = 'horizontal' | 'vertical'

interface CarouselContextValue {
  orientation: Orientation
  index: number
  count: number
  /** Slides visible at once. */
  perView: number
  /** Last index the track can rest on (count - perView). */
  maxIndex: number
  gap: number
  loop: boolean
  canPrev: boolean
  canNext: boolean
  scrollTo: (index: number) => void
  scrollPrev: () => void
  scrollNext: () => void
  registerCount: (count: number) => void
  /** Sets the index from the browser's own scrolling (swipe, wheel). */
  syncIndex: (index: number) => void
  contentRef: React.RefObject<HTMLDivElement | null>
  setPaused: (paused: boolean) => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error('Carousel parts must be rendered inside <Carousel.Root>')
  return context
}

const SlideIndexContext = React.createContext(0)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export interface CarouselRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Current slide (controlled). */
  index?: number
  /** @default 0 */
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** @default "horizontal" */
  orientation?: Orientation
  /** Wraps from the last slide to the first and back. @default false */
  loop?: boolean
  /** Slides visible at once. @default 1 */
  slidesPerView?: number
  /** Space between slides, in px. @default 0 */
  gap?: number
  /** Advances every N ms; pauses on hover/focus and for reduced-motion users. */
  autoPlay?: number
}

const CarouselRoot = React.forwardRef<HTMLDivElement, CarouselRootProps>(
  (
    {
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      orientation = 'horizontal',
      loop = false,
      slidesPerView = 1,
      gap = 0,
      autoPlay,
      className,
      onKeyDown,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      children,
      ...props
    },
    ref
  ) => {
    const [index, setIndex] = useControllableState({
      value: indexProp,
      defaultValue: defaultIndex,
      onChange: onIndexChange,
    })
    const [count, setCount] = React.useState(0)
    const [paused, setPaused] = React.useState(false)
    const contentRef = React.useRef<HTMLDivElement | null>(null)
    const vertical = orientation === 'vertical'
    const perView = Math.max(1, Math.floor(slidesPerView))
    const maxIndex = Math.max(0, count - perView)

    const registerCount = React.useCallback((next: number) => setCount(next), [])

    const moveTrack = React.useCallback(
      (target: number) => {
        const content = contentRef.current
        const slide = content?.querySelectorAll<HTMLElement>('[data-carousel-item]')[target]
        if (!content || !slide) return
        const top = vertical ? slide.offsetTop : 0
        const left = vertical ? 0 : slide.offsetLeft
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
        if (typeof content.scrollTo === 'function') content.scrollTo({ top, left, behavior })
        else {
          content.scrollTop = top
          content.scrollLeft = left
        }
      },
      [vertical]
    )

    const scrollTo = React.useCallback(
      (target: number) => {
        if (count === 0) return
        const next = Math.min(maxIndex, Math.max(0, target))
        setIndex(next)
        moveTrack(next)
      },
      [count, maxIndex, moveTrack, setIndex]
    )

    const scrollPrev = React.useCallback(() => {
      if (index > 0) scrollTo(index - 1)
      else if (loop && maxIndex > 0) scrollTo(maxIndex)
    }, [index, loop, maxIndex, scrollTo])

    const scrollNext = React.useCallback(() => {
      if (index < maxIndex) scrollTo(index + 1)
      else if (loop && maxIndex > 0) scrollTo(0)
    }, [index, loop, maxIndex, scrollTo])

    const syncIndex = React.useCallback(
      (next: number) => {
        if (next !== index) setIndex(next)
      },
      [index, setIndex]
    )

    React.useEffect(() => {
      if (!autoPlay || paused || maxIndex < 1 || prefersReducedMotion()) return
      const id = setInterval(() => {
        const next = index < maxIndex ? index + 1 : loop ? 0 : null
        if (next === null) return
        setIndex(next)
        moveTrack(next)
      }, autoPlay)
      return () => clearInterval(id)
    }, [autoPlay, paused, maxIndex, index, loop, moveTrack, setIndex])

    const value = React.useMemo<CarouselContextValue>(
      () => ({
        orientation,
        index,
        count,
        perView,
        maxIndex,
        gap,
        loop,
        canPrev: loop ? maxIndex > 0 : index > 0,
        canNext: loop ? maxIndex > 0 : index < maxIndex,
        scrollTo,
        scrollPrev,
        scrollNext,
        registerCount,
        syncIndex,
        contentRef,
        setPaused,
      }),
      [orientation, index, count, perView, maxIndex, gap, loop, scrollTo, scrollPrev, scrollNext, registerCount, syncIndex]
    )

    const labels = useLabels()

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          role="region"
          aria-roledescription={labels.carouselRole}
          data-orientation={orientation}
          className={cn('relative', className)}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented) return
            const prev = vertical ? 'ArrowUp' : 'ArrowLeft'
            const next = vertical ? 'ArrowDown' : 'ArrowRight'
            if (event.key === prev) {
              event.preventDefault()
              scrollPrev()
            } else if (event.key === next) {
              event.preventDefault()
              scrollNext()
            }
          }}
          onMouseEnter={(event) => {
            onMouseEnter?.(event)
            setPaused(true)
          }}
          onMouseLeave={(event) => {
            onMouseLeave?.(event)
            setPaused(false)
          }}
          onFocus={(event) => {
            onFocus?.(event)
            setPaused(true)
          }}
          onBlur={(event) => {
            onBlur?.(event)
            setPaused(false)
          }}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
CarouselRoot.displayName = 'CarouselRoot'

export type CarouselContentProps = React.HTMLAttributes<HTMLDivElement>

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, style, children, ...props }, ref) => {
    const { orientation, count, gap, registerCount, syncIndex, contentRef } = useCarousel()
    const vertical = orientation === 'vertical'
    const slides = React.Children.toArray(children)

    React.useLayoutEffect(() => {
      if (slides.length !== count) registerCount(slides.length)
    })

    const frame = React.useRef(0)
    React.useEffect(() => () => cancelAnimationFrame(frame.current), [])

    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const content = contentRef.current
        if (!content) return
        const items = content.querySelectorAll<HTMLElement>('[data-carousel-item]')
        const position = vertical ? content.scrollTop : content.scrollLeft
        let nearest = 0
        let best = Infinity
        items.forEach((item, i) => {
          const distance = Math.abs((vertical ? item.offsetTop : item.offsetLeft) - position)
          if (distance < best) {
            best = distance
            nearest = i
          }
        })
        syncIndex(nearest)
      })
    }

    return (
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        onScroll={onScroll}
        style={{ gap: gap || undefined, ...style }}
        className={cn(
          'relative flex overflow-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          vertical ? 'flex-col snap-y snap-mandatory' : 'snap-x snap-mandatory',
          className
        )}
        {...props}
      >
        {slides.map((slide, i) => (
          <SlideIndexContext.Provider key={React.isValidElement(slide) ? (slide.key ?? i) : i} value={i}>
            {slide}
          </SlideIndexContext.Provider>
        ))}
      </div>
    )
  }
)
CarouselContent.displayName = 'CarouselContent'

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, style, ...props }, ref) => {
    const { index, count, perView, gap } = useCarousel()
    const labels = useLabels()
    const position = React.useContext(SlideIndexContext)
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription={labels.carouselSlideRole}
        aria-label={labels.carouselSlide(position + 1, count)}
        data-carousel-item=""
        data-active={(position >= index && position < index + perView) || undefined}
        style={{
          flexBasis: perView > 1 ? `calc((100% - ${gap * (perView - 1)}px) / ${perView})` : undefined,
          ...style,
        }}
        className={cn('min-w-0 shrink-0 grow-0 snap-start', perView === 1 && 'basis-full', className)}
        {...props}
      />
    )
  }
)
CarouselItem.displayName = 'CarouselItem'

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>

export type CarouselPreviousProps = ButtonProps
export type CarouselNextProps = ButtonProps

const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselPreviousProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, canPrev, scrollPrev } = useCarousel()
    const labels = useLabels()
    return (
      <Button
        ref={ref}
        type="button"
        variant="default"
        aria-label={labels.carouselPrevious}
        disabled={!canPrev}
        onClick={scrollPrev}
        className={cn(
          'absolute z-10 h-8 w-8 rounded-full p-0',
          orientation === 'vertical'
            ? '-top-12 left-1/2 -translate-x-1/2 rotate-90'
            : '-left-12 top-1/2 -translate-y-1/2',
          className
        )}
        {...props}
      >
        {children ?? <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
      </Button>
    )
  }
)
CarouselPrevious.displayName = 'CarouselPrevious'

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, canNext, scrollNext } = useCarousel()
    const labels = useLabels()
    return (
      <Button
        ref={ref}
        type="button"
        variant="default"
        aria-label={labels.carouselNext}
        disabled={!canNext}
        onClick={scrollNext}
        className={cn(
          'absolute z-10 h-8 w-8 rounded-full p-0',
          orientation === 'vertical'
            ? '-bottom-12 left-1/2 -translate-x-1/2 rotate-90'
            : '-right-12 top-1/2 -translate-y-1/2',
          className
        )}
        {...props}
      >
        {children ?? <ChevronRight className="h-4 w-4" aria-hidden="true" />}
      </Button>
    )
  }
)
CarouselNext.displayName = 'CarouselNext'

export type CarouselDotsProps = React.HTMLAttributes<HTMLDivElement>

const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(
  ({ className, ...props }, ref) => {
    const { orientation, index, maxIndex, scrollTo } = useCarousel()
    const labels = useLabels()
    return (
      <div
        ref={ref}
        role="group"
        aria-label={labels.carouselDots}
        className={cn(
          'flex items-center justify-center gap-1.5',
          orientation === 'vertical' ? 'absolute right-2 top-1/2 -translate-y-1/2 flex-col' : 'mt-3',
          className
        )}
        {...props}
      >
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={labels.carouselGoTo(i + 1)}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => scrollTo(i)}
            className={cn(
              'h-2 rounded-full transition-all focus-ring',
              i === index ? 'w-5 bg-brand-default' : 'w-2 bg-border-strong hover:bg-foreground-muted'
            )}
          />
        ))}
      </div>
    )
  }
)
CarouselDots.displayName = 'CarouselDots'

export { CarouselRoot, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots }
export { useCarousel }
