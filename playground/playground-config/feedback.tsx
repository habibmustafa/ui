import { Banner, CircularProgress, Result, ShimmeringLoader, Skeleton, Spinner } from '../../src'
import { c, define } from './define'
import { icon, icons } from './types'

const iconChoice = ['none', ...Object.keys(icons)]

export const feedback = {
  banner: define({
    name: 'Banner',
    component: Banner,
    base: { className: 'w-full max-w-xl' },
    controls: [
      c.text('title', 'Message', 'A new version is available.'),
      c.pick('icon', 'Icon', iconChoice, 'Info', { prop: '' }),
      c.pick('variant', 'Variant', ['default', 'brand', 'warning', 'destructive']),
      c.flag('dismissible', 'Dismissible')
    ],
    props: (v) => ({ icon: icon(v.icon) })
  }),
  'circular-progress': define({
    name: 'CircularProgress',
    component: CircularProgress,
    base: {},
    controls: [
      c.num('value', 'Value', 0, 100, 65),
      c.pick('tone', 'Tone', ['brand', 'success', 'warning', 'destructive', 'neutral']),
      c.num('size', 'Size (px)', 32, 160, 80, { step: 8 }),
      c.num('thickness', 'Thickness', 2, 16, 6, { omit: 6, step: 1 }),
      c.flag('showValue', 'Show value', true),
      c.flag('rounded', 'Rounded ends', true, { omit: true })
    ],
    props: () => ({ 'aria-label': 'Progress' })
  }),
  result: define({
    name: 'Result',
    component: Result,
    base: {},
    controls: [
      c.pick('status', 'Status', ['success', 'info', 'warning', 'error', '404', '403', '500']),
      c.text('title', 'Title', 'Payment received'),
      c.text('description', 'Description', 'A receipt is on its way to your inbox.'),
      c.pick('size', 'Size', ['small', 'medium', 'large'], 'medium', { omit: 'medium' })
    ]
  }),
  skeleton: define({
    name: 'Skeleton',
    component: Skeleton,
    base: {},
    controls: [c.pick('shape', 'Shape', ['Line', 'Avatar', 'Card'], 'Line', { prop: '' })],
    props: (v) => ({
      className: { Line: 'h-4 w-64', Avatar: 'h-12 w-12 rounded-full', Card: 'h-32 w-64 rounded-lg' }[
        String(v.shape)
      ]
    })
  }),
  'shimmering-loader': define({
    name: 'ShimmeringLoader',
    component: ShimmeringLoader,
    base: { className: 'h-4 w-64' },
    controls: [
      c.num('delayIndex', 'Position in the list', 0, 8, 0, { omit: 0 }),
      c.num('animationDelay', 'Delay between rows (ms)', 0, 600, 150, { omit: 150, step: 50 })
    ]
  }),
  spinner: define({
    name: 'Spinner',
    component: Spinner,
    base: {},
    controls: [
      c.pick('size', 'Size', ['small', 'medium', 'large'], 'medium'),
      c.text('label', 'Accessible label', 'Loading')
    ]
  })
}
