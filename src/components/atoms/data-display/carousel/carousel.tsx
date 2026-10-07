import type * as React from 'react'

import { cn } from '../../../../lib/utils'
import {
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRoot,
  type CarouselRootProps,
} from './carousel-parts'

type PropsModeProps = Omit<CarouselRootProps, 'children'> & {
  /** One slide per entry. */
  items: readonly React.ReactNode[]
  /** `null` hides the previous/next buttons. */
  arrows?: null | false
  /** `null` hides the dot indicator. */
  dots?: null | false
  classNames?: { content?: string; item?: string; dots?: string }
  children?: never
}

type CompoundModeProps = CarouselRootProps & {
  items?: never
  arrows?: never
  dots?: never
  classNames?: never
}

export type CarouselProps = PropsModeProps | CompoundModeProps

export function CarouselHybrid(props: CarouselProps) {
  if (props.items === undefined) return <CarouselRoot {...(props as CompoundModeProps)} />

  const { items, arrows, dots, classNames, className, ...rest } = props as PropsModeProps

  return (
    <CarouselRoot className={cn(arrows !== null && arrows !== false && 'mx-12', className)} {...rest}>
      <CarouselContent className={classNames?.content}>
        {items.map((item, i) => (
          <CarouselItem key={i} className={classNames?.item}>
            {item}
          </CarouselItem>
        ))}
      </CarouselContent>
      {arrows !== null && arrows !== false && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
      {dots !== null && dots !== false && <CarouselDots className={classNames?.dots} />}
    </CarouselRoot>
  )
}
