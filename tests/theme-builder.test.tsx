// Theme builder (/theme): store ↔ config ↔ URL round trips, and the page itself —
// accessible, presets apply, a typed colour updates the theme and the link, export
// shows the generated CSS, import accepts JSON and builder links.
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeEach, describe, expect, test } from 'vitest'

import ThemeBuilderPage from '../playground/pages/theme-builder'
import { RouterProvider } from '../playground/router'
import {
  DEFAULT_STATE,
  fromConfig,
  setBuilderState,
  stateFromQuery,
  stateToQuery,
  toConfig,
  useThemeBuilder,
  type BuilderState,
} from '../playground/theme-store'
import { ThemeProvider, ThemeStyle } from '../src/providers'
import { THEME_PRESETS, themeToCss } from '../src/theme'

const custom: BuilderState = {
  ...DEFAULT_STATE,
  brand: '#6366f1',
  accent: '#ec4899',
  tint: 0.3,
  neutralHue: 250,
  contrast: 0.7,
  warningHue: 60,
  radius: 10,
  sans: 'manrope',
  mono: 'jetbrains-mono',
}

describe('theme store', () => {
  test('the default state is an empty config and an empty query', () => {
    expect(toConfig(DEFAULT_STATE)).toEqual({})
    expect(stateToQuery(DEFAULT_STATE)).toBe('')
    expect(stateFromQuery('')).toBeNull()
    expect(stateFromQuery('group=forms')).toBeNull()
  })

  test('state survives the URL and the config', () => {
    expect(stateFromQuery(stateToQuery(custom))).toEqual(custom)
    expect(fromConfig(toConfig(custom))).toEqual(custom)
  })

  test('every preset round-trips through the builder state', () => {
    for (const preset of THEME_PRESETS) {
      expect(toConfig(fromConfig(preset.config)), preset.id).toEqual(
        // The default preset *is* the default state, so it exports as {}.
        preset.id === 'default' ? {} : preset.config
      )
    }
  })

  test('bad URL values fall back instead of breaking the page', () => {
    const state = stateFromQuery('brand=nothex&radius=999&tint=abc&font=comic')!
    expect(state.brand).toBe(DEFAULT_STATE.brand)
    expect(state.radius).toBe(24)
    expect(state.tint).toBe(DEFAULT_STATE.tint)
    expect(state.sans).toBe(DEFAULT_STATE.sans)
  })
})

/** The page plus the site-level <ThemeStyle> app.tsx renders for it. */
function Harness() {
  const { state } = useThemeBuilder()
  return (
    <>
      <ThemeStyle tokens={toConfig(state)} />
      <ThemeBuilderPage />
    </>
  )
}

function renderPage(path = '/theme') {
  window.history.replaceState(null, '', path)
  return render(
    <ThemeProvider>
      <RouterProvider>
        <Harness />
      </RouterProvider>
    </ThemeProvider>
  )
}

const themeCss = () => document.querySelector('style[data-ui-theme]')?.textContent ?? ''

describe('theme builder page', () => {
  beforeEach(() => {
    act(() => setBuilderState(DEFAULT_STATE))
  })

  test('renders without axe violations', async () => {
    renderPage()
    const { violations } = await axe.run(document.body, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      resultTypes: ['violations'],
    })
    expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`)).toEqual([])
  }, 20000)

  test('a preset applies its colours and marks itself active', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(themeCss()).toBe('')
    await user.click(screen.getByRole('button', { name: /İndigo/ }))
    expect(screen.getByRole('button', { name: /İndigo/ }).getAttribute('aria-pressed')).toBe('true')
    expect(themeCss()).toBe(themeToCss(THEME_PRESETS.find((p) => p.id === 'indigo')!.config))
  })

  test('typing a colour updates the theme and the shareable URL', async () => {
    renderPage()
    const input = screen.getByRole('textbox', { name: 'Brend rəngi' })
    fireEvent.change(input, { target: { value: '#e11d48' } })
    expect(themeCss()).toContain('--brand-500')
    await waitFor(() => expect(window.location.search).toBe('?brand=e11d48'))

    // An unreadable colour is flagged and leaves the theme alone.
    fireEvent.change(input, { target: { value: 'blurple' } })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(themeCss()).toBe(themeToCss({ brand: '#e11d48' }))
  })

  test('a shared link restores the theme', () => {
    renderPage('/theme?brand=6366f1&radius=10')
    expect(themeCss()).toBe(themeToCss({ brand: '#6366f1', radius: 10 }))
    expect(screen.getByRole('textbox', { name: 'Brend rəngi' })).toHaveProperty('value', '#6366f1')
  })

  test('export shows the generated CSS; import applies JSON and rejects junk', async () => {
    const user = userEvent.setup()
    renderPage('/theme?radius=12')
    await user.click(screen.getByRole('button', { name: 'Export / İdxal' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('--radius-md: 12px;')

    await user.click(within(dialog).getByRole('tab', { name: 'İdxal' }))
    const textarea = within(dialog).getByRole('textbox', { name: 'JSON konfiq və ya builder linki' })
    await user.click(textarea)
    await user.paste('{ "brand": "nope" }')
    await user.click(within(dialog).getByRole('button', { name: 'Tətbiq et' }))
    expect(within(dialog).getByText('"brand" oxunan rəng deyil.')).toBeTruthy()

    await user.clear(textarea)
    await user.paste('{ "brand": "#0ea5e9", "radius": 4 }')
    await user.click(within(dialog).getByRole('button', { name: 'Tətbiq et' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(themeCss()).toBe(themeToCss({ brand: '#0ea5e9', radius: 4 }))
  })
})
