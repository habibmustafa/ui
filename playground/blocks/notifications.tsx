import { AtSign, BellOff, CheckCheck, FileText, Receipt, Rocket, UserPlus } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button, EmptyStatePresentational, ScrollArea, Tabs, cn } from '../../src'

interface Notification {
  id: number
  title: string
  detail: string
  when: string
  read: boolean
  icon: ReactNode
}

const initial: Notification[] = [
  { id: 1, title: 'Grace Hopper mentioned you', detail: 'in “Release checklist”', when: '5 minutes ago', read: false, icon: <AtSign /> },
  { id: 2, title: 'Deploy finished', detail: 'production, 38 seconds', when: '1 hour ago', read: false, icon: <Rocket /> },
  { id: 3, title: 'Linus Torvalds invited you', detail: 'to the Kernel workspace', when: '3 hours ago', read: false, icon: <UserPlus /> },
  { id: 4, title: 'Weekly summary is ready', detail: '12 tasks closed, 3 opened', when: 'Yesterday', read: true, icon: <FileText /> },
  { id: 5, title: 'Your invoice is available', detail: 'September, $120.00', when: 'Sep 1', read: true, icon: <Receipt /> },
]

export default function Notifications() {
  const [items, setItems] = useState(initial)
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const unread = items.filter((item) => !item.read).length
  const shown = tab === 'unread' ? items.filter((item) => !item.read) : items
  const markRead = (id: number) => setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-surface-100 shadow-lg">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Notifications</h3>
        <Button
          size="tiny"
          variant="text"
          icon={<CheckCheck />}
          disabled={unread === 0}
          onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}
        >
          Mark all as read
        </Button>
      </div>

      <div className="px-4 pt-1">
        <Tabs
          value={tab}
          onValueChange={setTab}
          classNames={{ list: 'w-fit gap-6', trigger: 'flex-none px-0' }}
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
          className="py-12"
        />
      ) : (
        <ScrollArea aria-label="Notifications" viewportClassName="max-h-96">
          <ul className="divide-y">
            {shown.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  className="focus-ring flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-200"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border [&_svg]:h-4 [&_svg]:w-4',
                      item.read ? 'bg-surface-75 text-foreground-lighter' : 'border-brand-500/40 bg-brand-default/15 text-brand-600'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={cn('text-sm', item.read ? 'text-foreground-light' : 'font-medium text-foreground')}>
                      {item.title}
                      {!item.read && <span className="sr-only"> (unread)</span>}
                    </span>
                    <span className="text-sm text-foreground-light">{item.detail}</span>
                    <span className="mt-1 text-xs text-foreground-lighter">{item.when}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn('mt-2.5 h-2 w-2 shrink-0 rounded-full', item.read ? 'bg-transparent' : 'bg-brand-default')}
                  />
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  )
}
