/*
 * ui-specific layout primitive — there is no counterpart upstream, where layout is composed
 * with Tailwind utility classes directly. This component is therefore an addition, not a port.
 */
import * as React from 'react'

import { cn } from '../../../../lib/utils'
import {
  baseClass,
  MARGIN,
  MARGIN_BOTTOM,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MARGIN_TOP,
  MARGIN_X,
  MARGIN_Y,
  PADDING,
  PADDING_BOTTOM,
  PADDING_LEFT,
  PADDING_RIGHT,
  PADDING_TOP,
  PADDING_X,
  PADDING_Y,
} from '../layout-classes'
import type { Space } from '../layout-types'

/** Token-based spacing props shared by every layout primitive (base breakpoint only). */
export type SpacingProps = {
  p?: Space
  px?: Space
  py?: Space
  pt?: Space
  pr?: Space
  pb?: Space
  pl?: Space
  m?: Space
  mx?: Space
  my?: Space
  mt?: Space
  mr?: Space
  mb?: Space
  ml?: Space
}

export type BoxProps<E extends React.ElementType = 'div'> = {
  /** Element to render instead of the default `<div>`. */
  as?: E
  className?: string
} & SpacingProps &
  Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'className'>

export function Box<E extends React.ElementType = 'div'>({
  as,
  className,
  ...props
}: BoxProps<E>) {
  const Component: React.ElementType = as ?? 'div'
  const {
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    ...rest
  } = props

  return (
    <Component
      className={cn(
        baseClass(p, PADDING),
        baseClass(px, PADDING_X),
        baseClass(py, PADDING_Y),
        baseClass(pt, PADDING_TOP),
        baseClass(pr, PADDING_RIGHT),
        baseClass(pb, PADDING_BOTTOM),
        baseClass(pl, PADDING_LEFT),
        baseClass(m, MARGIN),
        baseClass(mx, MARGIN_X),
        baseClass(my, MARGIN_Y),
        baseClass(mt, MARGIN_TOP),
        baseClass(mr, MARGIN_RIGHT),
        baseClass(mb, MARGIN_BOTTOM),
        baseClass(ml, MARGIN_LEFT),
        className
      )}
      {...rest}
    />
  )
}
