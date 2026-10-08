import { prerender } from 'react-dom/static'

import { ThemeProvider } from '../src'
import { App, documentTitle } from './app'
import { COMPONENT_GROUPS } from './registry'
import { RouterProvider } from './router'
import { PAGES } from './site-pages'

/*
 * Server entry for the static prerender (scripts/prerender.mjs, run by
 * `npm run build:playground`). Every route below is rendered to HTML at build time, so
 * the browser paints the page before any JavaScript has loaded; main.tsx then hydrates
 * it. Rendering here must match the client's first render exactly: anything read from
 * localStorage, matchMedia or window.location belongs in an effect or behind a
 * useSyncExternalStore server snapshot, never in render.
 */

export const ROUTES: string[] = [
  ...PAGES.map((page) => page.to),
  ...COMPONENT_GROUPS.flatMap((group) => group.entries).map((entry) => `/components/${entry.id}`),
]

export async function render(path: string): Promise<{ html: string; title: string }> {
  const errors: unknown[] = []
  // prerender waits for every lazy page and Suspense boundary; a promise that never
  // settles would hang the build, so give up loudly instead.
  const signal = AbortSignal.timeout(30_000)
  const { prelude } = await prerender(
    <ThemeProvider>
      <RouterProvider initialPath={path}>
        <App />
      </RouterProvider>
    </ThemeProvider>,
    {
      signal,
      onError: (error) => void errors.push(error),
      // By default React streams any boundary over ~12 kB out of order: hidden in a
      // <div hidden id="S:…"> and moved into place by an inline <script>. Nothing streams
      // here, so keep every boundary inline and the HTML plain.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
    }
  )
  if (errors.length > 0) {
    throw new AggregateError(errors, `Prerendering ${path} failed`)
  }
  const html = await new Response(prelude).text()
  if (html.includes('<!--$?-->') || html.includes('<!--$!-->')) {
    throw new Error(`Prerendering ${path} left a Suspense boundary unresolved`)
  }
  return { html, title: documentTitle(path) }
}
