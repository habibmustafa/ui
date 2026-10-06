// Shared state primitives: useControllableState (every hybrid's props mode) and
// ThemeProvider (persistence, attributes on <html>, system preference).
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'

import { useControllableState } from '../src/lib/use-controllable-state'
import { ThemeProvider, useTheme } from '../src/providers'

test('useControllableState: uncontrolled keeps its own value and still notifies', () => {
  const onChange = vi.fn()
  const { result } = renderHook(() => useControllableState({ defaultValue: 'a', onChange }))
  expect(result.current[0]).toBe('a')

  act(() => result.current[1]('b'))
  expect(result.current[0]).toBe('b')
  expect(onChange).toHaveBeenCalledWith('b')
})

test('useControllableState: controlled ignores setValue until the prop changes', () => {
  const onChange = vi.fn()
  const { result, rerender } = renderHook(
    ({ value }) => useControllableState({ value, defaultValue: 'a', onChange }),
    { initialProps: { value: 'x' } }
  )

  act(() => result.current[1]('y'))
  expect(onChange).toHaveBeenCalledWith('y')
  expect(result.current[0]).toBe('x')

  rerender({ value: 'y' })
  expect(result.current[0]).toBe('y')
})

test('useControllableState: always calls the latest onChange', () => {
  const first = vi.fn()
  const second = vi.fn()
  const { result, rerender } = renderHook(
    ({ onChange }) => useControllableState({ defaultValue: 0, onChange }),
    { initialProps: { onChange: first } }
  )
  const setValue = result.current[1]
  rerender({ onChange: second })

  act(() => setValue(1))
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledWith(1)
})

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button type="button" onClick={() => setTheme('dark')}>
        Dark
      </button>
      <button type="button" onClick={() => setTheme('system')}>
        System
      </button>
    </>
  )
}

function mockSystemDark(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }
  vi.spyOn(window, 'matchMedia').mockImplementation(() => mql as unknown as MediaQueryList)
  return (next: boolean) => {
    mql.matches = next
    for (const cb of listeners) cb({ matches: next } as MediaQueryListEvent)
  }
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.classList.remove('light', 'dark')
})

test('ThemeProvider applies the theme to <html> and persists changes', async () => {
  const user = userEvent.setup()
  mockSystemDark(false)
  render(
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      <ThemeProbe />
    </ThemeProvider>
  )

  const html = document.documentElement
  expect(screen.getByTestId('theme').textContent).toBe('light')
  expect(html.getAttribute('data-theme')).toBe('light')
  expect(html.classList.contains('light')).toBe(true)

  await user.click(screen.getByRole('button', { name: 'Dark' }))
  expect(html.getAttribute('data-theme')).toBe('dark')
  expect(html.classList.contains('dark')).toBe(true)
  expect(html.classList.contains('light')).toBe(false)
  expect(localStorage.getItem('test-theme')).toBe('dark')
})

test('ThemeProvider restores a stored theme over the default', () => {
  mockSystemDark(false)
  localStorage.setItem('test-theme', 'dark')
  render(
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      <ThemeProbe />
    </ThemeProvider>
  )
  expect(screen.getByTestId('theme').textContent).toBe('dark')
  expect(screen.getByTestId('resolved').textContent).toBe('dark')
})

test('ThemeProvider "system" follows prefers-color-scheme live', () => {
  const setSystemDark = mockSystemDark(false)
  render(
    <ThemeProvider defaultTheme="system" storageKey="test-theme">
      <ThemeProbe />
    </ThemeProvider>
  )
  expect(screen.getByTestId('resolved').textContent).toBe('light')

  act(() => setSystemDark(true))
  expect(screen.getByTestId('resolved').textContent).toBe('dark')
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
})
