import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from 'react'

import { Tabs } from '../src'
import { CodeSnippet } from './code-snippet'

// Examples live one folder per component (./examples/<component>/<name>.tsx), so the
// glob is recursive; call sites still address a demo by its bare file name.
function basename(path: string) {
  return path
    .split('/')
    .pop()!
    .replace(/\.tsx$/, '')
}

/** Anchor id for a labelled preview — shared with the page-contents nav in app.tsx. */
export function previewAnchor(label: string) {
  return `preview-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`
}

function byBasename<T>(modules: Record<string, T>) {
  return Object.fromEntries(Object.entries(modules).map(([path, mod]) => [basename(path), mod]))
}

// Loader functions, not eagerly-imported modules: a `/components/<id>` route only
// pulls in that component's own demos (and whatever they import — recharts, the
// syntax highlighter, …) instead of every example in the registry landing in the
// one chunk every page loads first.
const demoLoaders = byBasename(import.meta.glob<{ default: ComponentType }>('./examples/**/*.tsx'))
const sourceLoaders = byBasename(
  import.meta.glob<string>('./examples/**/*.tsx', {
    query: '?raw',
    import: 'default',
  })
)

const lazyDemos = new Map<string, LazyExoticComponent<ComponentType>>()
function getDemo(name: string) {
  let Demo = lazyDemos.get(name)
  if (!Demo) {
    Demo = lazy(demoLoaders[name] as () => Promise<{ default: ComponentType }>)
    lazyDemos.set(name, Demo)
  }
  return Demo
}

// The examples import from the library source; show the package name instead so
// the snippet reads the way a consumer would write it.
function presentSource(source: string) {
  return source.replace(/(['"])(?:\.\.\/)+src\1/g, "'@habibmustafa/ui'").trim()
}

function CodeTab({ name }: { name: string }) {
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setSource(null)
    sourceLoaders[name]?.().then((raw) => {
      if (active) setSource(presentSource(raw))
    })
    return () => {
      active = false
    }
  }, [name])

  return <CodeSnippet code={source ?? ''} />
}

function PreviewPane({ Demo }: { Demo: ComponentType }) {
  return (
    <div className="relative overflow-hidden rounded-md border bg-studio">
      <div className="z-0 pointer-events-none absolute h-full w-full bg-[radial-gradient(oklch(from_var(--foreground-default)_l_c_h_/_0.02)_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="z-10 relative">
        <div className="preview flex min-h-64 w-full flex-wrap items-center justify-center gap-3 p-10">
          <Demo />
        </div>
      </div>
    </div>
  )
}

export interface ComponentPreviewCodeVariant {
  id: string
  label: string
  /** Example file (without extension) this tab's code comes from. */
  name: string
}

/**
 * True once the element is within ~1.5 screens of the viewport (and from then on).
 * Long component pages mount a dozen live demos; rendering only the ones near the
 * screen keeps navigation and first paint fast. Without IntersectionObserver (tests,
 * old browsers) everything renders immediately.
 */
function useNearViewport(): [(element: HTMLElement | null) => void, boolean] {
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')
  const observer = useRef<IntersectionObserver | null>(null)
  const ref = useCallback(
    (element: HTMLElement | null) => {
      observer.current?.disconnect()
      if (!element || near) return
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setNear(true)
            observer.current?.disconnect()
          }
        },
        { rootMargin: '150% 0px' }
      )
      observer.current.observe(element)
    },
    [near]
  )
  useEffect(() => () => observer.current?.disconnect(), [])
  return [ref, near]
}

/** Starts downloading a demo's module (hover/focus prefetch of a component page). */
export function prefetchDemo(name: string) {
  void demoLoaders[name]?.()
}

export function ComponentPreview({
  name,
  label,
  codeVariants,
}: {
  name: string
  label?: string
  /** Paired examples show the props-driven preview and separate source tabs. */
  codeVariants?: ComponentPreviewCodeVariant[]
}) {
  const variants = codeVariants ?? [{ id: 'code', label: 'Code', name }]
  const [nearRef, near] = useNearViewport()

  if (!demoLoaders[name]) {
    return (
      <p className="text-sm text-destructive">
        Missing example: <code className="font-mono">{name}.tsx</code>
      </p>
    )
  }

  const Demo = getDemo(name)

  // Anchor for the page-contents nav, which derives the same id from the same label.
  const slug = label ? previewAnchor(label) : undefined

  return (
    <div ref={nearRef} id={slug} className="@container mt-4 mb-12 scroll-mt-20">
      {label ? (
        <p className="mb-2 font-mono text-xs uppercase text-foreground-muted">{label}</p>
      ) : null}

      {!near ? (
        // Same footprint as the tabs + preview pane, so nothing shifts when it mounts.
        <div aria-hidden="true" className="flex flex-col gap-2">
          <div className="h-9 border-b" />
          <div className="min-h-64 rounded-md border bg-studio" />
        </div>
      ) : (
        <Tabs.Root defaultValue="preview">
          <Tabs.List className="gap-5">
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            {variants.map((variant) => (
              <Tabs.Trigger key={variant.id} value={variant.id}>
                {variant.label}
              </Tabs.Trigger>
            ))}
            <Tabs.Indicator />
          </Tabs.List>

          <Tabs.Content value="preview">
            <Suspense fallback={<div className="min-h-64" />}>
              <PreviewPane Demo={Demo} />
            </Suspense>
          </Tabs.Content>

          {variants.map((variant) => (
            <Tabs.Content key={variant.id} value={variant.id}>
              <CodeTab name={variant.name} />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </div>
  )
}
