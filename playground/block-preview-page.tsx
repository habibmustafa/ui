import { Suspense, useEffect } from 'react'
import { BLOCKS } from './blocks/registry'
import { BLOCK_COMPONENTS } from './block-loaders'
import { DEFAULT_STATE, setBuilderState, stateFromQuery } from './theme-store'

/** Rendered at /blocks?preview=<id>, including when opened directly. */
export default function BlockPreviewPage({ id }: { id: string }) {
  // ThemeProvider already follows light/dark changes through same-origin storage events.
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'ui:block-theme') return
      if (typeof event.data.query === 'string') setBuilderState(stateFromQuery(event.data.query) ?? DEFAULT_STATE)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) window.parent.postMessage({ type: 'ui:block-close' }, window.location.origin)
    }
    window.addEventListener('message', receive)
    document.addEventListener('keydown', escape)
    if (window.parent !== window) window.parent.postMessage({ type: 'ui:block-ready' }, window.location.origin)
    return () => { window.removeEventListener('message', receive); document.removeEventListener('keydown', escape) }
  }, [])

  if (!BLOCKS.some((block) => block.id === id)) return <p className="p-6 text-sm">This block could not be found.</p>
  const Block = BLOCK_COMPONENTS[id]
  return <main className="flex min-h-screen items-start justify-center bg-background p-4 text-foreground sm:p-6"><Suspense fallback={null}><Block /></Suspense></main>
}
