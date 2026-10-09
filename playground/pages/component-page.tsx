import { Suspense, lazy } from 'react'

import { ComponentPreview, previewAnchor } from '../component-preview'
import { ComponentPlayground, hasPlayground } from '../component-playground'
import { PageHeader } from '../page-header'
import { findComponent, type ComponentPreviewSpec } from '../registry'
import { Navigate } from '../router'

// The generated props data is ~140KB; keep it out of this chunk until the API
// section is actually rendered.
const ApiReference = lazy(() => import('../api-reference'))

const contentsLink =
  'focus-ring shrink-0 rounded-md px-2.5 py-2 text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground'

/**
 * Jumps to the labelled previews on a page (Button's "Variants", "Sizes", …) and to
 * the API section. Anchors match the ids ComponentPreview derives from the same
 * labels; previews are only listed when there are at least two labelled ones.
 */
function PageContents({ previews, playground }: { previews: ComponentPreviewSpec[]; playground: boolean }) {
  const labelled = previews.filter((preview) => preview.label)

  return (
    <nav aria-label="On this page" className="sticky top-14 z-30 -mx-1 mb-8 flex gap-1 overflow-x-auto border-b bg-studio/95 px-1 py-2 text-xs backdrop-blur-sm">
      {playground && <a href="#playground" className={contentsLink}>Playground</a>}
      {labelled.length >= 2
        ? labelled.map((preview) => (
            <a
              key={preview.name}
              href={`#${previewAnchor(preview.label!)}`}
              className={contentsLink}
            >
              {preview.label}
            </a>
          ))
        : null}
      <a href="#api" className={contentsLink}>
        API
      </a>
    </nav>
  )
}

export default function ComponentPage({ id }: { id: string }) {
  const entry = findComponent(id)

  if (!entry) {
    return <Navigate to="/" />
  }

  return (
    <div>
      <PageHeader title={entry.title} description={entry.description} eyebrow="Components" />
      <PageContents previews={entry.previews} playground={hasPlayground(id)} />
      {hasPlayground(id) && <ComponentPlayground key={id} id={id} />}
      {entry.previews.map((preview, index) => (
        <ComponentPreview key={preview.name} {...preview} eager={index === 0} />
      ))}
      <Suspense fallback={null}>
        <ApiReference id={entry.id} />
      </Suspense>
    </div>
  )
}

