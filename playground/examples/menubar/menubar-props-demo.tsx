import { useState } from 'react'

import { Menubar } from '../../../src'

export default function MenubarPropsDemo() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [zoom, setZoom] = useState('100')

  return (
    <Menubar
      menus={[
        {
          key: 'file',
          label: 'File',
          items: [
            { key: 'new', label: 'New tab', shortcut: '⌘T' },
            { key: 'window', label: 'New window', shortcut: '⌘N' },
            { type: 'separator', key: 'sep-1' },
            {
              type: 'submenu',
              key: 'share',
              label: 'Share',
              items: [
                { key: 'email', label: 'Email link' },
                { key: 'copy', label: 'Copy link' },
              ],
            },
            { type: 'separator', key: 'sep-2' },
            { key: 'print', label: 'Print…', shortcut: '⌘P' },
          ],
        },
        {
          key: 'edit',
          label: 'Edit',
          items: [
            { key: 'undo', label: 'Undo', shortcut: '⌘Z' },
            { key: 'redo', label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
          ],
        },
        {
          key: 'view',
          label: 'View',
          items: [
            {
              type: 'checkbox',
              key: 'status-bar',
              label: 'Status bar',
              checked: showStatusBar,
              onCheckedChange: setShowStatusBar,
            },
            { type: 'separator', key: 'sep-3' },
            { type: 'label', key: 'zoom-label', label: 'Zoom' },
            {
              type: 'radio-group',
              key: 'zoom',
              value: zoom,
              onValueChange: setZoom,
              items: [
                { value: '75', label: '75%' },
                { value: '100', label: '100%' },
                { value: '150', label: '150%' },
              ],
            },
          ],
        },
      ]}
    />
  )
}
