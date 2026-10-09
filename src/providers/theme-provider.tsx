'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import { createTheme, themeToCss, type ThemeConfig, type ThemeTokens } from '../theme'

export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** What the user picked, including 'system'. */
  theme: Theme
  /** The theme actually applied to the document. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

function readStoredTheme(storageKey: string): Theme | null {
  try {
    const stored = localStorage.getItem(storageKey)
    return isTheme(stored) ? stored : null
  } catch {
    // Storage can throw in private mode or when cookies are blocked.
    return null
  }
}

/*
 * The stored choice and the OS preference are read through useSyncExternalStore rather
 * than a useState initializer. On the server, and while hydrating server-rendered HTML,
 * React uses the server snapshots (nothing stored, light system theme), so the first
 * client render matches the markup; it then re-renders with the real values before the
 * browser paints. A purely client-rendered app reads the real values straight away.
 */
const storedThemeListeners = new Set<() => void>()

function subscribeStoredTheme(listener: () => void) {
  storedThemeListeners.add(listener)
  // Another tab changing the theme.
  window.addEventListener('storage', listener)
  return () => {
    storedThemeListeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function subscribeSystemTheme(listener: () => void) {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
const getServerSystemTheme = (): ResolvedTheme => 'light'
const getServerStoredTheme = (): Theme | null => null
const subscribeNothing = () => () => {}

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  /**
   * Custom colors, radius and fonts: a `createTheme()` result or the config itself.
   * Rendered as a <style> next to the children, so it also works when server-rendered.
   */
  tokens?: ThemeTokens | ThemeConfig
}

/*
 * A theme swap changes every color at once. Without this, each element's own
 * `transition-colors` animates that change, and the browser restyles the whole page on
 * every frame of it: changing the brand color took about a second on a mid-range laptop.
 * Call it after the new theme is in the DOM but before the browser has styled it, and only
 * for a change: the first theme has nothing to animate from, and forcing a restyle while
 * hydrating would only slow the page down.
 */
function applyWithoutTransitions() {
  const style = document.createElement('style')
  style.textContent = '*,*::before,*::after{transition:none!important}'
  document.head.appendChild(style)
  // Style the page now, with transitions off, so the new colors land without animating.
  void window.getComputedStyle(document.body).color
  style.remove()
}

/**
 * Renders theme tokens as a <style>. ThemeProvider does this for its `tokens` prop;
 * use it directly to theme part of an app's lifetime (e.g. a live preview) without a
 * second provider.
 */
export function ThemeStyle({ tokens }: { tokens: ThemeTokens | ThemeConfig }) {
  const css = useMemo(
    () => themeToCss('shared' in tokens ? tokens : createTheme(tokens)),
    [tokens]
  )
  const appliedCss = useRef(css)
  useLayoutEffect(() => {
    if (appliedCss.current !== css) applyWithoutTransitions()
    appliedCss.current = css
  }, [css])
  if (!css) return null
  return <style data-ui-theme="">{css}</style>
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  tokens,
}: ThemeProviderProps) {
  const storedTheme = useSyncExternalStore(
    subscribeStoredTheme,
    () => readStoredTheme(storageKey),
    getServerStoredTheme
  )
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    getServerSystemTheme
  )
  // Only used when the choice could not be persisted (blocked storage): the theme still
  // applies for this visit.
  const [unsavedTheme, setUnsavedTheme] = useState<Theme | null>(null)
  const theme = unsavedTheme ?? storedTheme ?? defaultTheme

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme
  // False only while hydrating, when resolvedTheme is still the server's guess.
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)

  useEffect(() => {
    // Writing the server's guess would flip a dark page to light and straight back.
    if (!hydrated) return
    const root = document.documentElement
    // Usually already set before first paint by the app's inline script.
    const changed = root.getAttribute('data-theme') !== resolvedTheme

    // The token blocks key off `.light` / `.dark`, while the `dark:` variant keys
    // off `data-theme*="dark"` — both have to be set for utilities and tokens to agree.
    root.setAttribute('data-theme', resolvedTheme)
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.classList.toggle('light', resolvedTheme === 'light')
    root.style.colorScheme = resolvedTheme
    if (changed) applyWithoutTransitions()
  }, [resolvedTheme, hydrated])

  const setTheme = useCallback(
    (next: Theme) => {
      let saved = false
      try {
        localStorage.setItem(storageKey, next)
        saved = true
      } catch {
        // Persisting is best-effort; the in-memory theme still applies.
      }
      setUnsavedTheme(saved ? null : next)
      storedThemeListeners.forEach((listener) => listener())
    },
    [storageKey]
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeContext value={value}>
      {tokens && <ThemeStyle tokens={tokens} />}
      {children}
    </ThemeContext>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside a <ThemeProvider>')
  }

  return context
}
