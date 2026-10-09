// The tab indicator is positioned from ResizeObserver callbacks only: measuring during
// the commit forced an extra full-page layout on every mount.
import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { Tabs } from '../src'

afterEach(() => vi.unstubAllGlobals())

test('Tabs positions its indicator when the observer reports, not while mounting', () => {
  let report = () => {}
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) {
      report = () => callback([], this as unknown as ResizeObserver)
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  render(
    <Tabs
      items={[
        { value: 'one', label: 'One', content: 'First' },
        { value: 'two', label: 'Two', content: 'Second' },
      ]}
    />
  )
  const list = screen.getByRole('tablist')
  expect(list.style.getPropertyValue('--active-tab-left')).toBe('')
  act(() => report())
  expect(list.style.getPropertyValue('--active-tab-left')).toBe('0px')
  expect(list.style.getPropertyValue('--active-tab-width')).toBe('0px')
})
