import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react'

/*
 * Minimal path router for the playground — no runtime dependency (decision #9
 * precedent: clsx+tailwind-merge over the `cn` package). The dev server's built-in
 * SPA fallback serves index.html for any path without a file extension, so deep
 * links like /components/dialog work on a hard refresh.
 */

interface RouterContextValue {
  path: string
  navigate: (to: string, options?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

function normalizePath(path: string) {
  // Treat "/", "/x/" and "/x" as the same route; keep query strings intact.
  const [pathname, query = ''] = path.split('?')
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return query ? `${normalized}?${query}` : normalized
}

function currentPath() {
  // Include the query: pages read state from it (e.g. /components?group=forms).
  return normalizePath(window.location.pathname + window.location.search)
}

export function RouterProvider({
  children,
  initialPath,
}: {
  children: ReactNode
  /**
   * The path to render first instead of reading window.location: the route being
   * prerendered on the server, or, when hydrating, the path that HTML was rendered for
   * (it has no query string). The real location is applied right after mount.
   */
  initialPath?: string
}) {
  const [path, setPath] = useState(() =>
    initialPath === undefined ? currentPath() : normalizePath(initialPath)
  )

  useEffect(() => {
    const actual = currentPath()
    if (actual !== path) setPath(actual)
    // Mount only: afterwards navigate() and popstate keep the path in sync.
  }, [])

  useEffect(() => {
    const onPop = () => setPath(currentPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const next = normalizePath(to)
    if (next === currentPath()) {
      // Same route: scroll to top so a nav click always re-orients the reader.
      window.scrollTo({ top: 0 })
      return
    }
    if (options?.replace) {
      window.history.replaceState(null, '', next)
    } else {
      window.history.pushState(null, '', next)
    }
    setPath(next)
  }, [])

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside <RouterProvider>')
  return ctx
}

let prefetcher: ((to: string) => void) | null = null

/**
 * Registers what to warm up when a link is about to be used (hover, focus, touch):
 * the app passes a function that starts loading the target route's code.
 */
export function setPrefetcher(fn: (to: string) => void) {
  prefetcher = fn
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  replace?: boolean
}

export function Link({
  to,
  replace,
  onClick,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: LinkProps) {
  const { navigate } = useRouter()
  return (
    <a
      href={to}
      onMouseEnter={(event) => {
        prefetcher?.(to)
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        prefetcher?.(to)
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        prefetcher?.(to)
        onTouchStart?.(event)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        // Modifier-click keeps the browser's own tab/window behaviour.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
          return
        event.preventDefault()
        navigate(to, { replace })
      }}
      {...props}
    />
  )
}

/** Imperative redirect (e.g. "/" → the first page). */
export function Navigate({ to, replace = true }: { to: string; replace?: boolean }) {
  const { navigate } = useRouter()
  useEffect(() => {
    navigate(to, { replace })
  }, [navigate, to, replace])
  return null
}
