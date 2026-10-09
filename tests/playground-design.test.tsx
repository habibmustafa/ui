import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { App } from '../playground/app'
import { ComponentPlayground } from '../playground/component-playground'
import BlockDetailPage from '../playground/pages/block-detail'
import BlocksPage from '../playground/pages/blocks'
import { Hero } from '../playground/pages/home-hero'
import { RouterProvider } from '../playground/router'
import { ThemeProvider } from '../src'

function renderPage(children: ReactNode, path = '/') {
  window.history.replaceState(null, '', path)
  return render(<ThemeProvider><RouterProvider>{children}</RouterProvider></ThemeProvider>)
}

beforeEach(() => {
  // Gallery cards stay offscreen; these tests exercise the gallery's controls.
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} unobserve() {} })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => vi.unstubAllGlobals())

test('the hero keeps advanced theme controls collapsed and project views are interactive', async () => {
  const user = userEvent.setup()
  const { container } = renderPage(<Hero />)
  expect(container.querySelector('details')?.open).toBe(false)
  await user.click(screen.getByText('Fine-tune your theme'))
  expect(container.querySelector('details')?.open).toBe(true)
  expect(screen.getByRole('textbox', { name: 'Brand color' })).toBeTruthy()

  await user.click(screen.getByRole('checkbox', { name: 'Review the first prototype' }))
  expect(screen.getByRole('progressbar', { name: 'Project completion' }).getAttribute('aria-valuenow')).toBe('78.125')
  await user.click(screen.getByRole('tab', { name: 'Activity' }))
  expect(screen.getByText('You completed the prototype review.')).toBeTruthy()
  await user.click(screen.getByRole('tab', { name: 'Team' }))
  expect(screen.getByText('Frontend engineer')).toBeTruthy()
})

test('playground settings change the component, its code and reset together', async () => {
  const user = userEvent.setup()
  renderPage(<ComponentPlayground id="button" />)
  await user.selectOptions(screen.getByRole('combobox', { name: 'Variant' }), 'danger')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Size' }), 'large')
  await user.click(screen.getByRole('checkbox', { name: 'Loading' }))
  expect(screen.getByRole('button', { name: 'Continue' })).toHaveProperty('disabled', true)
  await user.click(screen.getByRole('tab', { name: 'Your code' }))
  const code = screen.getByRole('tabpanel').textContent
  expect(code).toContain('variant="danger"')
  expect(code).toContain('size="large"')
  expect(code).toContain('loading')

  await user.click(screen.getByRole('tab', { name: 'Playground' }))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Preview background' }), 'muted')
  await user.click(screen.getByRole('button', { name: 'Reset preview' }))
  expect(screen.getByRole('combobox', { name: 'Preview background' })).toHaveProperty('value', 'grid')
  expect(screen.getByRole('combobox', { name: 'Variant' })).toHaveProperty('value', 'primary')
  expect(screen.getByRole('button', { name: 'Continue' })).toHaveProperty('disabled', false)
})

test('input playground uses real disabled and invalid states', async () => {
  const user = userEvent.setup()
  renderPage(<ComponentPlayground id="input" />)
  await user.click(screen.getByRole('checkbox', { name: 'Invalid' }))
  expect(screen.getByRole('textbox', { name: 'Email' }).getAttribute('aria-invalid')).toBe('true')
  await user.click(screen.getByRole('checkbox', { name: 'Disabled' }))
  expect(screen.getByRole('textbox', { name: 'Email' })).toHaveProperty('disabled', true)
})

