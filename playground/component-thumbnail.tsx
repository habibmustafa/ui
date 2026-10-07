import { Suspense, type ComponentType } from 'react'

import { Skeleton } from '../src'
import { getDemo, useNearViewport } from './component-preview'

/*
 * A live, miniature copy of a component's first example, for the gallery. It is the real
 * component, not a screenshot: mounted only once the card is near the screen (like the
 * previews on a component page), scaled down inside a box that is made proportionally
 * larger first so the example lays out as it would on a real page, and made inert so it
 * can't take focus or react to the mouse. The card around it is the link.
 */

/** Examples that need more room than the default scale gives them. */
const SCALE: Record<string, number> = {
  calendar: 0.55,
  'date-range-picker': 0.55,
  'date-picker': 0.6,
  'data-table': 0.45,
  table: 0.55,
  chart: 0.4,
  'form-fields': 0.5,
  form: 0.55,
  carousel: 0.6,
  resizable: 0.55,
  sidebar: 0.4,
  menubar: 0.8,
  'navigation-menu': 0.8,
  'code-block': 0.6,
  'metric-card': 0.65,
  'multi-select': 0.65,
  'time-picker': 0.65,
  'virtual-list': 0.6,
  marquee: 0.7,
  result: 0.6,
  descriptions: 0.55,
  stepper: 0.65,
}

function Stage({ Demo, scale }: { Demo: ComponentType; scale: number }) {
  return (
    <div
      className="preview absolute left-0 top-0 flex flex-wrap items-center justify-center gap-3 p-6"
      style={{
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
      }}
    >
      <Suspense fallback={<Skeleton className="h-10 w-40" />}>
        <Demo />
      </Suspense>
    </div>
  )
}

export function ComponentThumbnail({ id, name }: { id: string; name: string }) {
  const [ref, near] = useNearViewport()
  const Demo = getDemo(name)

  return (
    <div
      ref={ref}
      aria-hidden="true"
      inert
      className="relative h-44 overflow-hidden border-b bg-surface-75"
    >
      {near ? <Stage Demo={Demo} scale={SCALE[id] ?? 0.75} /> : null}
    </div>
  )
}
