import { createRoot, hydrateRoot } from 'react-dom/client'

import { ThemeProvider } from '../src'
import { App } from './app'
import { RouterProvider } from './router'

const container = document.getElementById('root')!
// /blocks HTML contains the gallery. An embedded preview must never hydrate
// that gallery, mount its cards, then throw all of it away to show one block.
if (window.location.pathname.replace(/\/$/, '') === '/blocks' && new URLSearchParams(window.location.search).has('preview')) {
  container.replaceChildren()
}

// Routes prerendered at build time (scripts/prerender.mjs) arrive with their HTML: keep
// it and hydrate. That HTML was rendered for the bare pathname, so hydration starts from
// it; the router applies any query string right after. The 404 shell has an empty root
// and renders from scratch.
if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <ThemeProvider>
      <RouterProvider initialPath={window.location.pathname}>
        <App />
      </RouterProvider>
    </ThemeProvider>
  )
} else {
  createRoot(container).render(
    <ThemeProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </ThemeProvider>
  )
}
