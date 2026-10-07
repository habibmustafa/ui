import { Suspense, lazy } from 'react'

import { ComponentPreview, previewAnchor } from '../component-preview'
import { PageHeader } from '../page-header'
import { findComponent, type ComponentPreviewSpec } from '../registry'
import { Navigate } from '../router'

// The generated props data is ~140KB; keep it out of this chunk until the API
// section is actually rendered.
const ApiReference = lazy(() => import('../api-reference'))

const contentsLink =
  'focus-ring rounded-sm text-foreground-light transition-colors hover:text-foreground'

/**
 * Jumps to the labelled previews on a page (Button's "Variants", "Sizes", …) and to
 * the API section. Anchors match the ids ComponentPreview derives from the same
 * labels; previews are only listed when there are at least two labelled ones.
 */
function PageContents({ previews }: { previews: ComponentPreviewSpec[] }) {
  const labelled = previews.filter((preview) => preview.label)

  return (
    <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-1 border-b pb-4 text-sm">
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
      <PageHeader title={entry.title} description={entry.description} />
      <PageContents previews={entry.previews} />
      {entry.previews.map((preview) => (
        <ComponentPreview key={preview.name} {...preview} />
      ))}
      <Suspense fallback={null}>
        <ApiReference id={entry.id} />
      </Suspense>
    </div>
  )
}

