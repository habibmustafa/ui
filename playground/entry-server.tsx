import { prerender } from 'react-dom/static'

import { ThemeProvider } from '../src'
import { App, documentTitle } from './app'
import { COMPONENT_GROUPS } from './registry'
import { RouterProvider } from './router'
import { PAGES } from './site-pages'
import { BLOCKS } from './blocks/registry'
import { CATALOG } from './catalog'

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
  ...BLOCKS.map((block) => `/blocks/${block.id}`),
]

// Used by the static build to put critical modules in the HTML preload scanner,
// avoiding app → route → observer → demo request waterfalls on a cold visit.
export function criticalModules(path: string): string[] {
  const pages: Record<string, string> = {
    '/': 'home', '/getting-started': 'getting-started', '/components': 'components-index',
    '/blocks': 'blocks', '/theme': 'theme-builder',
  }
  const examples = Object.keys(import.meta.glob('./examples/**/*.tsx'))
  const exampleModule = (name: string) => {
    const file = examples.find(file => file.endsWith(`/${name}.tsx`))
    return file ? [`playground/${file.slice(2)}`] : []
  }
  if (pages[path]) return [
    `playground/pages/${pages[path]}.tsx`,
    ...(path === '/blocks' ? BLOCKS.slice(0, 3).map(block => `playground/blocks/${block.id}.tsx`) : []),
    ...(path === '/components' ? CATALOG[0].entries.slice(0, 3).flatMap(entry => exampleModule(entry.previews[0].name)) : []),
  ]
  if (path.startsWith('/blocks/')) return ['playground/pages/block-detail.tsx']
  if (!path.startsWith('/components/')) return []
  const entry = COMPONENT_GROUPS.flatMap(group => group.entries).find(entry => path === `/components/${entry.id}`)
  return ['playground/pages/component-page.tsx', ...(entry ? exampleModule(entry.previews[0].name) : [])]
}

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
