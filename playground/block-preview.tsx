import { Suspense, useEffect, useRef, useState } from 'react'

import { BLOCK_COMPONENTS } from './block-loaders'
import { CodeSnippet } from './code-snippet'
import { useNearViewport } from './near-viewport'
import { type BlockMeta } from './blocks/registry'
import { stateToQuery, useThemeBuilder } from './theme-store'

const sources = import.meta.glob<string>('./blocks/*.tsx', { query: '?raw', import: 'default' })

export function BlockCode({ id }: { id: string }) {
  const [source, setSource] = useState('')
  useEffect(() => {
    let active = true
    setSource('')
    sources[`./blocks/${id}.tsx`]?.().then((raw) => {
      if (active) setSource(raw.replace(/(['"])(?:\.\.\/)+src\1/g, "'@habibmustafa/ui'").trim())
    })
    return () => { active = false }
  }, [id])
  return <CodeSnippet code={source} maxHeight={650} />
}

/** Real screen content, made inert so the surrounding gallery link is the only target. */
export function BlockThumbnail({ block, eager = false }: { block: BlockMeta; eager?: boolean }) {
  const [nearRef, near] = useNearViewport({ initial: eager, once: false, margin: '500px 0px' })
  const container = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.42)
  const Block = BLOCK_COMPONENTS[block.id]

  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) => setScale((entry.contentRect.width - 32) / 760))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={nearRef} aria-hidden="true" inert className="relative h-56 overflow-hidden border-b bg-surface-75">
      <div ref={container} className="h-full w-full">
        {near && <div className="absolute left-1/2 top-5 flex w-[760px] origin-top items-start justify-center" style={{ transform: `translateX(-50%) scale(${scale})` }}>
          <Suspense fallback={null}><Block /></Suspense>
        </div>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-surface-75 to-transparent" />
    </div>
  )
}

/** An actual browsing context: media queries and portalled overlays use the chosen width. */
export function BlockFrame({ block, width, onClose }: { block: BlockMeta; width: number; onClose?: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = useState<number | null>(null)
  const { state } = useThemeBuilder()
  const query = stateToQuery(state)
  const scale = availableWidth === null ? 1 : Math.min(1, availableWidth / (width + 2))

  useEffect(() => {
    if (!canvas.current) return
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width))
    observer.observe(canvas.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const syncTheme = () => frame.current?.contentWindow?.postMessage({ type: 'ui:block-theme', query }, window.location.origin)
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (event.data?.type === 'ui:block-ready') syncTheme()
      if (event.data?.type === 'ui:block-close') onClose?.()
    }
    window.addEventListener('message', receive)
    syncTheme()
    return () => window.removeEventListener('message', receive)
  }, [query, onClose])

  return (
    <div ref={canvas} className="overflow-auto rounded-xl border bg-surface-200 p-3 sm:p-5">
      {/* Fit the screen to small dialogs while preserving its actual CSS viewport. */}
      <div className="relative mx-auto" style={{ width: (width + 2) * scale, height: 562 * scale }}>
        <iframe
          ref={frame}
          title={`${block.title} live preview`}
          src={`/playground/block-frame.html?preview=${block.id}`}
          className="absolute left-0 top-0 block box-content h-[560px] max-w-none origin-top-left rounded-lg border bg-background shadow-sm"
          style={{ width, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  )
}

