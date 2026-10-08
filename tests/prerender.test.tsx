// The playground is prerendered at build time (playground/entry-server.tsx,
// scripts/prerender.mjs) and hydrated by main.tsx. Hydration only keeps that HTML if the
// client's first render matches it exactly; a page that reads localStorage, matchMedia or
// window.location during render would make React throw it away (or, for attributes,
// silently keep the wrong ones). This renders representative routes on the "server",
// hydrates them, and fails on any hydration error or warning React reports.
import { act } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { afterEach, expect, test, vi } from 'vitest'

import { ThemeProvider } from '../src'
import { App } from '../playground/app'
import { render as prerenderRoute, ROUTES } from '../playground/entry-server'
import { RouterProvider } from '../playground/router'

const SAMPLE = [
  '/',
  '/getting-started',
  '/components',
  '/blocks',
  '/theme',
  '/colors',
  '/typography',
  '/components/button',
  '/components/data-table',
  '/components/date-picker',
]

let root: Root | undefined

afterEach(() => {
  act(() => root?.unmount())
  root = undefined
  document.body.innerHTML = ''
  localStorage.clear()
})

test('every page and component has a prerendered route', () => {
  expect(ROUTES).toEqual(expect.arrayContaining(SAMPLE))
  expect(new Set(ROUTES).size).toBe(ROUTES.length)
})

test.each(SAMPLE)('%s hydrates without mismatches', async (route) => {
  // Stored preferences must not leak into the first client render either.
  localStorage.setItem('theme', 'dark')
  localStorage.setItem('ui-package-manager', 'pnpm')

  const { html } = await prerenderRoute(route)
  window.history.replaceState(null, '', route)
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)

  const problems: string[] = []
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    problems.push(args.map(String).join(' '))
  })

  await act(async () => {
    root = hydrateRoot(
      container,
      <ThemeProvider>
        <RouterProvider initialPath={route}>
          <App />
        </RouterProvider>
      </ThemeProvider>,
      { onRecoverableError: (error) => problems.push(String(error)) }
    )
    // Let the lazy page chunk resolve and its boundary hydrate.
    await new Promise((resolve) => setTimeout(resolve, 50))
  })

  expect(problems.filter((message) => /hydrat|did not match|server/i.test(message))).toEqual([])
  expect(container.textContent).not.toBe('')
}, 30_000)
