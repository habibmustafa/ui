import { Suspense, lazy, type ComponentType } from 'react'

import { Tabs } from '../src'
import { PreviewSurface } from './preview-surface'
import { demoLoaders, getDemo } from './demo-loaders'
import { useNearViewport } from './near-viewport'
export { getDemo, prefetchDemo } from './demo-loaders'
export { useNearViewport } from './near-viewport'

const loadCode = () => import('./example-code')
const CodeTab = lazy(loadCode)

/** Anchor id for a labelled preview — shared with the page-contents nav in app.tsx. */
export function previewAnchor(label: string) {
  return `preview-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`
}

function PreviewPane({ Demo }: { Demo: ComponentType }) {
  return (
    <PreviewSurface><Demo /></PreviewSurface>
  )
}

export interface ComponentPreviewCodeVariant {
  id: string
  label: string
  /** Example file (without extension) this tab's code comes from. */
  name: string
}

export function ComponentPreview({
  name,
  label,
  codeVariants,
  eager = false,
}: {
  name: string
  eager?: boolean
  label?: string
  /** Paired examples show the props-driven preview and separate source tabs. */
  codeVariants?: ComponentPreviewCodeVariant[]
}) {
  const variants = codeVariants ?? [{ id: 'code', label: 'Code', name }]
  const [nearRef, near] = useNearViewport({ initial: eager })

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
    <div ref={nearRef} id={slug} className="@container mt-4 mb-12 scroll-mt-32">
      {label ? (
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{label}</h2>
      ) : null}

      {!near ? (
        // Same footprint as the tabs + preview pane, so nothing shifts when it mounts.
        <div aria-hidden="true" className="flex flex-col gap-2">
          <div className="h-9 border-b" />
          <div className="min-h-80 rounded-xl border bg-studio" />
        </div>
      ) : (
        <Tabs
          layout="inline"
          classNames={{ list: 'gap-5' }}
          items={[
            {
              value: 'preview',
              label: 'Preview',
              content: (
                <Suspense fallback={<div className="min-h-64" />}>
                  <PreviewPane Demo={Demo} />
                </Suspense>
              ),
            },
            ...variants.map((variant) => ({
              value: variant.id,
              label: variant.label,
              triggerProps: { onMouseEnter: () => { void loadCode() }, onFocus: () => { void loadCode() } },
              content: <Suspense fallback={<div className="min-h-64" />}><CodeTab name={variant.name} /></Suspense>,
            })),
          ]}
        />
      )}
    </div>
  )
}
