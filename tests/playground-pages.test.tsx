// The playground's intro pages: they render without axe violations, the component
// index filters by text and by role (kept in the URL), and the catalog covers every
// registry entry exactly once.
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ComponentType } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { CATALOG } from '../playground/catalog'
import { PageErrorBoundary } from '../playground/page-error-boundary'
import ComponentsIndexPage from '../playground/pages/components-index'
import GettingStartedPage from '../playground/pages/getting-started'
import HomePage from '../playground/pages/home'
import { COMPONENT_GROUPS } from '../playground/registry'
import { RouterProvider } from '../playground/router'
import { ThemeProvider } from '../src/providers'

function renderPage(Page: ComponentType, path = '/') {
  window.history.replaceState(null, '', path)
  return render(
    <ThemeProvider>
      <RouterProvider>
        <Page />
      </RouterProvider>
    </ThemeProvider>
  )
}

async function expectNoAxeViolations() {
  const { violations } = await axe.run(document.body, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    resultTypes: ['violations'],
  })
  expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`)).toEqual([])
}

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

test('the catalog lists every registry component exactly once', () => {
  const registryIds = COMPONENT_GROUPS.flatMap((g) => g.entries.map((e) => e.id)).sort()
  const catalogIds = CATALOG.flatMap((g) => g.entries.map((e) => e.id)).sort()
  expect(catalogIds).toEqual(registryIds)
  expect(CATALOG.every((group) => group.entries.length > 0)).toBe(true)
})

describe.each([
  ['home', HomePage],
  ['getting started', GettingStartedPage],
  ['components index', ComponentsIndexPage],
] as const)('%s page', (_, Page) => {
  test('renders without axe violations', async () => {
    renderPage(Page)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    await expectNoAxeViolations()
  }, 15000)
})

test('the components index filters by text and by role', async () => {
  const user = userEvent.setup()
  renderPage(ComponentsIndexPage, '/components?group=forms')

  const forms = CATALOG.find((g) => g.key === 'forms')!
  expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Forms'])
  expect(screen.getByRole('button', { name: /^Forms/ }).getAttribute('aria-pressed')).toBe('true')
  const section = screen.getByRole('region', { name: 'Forms' })
  expect(within(section).getAllByRole('link')).toHaveLength(forms.entries.length)

  await user.type(screen.getByRole('searchbox', { name: 'Filter components' }), 'time picker')
  expect(within(section).getAllByRole('link').map((a) => a.textContent)).toEqual([
    expect.stringContaining('Time Picker'),
  ])

  await user.click(screen.getByRole('button', { name: /^All/ }))
  expect(window.location.search).toBe('')

  await user.clear(screen.getByRole('searchbox', { name: 'Filter components' }))
  await user.type(screen.getByRole('searchbox', { name: 'Filter components' }), 'zzzz')
  expect(screen.getByText('No results for “zzzz”.')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Clear filters' }))
  await waitFor(() => expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(CATALOG.length))
})

test('the install command follows the chosen package manager on every copy', async () => {
  const user = userEvent.setup()
  renderPage(GettingStartedPage)
  const [first, second] = screen.getAllByRole('radiogroup', { name: 'Package manager' })
  await user.click(within(first).getByRole('radio', { name: 'pnpm' }))
  expect(screen.getByText('pnpm add @habibmustafa/ui')).toBeTruthy()
  // The forms step's command switched too: one shared, remembered choice.
  expect(within(second).getByRole('radio', { name: 'pnpm' }).getAttribute('aria-checked')).toBe('true')
  expect(screen.getByText('pnpm add react-hook-form zod @hookform/resolvers')).toBeTruthy()
  expect(localStorage.getItem('ui-package-manager')).toBe('pnpm')
})

test('a page that throws shows an error in place, and a route change resets it', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  function Broken(): never {
    throw new TypeError('z.email is not a function')
  }
  const { rerender } = render(
    <PageErrorBoundary resetKey="/">
      <Broken />
    </PageErrorBoundary>
  )
  expect(screen.getByRole('alert').textContent).toContain('z.email is not a function')

  rerender(
    <PageErrorBoundary resetKey="/components">
      <p>Components</p>
    </PageErrorBoundary>
  )
  expect(screen.queryByRole('alert')).toBeNull()
  expect(screen.getByText('Components')).toBeTruthy()
})
