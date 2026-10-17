import { Bell, ChevronsUpDown, FolderKanban, Home, LifeBuoy, LogOut, Settings, UserRound, Users, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  DropdownMenu,
  Sidebar,
} from '../../src'

interface Page {
  id: string
  title: string
  icon: LucideIcon
  description: string
  rows: { name: string; meta: string; status?: string }[]
}

const pages: Page[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: Home,
    description: 'What changed across your workspace today.',
    rows: [
      { name: 'Release 2.4 went out', meta: '12 minutes ago' },
      { name: 'Grace Hopper joined the team', meta: '2 hours ago' },
      { name: 'Billing API passed all checks', meta: 'Yesterday' },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FolderKanban,
    description: 'Everything your team is building.',
    rows: [
      { name: 'Billing API', meta: 'Updated 3 hours ago', status: 'Live' },
      { name: 'Mobile app', meta: 'Updated yesterday', status: 'In review' },
      { name: 'Design tokens', meta: 'Updated Sep 2', status: 'Live' },
    ],
  },
  {
    id: 'team',
    title: 'Team',
    icon: Users,
    description: 'The people who can open this workspace.',
    rows: [
      { name: 'Ada Lovelace', meta: 'Owner' },
      { name: 'Grace Hopper', meta: 'Admin' },
      { name: 'Linus Torvalds', meta: 'Developer' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    description: 'Names, billing and security for this workspace.',
    rows: [
      { name: 'Workspace name', meta: 'Acme Inc.' },
      { name: 'Plan', meta: 'Pro, 8 of 10 seats' },
      { name: 'Two-factor sign-in', meta: 'Required for everyone' },
    ],
  },
]

export default function AppShell() {
  const [activeId, setActiveId] = useState('overview')
  const page = pages.find((item) => item.id === activeId) ?? pages[0]

  return (
    <Sidebar.Provider className="h-[34rem] min-h-0 w-full max-w-5xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <Sidebar collapsible="icon">
        <Sidebar.Header>
          <div className="flex h-8 items-center gap-2 px-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-default text-xs font-semibold text-background">
              A
            </span>
            <span className="truncate text-sm font-semibold text-foreground">Acme Inc.</span>
          </div>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                {pages.map((item) => (
                  <Sidebar.MenuItem key={item.id}>
                    <Sidebar.MenuButton tooltip={item.title} isActive={item.id === activeId} onClick={() => setActiveId(item.id)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Sidebar.MenuButton>
                    {item.id === 'projects' && <Sidebar.MenuBadge>3</Sidebar.MenuBadge>}
                  </Sidebar.MenuItem>
                ))}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <Sidebar.Group className="mt-auto">
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton tooltip="Help">
                    <LifeBuoy />
                    <span>Help</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <DropdownMenu
                align="start"
                trigger={
                  <Sidebar.MenuButton size="lg" tooltip="Account">
                    <Avatar fallback="AL" className="h-8 w-8 rounded-md text-xs font-medium" />
                    <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                      <span className="truncate text-sm font-medium">Ada Lovelace</span>
                      <span className="truncate text-xs text-foreground-lighter">ada@example.com</span>
                    </span>
                    <ChevronsUpDown className="ml-auto" />
                  </Sidebar.MenuButton>
                }
                items={[
                  { key: 'profile', label: 'Profile', icon: <UserRound className="h-4 w-4" /> },
                  { key: 'sep', type: 'separator' },
                  { key: 'out', label: 'Sign out', icon: <LogOut className="h-4 w-4" /> },
                ]}
              />
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Footer>
        <Sidebar.Rail />
      </Sidebar>

      <Sidebar.Inset className="min-h-0 min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <Sidebar.Trigger />
          <Breadcrumb items={[{ label: 'Acme Inc.', href: '#app-shell' }, { label: page.title }]} />
          <Button size="tiny" variant="text" className="ml-auto" icon={<Bell />} aria-label="Notifications" />
        </header>
        <div className="flex-1 overflow-auto p-6">
          <h4 className="text-xl font-semibold tracking-tight text-foreground">{page.title}</h4>
          <p className="mt-0.5 text-sm text-foreground-light">{page.description}</p>
          <ul className="mt-6 divide-y rounded-lg border bg-surface-75">
            {page.rows.map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium text-foreground">{row.name}</span>
                <span className="flex items-center gap-3 text-foreground-light">
                  {row.meta}
                  {row.status && (
                    <Badge variant={row.status === 'Live' ? 'success' : 'default'} className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal">
                      {row.status}
                    </Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Sidebar.Inset>
    </Sidebar.Provider>
  )
}
