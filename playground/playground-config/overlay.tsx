import {
  AlertDialog,
  Button,
  ConfirmPopover,
  ContextMenu,
  Dialog,
  Drawer,
  DropdownMenu,
  HoverCard,
  Popover,
  Sheet,
  TextLink,
  Tooltip
} from '../../src'
import { c, define } from './define'
import { known, raw } from './types'

known('Button', Button)
known('TextLink', TextLink)

const open = (label = 'Open') => <Button variant="default">{label}</Button>
const confirm = raw('() => {}', () => {})

export const overlay = {
  'alert-dialog': define({
    name: 'AlertDialog',
    component: AlertDialog,
    base: { trigger: open('Delete project'), onConfirm: confirm },
    controls: [
      c.text('title', 'Title', 'Delete this project?'),
      c.area('description', 'Description', 'This permanently removes the project and its files.'),
      c.text('confirmText', 'Confirm button', 'Delete'),
      c.pick('confirmVariant', 'Confirm style', ['danger', 'primary', 'default'], 'danger')
    ]
  }),
  'confirm-popover': define({
    name: 'ConfirmPopover',
    component: ConfirmPopover,
    base: { trigger: open('Remove member'), onConfirm: confirm },
    controls: [
      c.text('title', 'Title', 'Remove this member?'),
      c.text('description', 'Description', 'They lose access right away.'),
      c.text('confirmText', 'Confirm button', 'Remove'),
      c.pick('side', 'Side', ['bottom', 'top', 'left', 'right'], 'bottom'),
      c.pick('align', 'Align', ['start', 'center', 'end'], 'start', { omit: 'start' }),
      c.flag('destructive', 'Destructive')
    ]
  }),
  'context-menu': define({
    name: 'ContextMenu',
    component: ContextMenu,
    base: {
      trigger: 'Right-click here',
      triggerClassName: 'flex h-28 w-64 items-center justify-center rounded-md border border-dashed text-sm'
    },
    controls: [c.flag('shortcuts', 'Show shortcuts', true, { prop: '' }), c.flag('danger', 'Include Delete', true, { prop: '' })],
    props: (v) => ({
      items: [
        { key: 'back', label: 'Back', shortcut: v.shortcuts ? '⌘[' : undefined },
        { key: 'reload', label: 'Reload', shortcut: v.shortcuts ? '⌘R' : undefined },
        ...(v.danger ? [{ type: 'separator', key: 'line' }, { key: 'delete', label: 'Delete' }] : [])
      ]
    })
  }),
  dialog: define({
    name: 'Dialog',
    component: Dialog,
    base: { trigger: open('Open dialog'), onConfirm: confirm },
    controls: [
      c.text('title', 'Title', 'Edit profile'),
      c.text('description', 'Description', 'Make changes to your profile here.'),
      c.area('children', 'Content', 'Your name and photo are shown to everyone in the team.'),
      c.pick('confirmType', 'Confirm style', ['primary', 'default', 'danger'], 'primary', { omit: 'primary' }),
      c.flag('dismissible', 'Close on outside click', true, { omit: true })
    ]
  }),
  drawer: define({
    name: 'Drawer',
    component: Drawer,
    base: { trigger: open('Open drawer'), onConfirm: confirm },
    controls: [
      c.text('title', 'Title', 'Move goal'),
      c.text('description', 'Description', 'Set your daily activity goal.'),
      c.area('children', 'Content', 'Pick a number that feels right for today.'),
      c.pick('direction', 'Opens from', ['bottom', 'right', 'left', 'top'], 'bottom', { omit: 'bottom' })
    ]
  }),
  'dropdown-menu': define({
    name: 'DropdownMenu',
    component: DropdownMenu,
    base: { trigger: open('Account') },
    controls: [
      c.pick('align', 'Align', ['start', 'center', 'end'], 'start'),
      c.flag('shortcuts', 'Show shortcuts', true, { prop: '' })
    ],
    props: (v) => ({
      items: [
        { type: 'label', key: 'account', label: 'My account' },
        { key: 'profile', label: 'Profile', shortcut: v.shortcuts ? '⇧⌘P' : undefined },
        { key: 'billing', label: 'Billing', shortcut: v.shortcuts ? '⌘B' : undefined },
        { type: 'separator', key: 'line' },
        { key: 'signout', label: 'Sign out' }
      ]
    })
  }),
  'hover-card': define({
    name: 'HoverCard',
    component: HoverCard,
    base: { trigger: <TextLink label="@ui" url="#" hasChevron={false} /> },
    controls: [c.area('content', 'Content', 'A design system for React 19, with a calm default look.')]
  }),
  popover: define({
    name: 'Popover',
    component: Popover,
    base: { trigger: open('Open popover') },
    controls: [c.area('content', 'Content', 'Set the dimensions for the layer.')]
  }),
  sheet: define({
    name: 'Sheet',
    component: Sheet,
    base: { trigger: open('Open sheet'), onConfirm: confirm },
    controls: [
      c.text('title', 'Title', 'Edit profile'),
      c.text('description', 'Description', 'Make changes to your profile here.'),
      c.area('children', 'Content', 'Your name and photo are shown to everyone in the team.'),
      c.pick('side', 'Opens from', ['right', 'left', 'top', 'bottom'], 'right', { omit: 'right' }),
      c.pick('size', 'Size', ['default', 'sm', 'lg', 'xl', 'full'], 'default', { omit: 'default' }),
      c.flag('modal', 'Dims the page', true, { omit: true })
    ]
  }),
  tooltip: define({
    name: 'Tooltip',
    component: Tooltip,
    base: { trigger: open('Hover me') },
    controls: [c.text('content', 'Content', 'Add to library')]
  })
}
