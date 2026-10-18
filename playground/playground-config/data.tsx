import { Fragment } from 'react'
import {
  Accordion,
  Button,
  Carousel,
  Chart,
  Collapsible,
  Countdown,
  Descriptions,
  Gauge,
  Image,
  Kbd,
  Marquee,
  QRCode,
  Statistic,
  Table,
  VirtualList
} from '../../src'
import { c, define } from './define'
import { known, raw } from './types'

known('Button', Button)

const slide = (label: string) => (
  <div className="flex h-36 items-center justify-center rounded-lg border bg-surface-100 text-sm">
    {label}
  </div>
)

const chip = (label: string) => (
  <span className="rounded-md border bg-surface-100 px-3 py-1 text-sm">{label}</span>
)

const invoices = [
  { id: 'INV-001', customer: 'Acme Inc.', amount: '$250.00' },
  { id: 'INV-002', customer: 'Globex', amount: '$1,200.00' },
  { id: 'INV-003', customer: 'Initech', amount: '$480.00' }
]

export const data = {
  accordion: define({
    name: 'Accordion',
    component: Accordion,
    base: {
      items: [
        { value: 'access', trigger: 'Is it accessible?', content: 'Yes. It follows the WAI-ARIA pattern.' },
        { value: 'styled', trigger: 'Is it styled?', content: 'It ships with styles that match the rest of the set.' },
        { value: 'motion', trigger: 'Is it animated?', content: 'It opens and closes with a short, calm motion.' }
      ]
    },
    controls: [
      c.pick('type', 'Open at a time', ['single', 'multiple']),
      c.flag('collapsible', 'Can close every item', false, { prop: '', when: (v) => v.type === 'single' }),
      c.flag('disabled', 'Disabled')
    ],
    props: (v) => (v.type === 'single' && v.collapsible ? { collapsible: true } : {})
  }),
  carousel: define({
    name: 'Carousel',
    component: Carousel,
    base: { items: [slide('Slide 1'), slide('Slide 2'), slide('Slide 3'), slide('Slide 4')], 'aria-label': 'Examples' },
    controls: [
      c.num('slidesPerView', 'Slides in view', 1, 3, 1, { omit: 1 }),
      c.num('gap', 'Gap (px)', 0, 32, 0, { omit: 0, step: 4 }),
      c.flag('loop', 'Loop'),
      c.num('autoPlay', 'Auto-play (ms, 0 = off)', 0, 8000, 0, { omit: 0, step: 1000 }),
      c.flag('arrows', 'Arrows', true, { prop: '' }),
      c.flag('dots', 'Dots', true, { prop: '' })
    ],
    props: (v) => ({ arrows: v.arrows ? undefined : false, dots: v.dots ? undefined : false })
  }),
  collapsible: define({
    name: 'Collapsible',
    component: Collapsible,
    base: {
      className: 'w-full max-w-sm',
      trigger: <Button variant="outline">Toggle</Button>
    },
    controls: [
      c.text('label', 'Label', 'Show details'),
      c.area('content', 'Content', 'Anything can live here: text, a form, a list.'),
      c.flag('defaultOpen', 'Open at first')
    ]
  }),
  countdown: define({
    name: 'Countdown',
    component: Countdown,
    base: { value: raw('new Date(Date.now() + 90 * 60 * 1000)', new Date(Date.now() + 90 * 60 * 1000)) },
    controls: [
      c.text('title', 'Title', 'Sale ends in'),
      c.pick('format', 'Format', ['HH:mm:ss', 'mm:ss', 'HH:mm']),
      c.pick('size', 'Size', ['small', 'medium', 'large'], 'medium'),
      c.flag('paused', 'Paused')
    ]
  }),
  descriptions: define({
    name: 'Descriptions',
    component: Descriptions,
    base: {
      items: [
        { label: 'Customer', value: 'Acme Inc.' },
        { label: 'Plan', value: 'Team' },
        { label: 'Seats', value: '12' },
        { label: 'Renews', value: 'Jan 14, 2027' }
      ]
    },
    controls: [
      c.text('title', 'Title', 'Subscription'),
      c.num('columns', 'Columns', 1, 4, 2),
      c.pick('layout', 'Layout', ['horizontal', 'vertical']),
      c.flag('bordered', 'Bordered')
    ]
  }),
  gauge: define({
    name: 'Gauge',
    component: Gauge,
    base: {},
    controls: [
      c.num('value', 'Value', 0, 100, 64),
      c.text('label', 'Label', 'Storage used'),
      c.pick('tone', 'Tone', ['brand', 'success', 'warning', 'destructive', 'neutral']),
      c.num('size', 'Size (px)', 100, 240, 160, { step: 20 }),
      c.num('thickness', 'Thickness', 4, 24, 10, { step: 2 }),
      c.flag('showValue', 'Show value', true, { omit: true }),
      c.flag('showRange', 'Show range')
    ],
    props: (v) => ({ 'aria-label': String(v.label || 'Gauge') })
  }),
  image: define({
    name: 'Image',
    component: Image,
    base: { src: '/ui-mark.svg', className: 'h-32 w-32' },
    controls: [
      c.text('alt', 'Alt text', 'The ui mark'),
      c.pick('fit', 'Fit', ['cover', 'contain', 'fill', 'none']),
      c.pick('radius', 'Corners', ['md', 'none', 'sm', 'lg', 'full']),
      c.flag('preview', 'Click to enlarge')
    ]
  }),
  kbd: define({
    name: 'Kbd',
    component: Kbd,
    base: {},
    controls: [
      c.text('children', 'Keys', 'Ctrl K', { group: 'Content' }),
      c.pick('size', 'Size', ['small', 'medium', 'large'], 'medium')
    ]
  }),
  marquee: define({
    name: 'Marquee',
    component: Marquee,
    base: {
      children: (
        <Fragment>
          {chip('One')}
          {chip('Two')}
          {chip('Three')}
          {chip('Four')}
          {chip('Five')}
        </Fragment>
      )
    },
    controls: [
      c.num('duration', 'Duration (s)', 5, 60, 30, { omit: 30, step: 5 }),
      c.num('gap', 'Gap (px)', 0, 48, 16, { omit: 16, step: 4 }),
      c.flag('reverse', 'Reverse'),
      c.flag('vertical', 'Vertical'),
      c.flag('pauseOnHover', 'Pause on hover'),
      c.flag('fade', 'Fade edges')
    ],
    props: (v) => ({ className: v.vertical ? 'h-40' : 'w-full max-w-md' })
  }),
  'qr-code': define({
    name: 'QRCode',
    component: QRCode,
    base: {},
    controls: [
      c.text('value', 'Value', 'https://ui.example.com'),
      c.pick('level', 'Error correction', ['L', 'M', 'Q', 'H'], 'M', { omit: 'M' }),
      c.num('size', 'Size (px)', 96, 256, 160, { omit: 160, step: 16 }),
      c.num('margin', 'Margin', 0, 8, 4, { omit: 4 })
    ]
  }),
  statistic: define({
    name: 'Statistic',
    component: Statistic,
    base: {},
    controls: [
      c.text('title', 'Title', 'Active users'),
      c.num('value', 'Value', 0, 1000000, 112893, { step: 1000 }),
      c.text('prefix', 'Prefix', ''),
      c.text('suffix', 'Suffix', ''),
      c.pick('size', 'Size', ['small', 'medium', 'large'], 'medium'),
      c.flag('animated', 'Count up'),
      c.flag('loading', 'Loading')
    ]
  }),
  chart: define({
    name: 'Chart',
    component: Chart,
    base: {
      className: 'h-56 w-full max-w-lg',
      xKey: 'month',
      data: [
        { month: 'Jan', desktop: 186, mobile: 80 },
        { month: 'Feb', desktop: 305, mobile: 200 },
        { month: 'Mar', desktop: 237, mobile: 120 },
        { month: 'Apr', desktop: 173, mobile: 190 }
      ],
      series: [
        { key: 'desktop', label: 'Desktop' },
        { key: 'mobile', label: 'Mobile' }
      ]
    },
    controls: [
      c.flag('showTooltip', 'Tooltip', true, { omit: true }),
      c.flag('showLegend', 'Legend'),
      c.flag('showGrid', 'Grid lines')
    ]
  }),
  table: define({
    name: 'Table',
    component: Table,
    base: {
      data: invoices,
      rowKey: raw('(row) => row.id', (row: (typeof invoices)[number]) => row.id),
      columns: [
        { key: 'id', header: 'Invoice', render: raw('(row) => row.id', (row: (typeof invoices)[number]) => row.id) },
        { key: 'customer', header: 'Customer', render: raw('(row) => row.customer', (row: (typeof invoices)[number]) => row.customer) },
        { key: 'amount', header: 'Amount', align: 'right', render: raw('(row) => row.amount', (row: (typeof invoices)[number]) => row.amount) }
      ]
    },
    controls: [c.text('caption', 'Caption', 'Recent invoices')]
  }),
  'virtual-list': define({
    name: 'VirtualList',
    component: VirtualList,
    base: {
      items: raw(
        'Array.from({ length: 1000 }, (_, index) => `Row ${index + 1}`)',
        Array.from({ length: 1000 }, (_, index) => `Row ${index + 1}`)
      ),
      renderItem: raw(
        '(item) => <div className="px-3 text-sm">{item}</div>',
        (item: string) => <div className="px-3 text-sm">{item}</div>
      ),
      className: 'w-full max-w-sm rounded-md border'
    },
    controls: [
      c.num('height', 'Height (px)', 160, 480, 240, { omit: 320, step: 40 }),
      c.num('itemHeight', 'Row height (px)', 28, 64, 36, { step: 4 }),
      c.num('overscan', 'Overscan rows', 0, 12, 4, { omit: 4 })
    ]
  })
}
