import * as React from 'react'

import { ContextMenu } from '../../../src'

export default function ContextMenuPropsDemo() {
  const [showBookmarks, setShowBookmarks] = React.useState(true)
  const [showFullUrls, setShowFullUrls] = React.useState(false)
  const [person, setPerson] = React.useState('pedro')

  return (
    <ContextMenu
      trigger="Right click here"
      triggerClassName="flex h-37.5 w-75 items-center justify-center rounded-md border border-dashed text-sm"
      className="w-64"
      items={[
        { key: 'back', label: 'Back', shortcut: '⌘[' },
        { key: 'forward', label: 'Forward', shortcut: '⌘]', disabled: true },
        { key: 'reload', label: 'Reload', shortcut: '⌘R' },
        {
          type: 'submenu',
          key: 'more-tools',
          label: 'More Tools',
          items: [
            { key: 'save-page', label: 'Save Page As...', shortcut: '⇧⌘S' },
            { key: 'create-shortcut', label: 'Create Shortcut...' },
            { key: 'name-window', label: 'Name Window...' },
            { type: 'separator', key: 'sep-tools' },
            { key: 'dev-tools', label: 'Developer Tools' },
          ],
        },
        { type: 'separator', key: 'sep-1' },
        {
          type: 'checkbox',
          key: 'show-bookmarks',
          label: 'Show Bookmarks Bar',
          checked: showBookmarks,
          onCheckedChange: setShowBookmarks,
        },
        {
          type: 'checkbox',
          key: 'show-full-urls',
          label: 'Show Full URLs',
          checked: showFullUrls,
          onCheckedChange: setShowFullUrls,
        },
        { type: 'separator', key: 'sep-2' },
        {
          type: 'group',
          key: 'people-group',
          label: 'People',
          items: [
            {
              type: 'radio-group',
              key: 'people',
              value: person,
              onValueChange: setPerson,
              items: [
                { value: 'pedro', label: 'Pedro Duarte' },
                { value: 'colm', label: 'Colm Tuite' },
              ],
            },
          ],
        },
      ]}
    />
  )
}