test('sidebar opens the active group and retains clear navigation after collapsing it', async () => {
  const user = userEvent.setup()
  renderPage(<App />, '/components/input')
  const navigation = screen.getByRole('navigation', { name: 'Documentation' })
  const forms = within(navigation).getByRole('button', { name: /^Forms/ })
  expect(forms.getAttribute('aria-expanded')).toBe('true')
  expect(within(navigation).getByRole('button', { name: /^Actions/ }).getAttribute('aria-expanded')).toBe('false')
  expect(within(navigation).getByRole('link', { name: 'Input' }).getAttribute('aria-current')).toBe('page')
  await user.click(forms)
  expect(within(navigation).queryByRole('link', { name: 'Input' })).toBeNull()
  await user.click(forms)
  await user.click(within(navigation).getByRole('link', { name: 'Textarea' }))
  await waitFor(() => expect(window.location.pathname).toBe('/components/textarea'))
  expect(within(navigation).getByRole('link', { name: 'Textarea' }).getAttribute('aria-current')).toBe('page')
})

test('blocks filter down to a card that opens the block on its own page', async () => {
  const user = userEvent.setup()
  renderPage(<BlocksPage />, '/blocks')
  await user.click(screen.getByRole('button', { name: /^Data/ }))
  await user.type(screen.getByRole('searchbox', { name: 'Search blocks' }), 'Dashboard')
  expect(screen.getAllByRole('article')).toHaveLength(1)
  const card = screen.getByRole('link', { name: 'Dashboard — open preview' })
  expect(card.getAttribute('href')).toBe('/blocks/dashboard')
  await user.click(card)
  expect(window.location.pathname).toBe('/blocks/dashboard')
})

test('a block page previews the screen at two widths, shows its code and links onward', async () => {
  const user = userEvent.setup()
  renderPage(<BlockDetailPage id="dashboard" />, '/blocks/dashboard')
  expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy()
  const iframe = screen.getByTitle('Dashboard live preview') as HTMLIFrameElement
  expect(iframe.src).toContain('/playground/block-frame.html?preview=dashboard')
  expect(iframe.style.width).toBe('1024px')
  await user.click(screen.getByRole('button', { name: 'Mobile' }))
  expect(iframe.style.width).toBe('390px')
  await user.click(screen.getByRole('tab', { name: 'Code' }))
  await waitFor(() => expect(screen.getByRole('tabpanel').textContent).toContain("'@habibmustafa/ui'"))
  const more = within(screen.getByRole('navigation', { name: 'More blocks' }))
  expect(more.getByRole('link', { name: /Billing and plan/ }).getAttribute('href')).toBe('/blocks/billing')
  expect(more.getByRole('link', { name: /Invite members/ }).getAttribute('href')).toBe('/blocks/invite-members')
  expect(screen.getByRole('link', { name: 'All blocks' }).getAttribute('href')).toBe('/blocks')
}, 15000)

test('an unknown block page points back to the gallery', () => {
  renderPage(<BlockDetailPage id="nope" />, '/blocks/nope')
  expect(screen.getByRole('heading', { name: 'Block not found' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Browse all blocks' }).getAttribute('href')).toBe('/blocks')
})

test('legacy block links move to the block page, and empty filters can be cleared', async () => {
  const user = userEvent.setup()
  const { unmount } = renderPage(<BlocksPage />, '/blocks#sign-in')
  await waitFor(() => expect(window.location.pathname).toBe('/blocks/sign-in'))
  unmount()
  renderPage(<BlocksPage />, '/blocks?block=dashboard')
  await waitFor(() => expect(window.location.pathname).toBe('/blocks/dashboard'))
  window.history.replaceState(null, '', '/blocks')
  await user.type(screen.getByRole('searchbox', { name: 'Search blocks' }), 'not-a-screen')
  expect(screen.getByText('No screens found')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Clear filters' }))
  expect(screen.getAllByRole('article').length).toBeGreaterThan(10)
})

test('the gallery and interactive controls have no axe violations', async () => {
  const { container } = renderPage(<main><BlocksPage /><BlockDetailPage id="sign-in" /><ComponentPlayground id="button" /></main>, '/blocks')
  // The block page's iframe content is checked per block in blocks.test.tsx.
  const { violations } = await axe.run(container, { iframes: false, rules: { 'color-contrast': { enabled: false }, region: { enabled: false } }, resultTypes: ['violations'] })
  expect(violations.map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)).toEqual([])
}, 15000)
