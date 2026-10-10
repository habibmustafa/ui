'use client'

import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'

import { cn } from '../../../lib/utils'
import { useTheme, type Theme } from '../../../providers'
import { useLabels } from '../../../providers/locale-provider'
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '../../atoms/overlay/dropdown-menu'

interface ThemeToggleProps {
  forceDark?: boolean
  triggerClassName?: string
  contentClassName?: string
}

const ICONS: Record<Theme, typeof Sun> = {
  system: Monitor,
  dark: Moon,
  light: Sun,
}

const THEME_LABEL = { system: 'themeSystem', dark: 'themeDark', light: 'themeLight' } as const

const noopSubscribe = () => () => {}

export const ThemeToggle = ({
  forceDark = false,
  triggerClassName,
  contentClassName,
}: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const labels = useLabels()
  const [open, setOpen] = useState(false)
  // The stored theme is only known on the client, so render nothing during SSR and
  // hydration (server snapshot false) and the real control once on the client — without
  // the effect + state round-trip this used to take.
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )

  const currentTheme = forceDark ? 'dark' : theme

  if (!isMounted) return null

  const currentThemeName = labels[THEME_LABEL[currentTheme as Theme] ?? 'themeSystem']

  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild disabled={forceDark}>
        <button
          id="user-settings-dropdown"
          type="button"
          aria-label={labels.themeLabel(currentThemeName)}
          className={cn(
            'focus-ring inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-strong bg-background px-2.5 text-xs text-foreground-light transition-colors hover:border-control-hover hover:bg-surface-100 hover:text-foreground data-[state=open]:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-50',
            triggerClassName
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 shrink-0" />
          ) : (
            <Sun className="h-4 w-4 shrink-0" />
          )}
          <span>{currentThemeName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground-lighter" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn('w-40', contentClassName)}>
        <DropdownMenuLabel>{labels.appearance}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={currentTheme}
            onValueChange={(value) => {
              setTheme(value as Theme)
            }}
          >
            {(Object.keys(THEME_LABEL) as Theme[]).map((value) => {
              const Icon = ICONS[value]
              return (
                <DropdownMenuRadioItem key={value} value={value}>
                  <Icon className="mr-2 h-3.5 w-3.5 text-foreground-lighter" />
                  {labels[THEME_LABEL[value]]}
                </DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}
