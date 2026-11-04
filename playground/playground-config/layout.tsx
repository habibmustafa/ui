import { Fragment } from 'react'

import {
  AspectRatio,
  Box,
  Card,
  Container,
  Flex,
  FloatingPlate,
  Grid,
  Resizable,
  ScrollArea,
  Separator,
  Stack
} from '../../src'
import { c, define } from './define'
import { known } from './types'

known('Separator', Separator)

const SPACE = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']

const tile = (label: string) => (
  <div className="rounded-md border bg-surface-100 px-3 py-2 text-sm">{label}</div>
)
const tiles = (count: number) => (
  <Fragment>{Array.from({ length: count }, (_, index) => <Fragment key={index}>{tile(String(index + 1))}</Fragment>)}</Fragment>
)
const three = (
  <Fragment>
    {tile('One')}
    {tile('Two')}
    {tile('Three')}
  </Fragment>
)

export const layout = {
  'aspect-ratio': define({
    name: 'AspectRatio',
    component: AspectRatio,
    base: {
      className: 'w-64',
      children: (
        <div className="flex h-full w-full items-center justify-center rounded-md bg-surface-200 text-sm">
          Content
        </div>
      )
    },
    controls: [c.pick('shape', 'Ratio', ['16:9', '4:3', '1:1', '3:4'], '16:9', { prop: '' })],
    props: (v) => ({ ratio: { '16:9': 16 / 9, '4:3': 4 / 3, '1:1': 1, '3:4': 3 / 4 }[String(v.shape)] })
  }),
  box: define({
    name: 'Box',
    component: Box,
    base: { className: 'rounded-md border border-dashed bg-surface-75', children: tile('Content') },
    controls: [c.pick('p', 'Padding', SPACE, 'md')]
  }),
  card: define({
    name: 'Card',
    component: Card,
    base: { className: 'w-full max-w-sm' },
    controls: [
      c.text('title', 'Title', 'Team settings'),
      c.text('description', 'Description', 'Manage who can see and edit this project.'),
      c.area('children', 'Content', 'Anyone with the link can view.'),
      c.text('footer', 'Footer', 'Last changed yesterday')
    ]
  }),
  container: define({
    name: 'Container',
    component: Container,
    base: { className: 'w-full border border-dashed bg-surface-75', children: tile('Content') },
    controls: [
      c.pick('size', 'Max width', ['sm', 'md', 'lg', 'full'], 'sm'),
      c.flag('centered', 'Centered', true, { omit: true }),
      c.flag('padded', 'Padded')
    ]
  }),
  flex: define({
    name: 'Flex',
    component: Flex,
    base: { className: 'w-full max-w-md rounded-md border border-dashed p-2', children: three },
    controls: [
      c.pick('direction', 'Direction', ['row', 'column', 'row-reverse', 'column-reverse'], 'row', { omit: 'row' }),
      c.pick('align', 'Align', ['start', 'center', 'end', 'stretch', 'baseline'], 'center'),
      c.pick('justify', 'Justify', ['start', 'center', 'end', 'between', 'around', 'evenly'], 'start'),
      c.pick('gap', 'Gap', SPACE, 'md'),
      c.flag('wrap', 'Wrap')
    ]
  }),
  'floating-plate': define({
    name: 'FloatingPlate',
    component: FloatingPlate,
    base: { className: 'p-4 text-sm' },
    controls: [
      c.area('children', 'Content', 'A raised surface for anything that should float.'),
      c.pick('rounded', 'Corners', ['lg', 'md', 'full'], 'lg', { omit: 'lg' })
    ]
  }),
  grid: define({
    name: 'Grid',
    component: Grid,
    base: { className: 'w-full max-w-md', children: tiles(6) },
    controls: [
      c.num('columns', 'Columns', 1, 6, 3),
      c.pick('gap', 'Gap', SPACE, 'md'),
      c.pick('align', 'Align', ['start', 'center', 'end', 'stretch'], 'stretch', { omit: 'stretch' })
    ]
  }),
  resizable: define({
    name: 'Resizable',
    component: Resizable,
    base: {
      className: 'h-36 w-full max-w-md rounded-md border',
      panels: [
        { defaultSize: 50, content: <div className="flex h-full items-center justify-center text-sm">One</div> },
        { defaultSize: 50, content: <div className="flex h-full items-center justify-center text-sm">Two</div> }
      ]
    },
    controls: [
      c.pick('orientation', 'Direction', ['horizontal', 'vertical']),
      c.flag('withHandle', 'Grip on the handle', true, { omit: true })
    ]
  }),
  'scroll-area': define({
    name: 'ScrollArea',
    component: ScrollArea,
    base: {
      className: 'h-40 w-64 rounded-md border',
      children: (
        <div className="h-72 w-[36rem] p-3 text-sm text-foreground-light">
          Scroll to see more. The bar only appears when there is something to scroll, and stays
          out of the way otherwise. This content is taller and wider than its box.
        </div>
      )
    },
    controls: [c.pick('orientation', 'Scroll', ['vertical', 'horizontal', 'both'], 'vertical', { omit: 'vertical' })]
  }),
  separator: define({
    name: 'Separator',
    component: Separator,
    base: {},
    controls: [
      c.pick('orientation', 'Direction', ['horizontal', 'vertical'], 'horizontal', { omit: 'horizontal' }),
      c.flag('decorative', 'Decorative only', true, { omit: true })
    ],
    props: (v) => ({ className: v.orientation === 'vertical' ? 'h-16' : 'w-64' })
  }),
  stack: define({
    name: 'Stack',
    component: Stack,
    base: { className: 'w-full max-w-xs', children: three },
    controls: [
      c.pick('direction', 'Direction', ['column', 'row'], 'column', { omit: 'column' }),
      c.pick('align', 'Align', ['start', 'center', 'end', 'stretch', 'baseline'], 'stretch', { omit: 'stretch' }),
      c.pick('gap', 'Gap', SPACE, 'md', { omit: 'md' }),
      c.flag('divider', 'Divider', false, { prop: '' })
    ],
    props: (v) => (v.divider ? { divider: <Separator /> } : {})
  })
}
