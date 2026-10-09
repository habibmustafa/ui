// SiteTheme keeps the pre-paint CSS (index.html's <style id="ui-theme-early">) until the
// stored theme is what is rendered, so a custom theme never flashes back to the default
// between hydration and the deferred render.
import { act } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { beforeEach, expect, test, vi } from 'vitest'


beforeEach(() => {
  localStorage.clear()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  vi.resetModules()
})

async function hydrate(stored: object | null) {
  if (stored) localStorage.setItem('ui-theme-builder', JSON.stringify({ state: stored }))
  const early = document.createElement('style')
  early.id = 'ui-theme-early'
  document.head.appendChild(early)
  // Whether the stored theme was already in the page when the early CSS went away.
  const seen = { themedAtRemoval: null as boolean | null }
  const remove = early.remove.bind(early)
  early.remove = () => {
    seen.themedAtRemoval = document.documentElement.innerHTML.includes('--brand-default')
    remove()
  }
  // Imported after storage is filled: the store reads it when the module loads.
  const { SiteTheme } = await import('../playground/site-theme')
  const container = document.createElement('div')
  document.body.appendChild(container)
  container.innerHTML = renderToString(<SiteTheme />)
  await act(async () => {
    hydrateRoot(container, <SiteTheme />)
  })
  await act(async () => {})
  return { early, seen }
}

test('a stored custom theme replaces the early CSS only once it is rendered', async () => {
  const { early, seen } = await hydrate({ brand: '#6366f1' })
  expect(early.isConnected).toBe(false)
  expect(seen.themedAtRemoval).toBe(true)
  expect(localStorage.getItem('ui-theme-builder-css')).toContain('--brand-default')
})

test('without a stored theme the early CSS is dropped too', async () => {
  const { early } = await hydrate(null)
  expect(early.isConnected).toBe(false)
})

test('CSS that is not custom-property blocks is never cached', async () => {
  const { saveEarlyCss, isEarlyCssSafe } = await import('../playground/theme-store')
  expect(isEarlyCssSafe(':root:root { --radius-md: 8px; }')).toBe(true)
  for (const bad of ['</style><script>', '@import "x"', 'a{background:url(x)}', 'a{b:\\41}']) {
    expect(isEarlyCssSafe(bad), bad).toBe(false)
  }
  saveEarlyCss('a{background:url(x)}')
  expect(localStorage.getItem('ui-theme-builder-css')).toBeNull()
})
