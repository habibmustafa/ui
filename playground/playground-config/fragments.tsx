import { Fragment } from 'react'

import {
  Admonition,
  CodeBlock,
  DataTable,
  EmptyStatePresentational,
  ErrorDisplay,
  GlassPanel,
  InfoTooltip,
  MetricCard,
  Row,
  StatusCode,
  TimestampInfo
} from '../../src'
import { c, define } from './define'
import { raw } from './types'

type Invoice = { id: string; customer: string; amount: number }
const invoices: Invoice[] = [
  { id: 'INV-001', customer: 'Acme Inc.', amount: 250 },
  { id: 'INV-002', customer: 'Globex', amount: 1200 },
  { id: 'INV-003', customer: 'Initech', amount: 480 },
  { id: 'INV-004', customer: 'Hooli', amount: 90 }
]

const card = (label: string) => (
  <div className="flex h-20 w-40 items-center justify-center rounded-md border bg-surface-100 text-sm">
    {label}
  </div>
)

export const fragments = {
  admonition: define({
    name: 'Admonition',
    component: Admonition,
    base: { className: 'w-full max-w-md' },
    controls: [
      c.pick('type', 'Type', ['note', 'success', 'warning', 'caution', 'danger', 'deprecation', 'default', 'destructive']),
      c.text('title', 'Title', 'Heads up'),
      c.area('description', 'Description', 'This change takes effect the next time you deploy.'),
      c.pick('layout', 'Layout', ['vertical', 'horizontal', 'responsive'], 'vertical', { omit: 'vertical' }),
      c.flag('showIcon', 'Icon', true, { omit: true })
    ]
  }),
  'code-block': define({
    name: 'CodeBlock',
    component: CodeBlock,
    base: { className: 'w-full max-w-lg' },
    controls: [
      c.area('value', 'Code', "const greeting = 'Hello'\nconsole.log(greeting)"),
      c.pick('language', 'Language', ['js', 'ts', 'jsx', 'bash', 'json', 'html', 'python', 'sql', 'yaml'], 'js'),
      c.text('title', 'Title', ''),
      c.flag('hideLineNumbers', 'Hide line numbers'),
      c.flag('hideCopy', 'Hide copy button'),
      c.flag('wrapLongLines', 'Wrap long lines')
    ]
  }),
  'data-table': define({
    name: 'DataTable',
    component: DataTable,
    base: {
      data: invoices,
      rowKey: raw('(row) => row.id', (row: Invoice) => row.id),
      columns: [
        {
          key: 'id',
          header: 'Invoice',
          render: raw('(row) => row.id', (row: Invoice) => row.id),
          sortValue: raw('(row) => row.id', (row: Invoice) => row.id),
          searchValue: raw('(row) => row.id', (row: Invoice) => row.id)
        },
        {
          key: 'customer',
          header: 'Customer',
          render: raw('(row) => row.customer', (row: Invoice) => row.customer),
          sortValue: raw('(row) => row.customer', (row: Invoice) => row.customer),
          searchValue: raw('(row) => row.customer', (row: Invoice) => row.customer)
        },
        {
          key: 'amount',
          header: 'Amount',
          align: 'right',
          render: raw('(row) => `$${row.amount}`', (row: Invoice) => `$${row.amount}`),
          sortValue: raw('(row) => row.amount', (row: Invoice) => row.amount)
        }
      ]
    },
    controls: [
      c.text('caption', 'Caption', 'Recent invoices'),
      c.text('searchPlaceholder', 'Search placeholder', 'Search…'),
      c.num('pageSize', 'Rows per page', 2, 10, 3),
      c.flag('selectable', 'Selectable rows')
    ]
  }),
  'empty-state': define({
    name: 'EmptyStatePresentational',
    component: EmptyStatePresentational,
    base: {},
    controls: [
      c.text('title', 'Title', 'No projects yet'),
      c.text('description', 'Description', 'Create a project to see it here.'),
      c.num('iconSize', 'Icon size', 16, 64, 24, { omit: 24, step: 4 })
    ]
  }),
  'error-display': define({
    name: 'ErrorDisplay',
    component: ErrorDisplay,
    base: { className: 'w-full max-w-md' },
    controls: [
      c.text('title', 'Title', 'Something went wrong'),
      c.area('errorMessage', 'Error message', 'TypeError: Cannot read properties of undefined'),
      c.text('supportLabel', 'Support link', 'Contact support', { omit: 'Contact support' })
    ]
  }),
  'glass-panel': define({
    name: 'GlassPanel',
    component: GlassPanel,
    base: { className: 'w-64' },
    controls: [
      c.text('title', 'Title', 'Realtime'),
      c.text('header', 'Header', ''),
      c.flag('showLink', 'Link'),
      c.flag('showIconBg', 'Icon background')
    ]
  }),
  'info-tooltip': define({
    name: 'InfoTooltip',
    component: InfoTooltip,
    base: {},
    controls: [
      c.text('children', 'Tooltip text', 'Shown to everyone in the workspace.'),
      c.text('label', 'Accessible label', 'More information')
    ]
  }),
  'metric-card': define({
    name: 'MetricCard',
    component: MetricCard,
    base: { className: 'w-64' },
    controls: [
      c.text('label', 'Label', 'Active users'),
      c.text('value', 'Value', '12,840'),
      c.text('differential', 'Change', '+12%'),
      c.pick('differentialVariant', 'Change style', ['positive', 'negative', 'default'], 'positive'),
      c.pick('orientation', 'Layout', ['vertical', 'horizontal'], 'vertical', { omit: 'vertical' }),
      c.text('tooltip', 'Tooltip', ''),
      c.flag('isLoading', 'Loading')
    ]
  }),
  row: define({
    name: 'Row',
    component: Row,
    base: {
      children: (
        <Fragment>
          {card('One')}
          {card('Two')}
          {card('Three')}
          {card('Four')}
          {card('Five')}
        </Fragment>
      ),
      className: 'w-full max-w-md'
    },
    controls: [
      c.num('maxColumns', 'Columns at most', 1, 5, 3),
      c.num('minWidth', 'Smallest card (px)', 120, 240, 160, { step: 20 }),
      c.num('gap', 'Gap (px)', 0, 32, 16, { omit: 16, step: 4 }),
      c.flag('showArrows', 'Arrows', true, { omit: true })
    ]
  }),
  'status-code': define({
    name: 'StatusCode',
    component: StatusCode,
    base: {},
    controls: [
      c.pick('method', 'Method', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 'GET'),
      c.pick('statusCode', 'Status', ['200', '201', '301', '404', '429', '500'], '200')
    ]
  }),
  'timestamp-info': define({
    name: 'TimestampInfo',
    component: TimestampInfo,
    base: { utcTimestamp: '2026-10-14T09:30:00Z' },
    controls: [
      c.pick('displayAs', 'Show in', ['local', 'utc'], 'local', { omit: 'local' }),
      c.pick('format', 'Format', ['DD MMM YY HH:mm:ss', 'YYYY-MM-DD HH:mm', 'HH:mm'], 'DD MMM YY HH:mm:ss', { omit: 'DD MMM YY HH:mm:ss' }),
      c.text('label', 'Label override', '')
    ]
  })
}
