import { useSyncExternalStore } from 'react'

import { cn, ToggleGroup } from '../src'
import { SnippetCopyButton } from './code-snippet'

/*
 * One install line with a package-manager switch. The choice is shared by every
 * install command on the site and remembered across visits.
 */

const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const
type Manager = (typeof MANAGERS)[number]

const STORAGE_KEY = 'ui-package-manager'
const listeners = new Set<() => void>()

function read(): Manager {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (MANAGERS.includes(stored as Manager)) return stored as Manager
  } catch {
    // Storage blocked (private mode, sandbox): fall back to npm.
  }
  return 'npm'
}

let current: Manager = typeof window === 'undefined' ? 'npm' : read()

function setManager(next: Manager) {
  current = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Not persisted; the choice still applies for this visit.
  }
  listeners.forEach((listener) => listener())
}

function usePackageManager() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
    () => 'npm' as Manager
  )
}

function commandFor(manager: Manager, packages: string, dev: boolean) {
  const verb = manager === 'npm' ? 'i' : 'add'
  const flag = dev ? ' -D' : ''
  return `${manager} ${verb}${flag} ${packages}`
}

export function InstallCommand({
  packages,
  dev = false,
  className,
}: {
  /** Space-separated package names. */
  packages: string
  dev?: boolean
  className?: string
}) {
  const manager = usePackageManager()
  const command = commandFor(manager, packages, dev)

  return (
    <div className={cn('overflow-hidden rounded-md border bg-surface-75/75', className)}>
      <div className="flex items-center border-b px-2 py-1.5">
        <ToggleGroup.Root
          type="single"
          variant="segmented"
          size="tiny"
          value={manager}
          onValueChange={(value) => value && setManager(value as Manager)}
          allowDeselect={false}
          aria-label="Package manager"
        >
          {MANAGERS.map((name) => (
            <ToggleGroup.Item key={name} value={name} className="px-2 font-mono text-xs">
              {name}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>
      <div className="relative">
        <SnippetCopyButton value={command} className="top-1.5" />
        <pre className="overflow-x-auto px-4 py-3 pr-12 font-mono text-sm">
          <span aria-hidden="true" className="select-none text-foreground-muted">
            ${' '}
          </span>
          <span className="text-foreground">{command}</span>
        </pre>
      </div>
    </div>
  )
}
