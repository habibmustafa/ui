import { CalendarDays, Home, Inbox, Search, Settings } from 'lucide-react'

import {
  Sidebar,
} from '../../../src'

const items = [
  { title: 'Home', icon: Home },
  { title: 'Inbox', icon: Inbox },
  { title: 'Calendar', icon: CalendarDays },
  { title: 'Search', icon: Search },
  { title: 'Settings', icon: Settings },
]

export default function SidebarDemo() {
  return (
    <Sidebar.Provider className="h-90 min-h-0 overflow-hidden rounded-md border">
      <Sidebar collapsible="icon">
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                {items.map((item, index) => (
                  <Sidebar.MenuItem key={item.title}>
                    <Sidebar.MenuButton tooltip={item.title} isActive={index === 0}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                ))}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Rail />
      </Sidebar>
      <Sidebar.Inset className="min-h-0">
        <header className="flex h-12 items-center gap-2 border-b px-3">
          <Sidebar.Trigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <div className="grid flex-1 place-items-center text-sm text-foreground-light">
          Select a navigation item
        </div>
      </Sidebar.Inset>
    </Sidebar.Provider>
  )
}
