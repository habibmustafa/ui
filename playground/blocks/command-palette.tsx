import { FolderKanban, FolderPlus, Home, Moon, Search, Settings, UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button, Command, Kbd } from '../../src'

const icon = 'mr-2 h-4 w-4'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const run = (label: string) => () => {
    setPicked(label)
    setOpen(false)
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Acme Inc.</span>
        <Button className="ml-auto min-w-48 justify-between" icon={<Search />} onClick={() => setOpen(true)}>
          <span className="flex-1 text-left text-foreground-light">Search or jump to</span>
          <Kbd>Ctrl K</Kbd>
        </Button>
      </div>

      <div className="px-6 py-12 text-center" aria-live="polite">
        <p className="text-sm font-medium text-foreground">{picked ? picked : 'Nothing picked yet'}</p>
        <p className="mt-1 text-sm text-foreground-light">
          {picked ? 'That is what the palette just ran.' : 'Open the palette and choose a page or an action.'}
        </p>
      </div>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        placeholder="Type a command or search"
        emptyText="Nothing matches. Try a shorter word."
        groups={[
          {
            key: 'pages',
            heading: 'Go to',
            items: [
              { key: 'overview', label: 'Overview', icon: <Home className={icon} />, onSelect: run('Opened Overview') },
              { key: 'projects', label: 'Projects', icon: <FolderKanban className={icon} />, onSelect: run('Opened Projects') },
              { key: 'team', label: 'Team', icon: <Users className={icon} />, onSelect: run('Opened Team') },
              { key: 'settings', label: 'Settings', icon: <Settings className={icon} />, shortcut: 'G S', onSelect: run('Opened Settings') },
            ],
          },
          {
            key: 'actions',
            heading: 'Actions',
            items: [
              { key: 'invite', label: 'Invite a member', icon: <UserPlus className={icon} />, shortcut: 'I', onSelect: run('Started an invitation') },
              { key: 'project', label: 'Create a project', icon: <FolderPlus className={icon} />, shortcut: 'C', onSelect: run('Started a new project') },
              { key: 'theme', label: 'Switch theme', icon: <Moon className={icon} />, onSelect: run('Switched the theme') },
            ],
          },
        ]}
      />
    </div>
  )
}
