import {
  Breadcrumb,
  Command,
  Menubar,
  NavigationMenu,
  Pagination,
  Stepper,
  TableOfContents,
  Tabs,
  TextLink
} from '../../src'
import { c, define } from './define'

export const navigation = {
  breadcrumb: define({
    name: 'Breadcrumb',
    component: Breadcrumb,
    base: {
      items: [
        { label: 'Home', href: '#' },
        { label: 'Components', href: '#' },
        { label: 'Navigation', href: '#' },
        { label: 'Breadcrumb' }
      ]
    },
    controls: [
      c.pick('separator', 'Separator', ['Chevron', 'Slash', 'Dot'], 'Chevron', { prop: '' }),
      c.num('maxItems', 'Collapse above (items)', 0, 4, 0, { omit: 0 }),
      c.pick('overflow', 'Collapsed items', ['dropdown', 'responsive'], 'dropdown', { omit: 'dropdown' })
    ],
    props: (v) => {
      const separator = { Slash: '/', Dot: '·' }[String(v.separator)]
      return separator ? { separator } : {}
    }
  }),
  command: define({
    name: 'Command',
    component: Command,
    base: {
      className: 'w-full max-w-sm rounded-md border',
      groups: [
        {
          key: 'pages',
          heading: 'Pages',
          items: [
            { key: 'overview', label: 'Overview' },
            { key: 'projects', label: 'Projects' },
            { key: 'team', label: 'Team' }
          ]
        },
        {
          key: 'actions',
          heading: 'Actions',
          items: [
            { key: 'invite', label: 'Invite a member', shortcut: 'I' },
            { key: 'create', label: 'Create a project', shortcut: 'C' }
          ]
        }
      ]
    },
    controls: [
      c.text('placeholder', 'Placeholder', 'Type a command or search'),
      c.text('emptyText', 'Empty message', 'No results found.', { omit: 'No results found.' })
    ]
  }),
  menubar: define({
    name: 'Menubar',
    component: Menubar,
    base: {},
    controls: [c.flag('shortcuts', 'Show shortcuts', true, { prop: '' }), c.flag('editDisabled', 'Disable Edit', false, { prop: '' })],
    props: (v) => ({
      menus: [
        {
          key: 'file',
          label: 'File',
          items: [
            { key: 'new', label: 'New file', shortcut: v.shortcuts ? '⌘N' : undefined },
            { key: 'open', label: 'Open…', shortcut: v.shortcuts ? '⌘O' : undefined },
            { type: 'separator', key: 'line' },
            { key: 'save', label: 'Save', shortcut: v.shortcuts ? '⌘S' : undefined }
          ]
        },
        {
          key: 'edit',
          label: 'Edit',
          disabled: v.editDisabled ? true : undefined,
          items: [
            { key: 'undo', label: 'Undo', shortcut: v.shortcuts ? '⌘Z' : undefined },
            { key: 'redo', label: 'Redo', shortcut: v.shortcuts ? '⇧⌘Z' : undefined }
          ]
        }
      ]
    })
  }),
  'navigation-menu': define({
    name: 'NavigationMenu',
    component: NavigationMenu,
    base: {
      items: [
        { key: 'home', label: 'Home', href: '#', active: true },
        {
          key: 'products',
          label: 'Products',
          links: [
            { title: 'Analytics', href: '#', description: 'Understand how people use your product.' },
            { title: 'Automations', href: '#', description: 'Handle repeat work for you.' }
          ]
        },
        { key: 'pricing', label: 'Pricing', href: '#' }
      ]
    },
    controls: [c.flag('viewport', 'Shared viewport', true, { omit: true })]
  }),
  pagination: define({
    name: 'Pagination',
    component: Pagination,
    base: {},
    controls: [
      c.num('totalPages', 'Pages', 1, 50, 12),
      c.num('defaultPage', 'First page shown', 1, 50, 5, { omit: 1 }),
      c.num('siblingCount', 'Neighbours', 0, 3, 1, { omit: 1 }),
      c.pick('size', 'Size', ['tiny', 'small', 'medium'], 'tiny', { omit: 'tiny' }),
      c.flag('showControls', 'Previous / next', true, { omit: true })
    ]
  }),
  stepper: define({
    name: 'Stepper',
    component: Stepper,
    base: {
      steps: [
        { title: 'Account', description: 'Create your login' },
        { title: 'Profile', description: 'Tell us about you' },
        { title: 'Team', description: 'Invite people' },
        { title: 'Done', description: 'Start building' }
      ]
    },
    controls: [
      c.num('activeStep', 'Current step', 0, 3, 1, { omit: 0 }),
      c.pick('orientation', 'Direction', ['horizontal', 'vertical'], 'horizontal', { omit: 'horizontal' })
    ]
  }),
  'table-of-contents': define({
    name: 'TableOfContents',
    component: TableOfContents,
    base: {
      updateHash: false,
      items: [
        { id: 'intro', label: 'Introduction' },
        { id: 'install', label: 'Installation' },
        { id: 'usage', label: 'Usage', level: 1 },
        { id: 'props', label: 'Props', level: 2 }
      ]
    },
    controls: [
      c.text('title', 'Title', 'On this page'),
      c.pick('defaultActiveId', 'Highlighted', ['intro', 'install', 'usage', 'props'], 'install')
    ]
  }),
  tabs: define({
    name: 'Tabs',
    component: Tabs,
    base: {
      items: [
        { value: 'account', label: 'Account', content: 'Update your name and email.' },
        { value: 'password', label: 'Password', content: 'Change your password here.' },
        { value: 'team', label: 'Team', content: 'Invite and manage teammates.' }
      ],
      className: 'w-full max-w-md'
    },
    controls: [
      c.pick('layout', 'Layout', ['fill', 'inline'], 'fill', { omit: 'fill' }),
      c.flag('indicator', 'Animated underline', true, { omit: true }),
      c.text('listLabel', 'Accessible name', 'Settings sections')
    ]
  }),
  'text-link': define({
    name: 'TextLink',
    component: TextLink,
    base: { url: '#' },
    controls: [
      c.text('label', 'Label', 'Read the docs'),
      c.num('counter', 'Counter', 0, 99, 0, { omit: 0 }),
      c.pick('chevronAnimation', 'Chevron motion', ['translate', 'fadeIn'], 'translate', { omit: 'translate' }),
      c.flag('hasChevron', 'Chevron', true, { omit: true })
    ]
  })
}
