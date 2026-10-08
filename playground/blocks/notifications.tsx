import { BellOff } from 'lucide-react'
import { useState } from 'react'

import { Button, EmptyStatePresentational, ScrollArea, Tabs, cn } from '../../src'

interface Notification {
  id: number
  title: string
  detail: string
  when: string
  read: boolean
}

const initial: Notification[] = [
  { id: 1, title: 'Grace Hopper mentioned you', detail: 'in “Release checklist”', when: '5 minutes ago', read: false },
  { id: 2, title: 'Deploy finished', detail: 'production, 38 seconds', when: '1 hour ago', read: false },
  { id: 3, title: 'Linus Torvalds invited you', detail: 'to the Kernel workspace', when: '3 hours ago', read: false },
  { id: 4, title: 'Weekly summary is ready', detail: '12 tasks closed, 3 opened', when: 'Yesterday', read: true },
  { id: 5, title: 'Your invoice is available', detail: 'September, $120.00', when: 'Sep 1', read: true },
]

export default function Notifications() {
  const [items, setItems] = useState(initial)
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const unread = items.filter((item) => !item.read).length
  const shown = tab === 'unread' ? items.filter((item) => !item.read) : items
  const markRead = (id: number) => setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))

  return (
    <div className="w-full max-w-md rounded-lg border bg-surface-75">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 className="text-sm font-medium text-foreground">Notifications</h3>
        <Button
          size="tiny"
          variant="text"
          disabled={unread === 0}
          onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}
        >
          Mark all as read
        </Button>
      </div>

      <div className="px-4 pt-2">
        <Tabs
          value={tab}
          onValueChange={setTab}
          items={[
            { value: 'all', label: 'All', content: null },
            { value: 'unread', label: unread ? `Unread (${unread})` : 'Unread', content: null },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyStatePresentational
          icon={<BellOff />}
          title="You are all caught up"
          description="New activity shows up here as it happens."
          className="py-10"
        />
      ) : (
        <ScrollArea aria-label="Notifications" viewportClassName="max-h-80">
          <ul className="divide-y">
            {shown.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  className="focus-ring flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-100"
                >
                  <span
                    aria-hidden="true"
                    className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', item.read ? 'bg-transparent' : 'bg-brand-default')}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className={cn('text-sm', item.read ? 'text-foreground-light' : 'font-medium text-foreground')}>
                      {item.title}
                      {!item.read && <span className="sr-only"> (unread)</span>}
                    </span>
                    <span className="text-sm text-foreground-light">{item.detail}</span>
                    <span className="mt-0.5 text-xs text-foreground-lighter">{item.when}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  )
}
