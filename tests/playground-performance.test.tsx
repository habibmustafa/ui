import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { lazy, Suspense } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { RouteProgress } from '../playground/app'
import { useNearViewport } from '../playground/near-viewport'
import { Link, RouterProvider, setPrefetcher, useRouter } from '../playground/router'
import { render as prerender } from '../playground/entry-server'

afterEach(() => { vi.unstubAllGlobals(); setPrefetcher(() => {}) })

test('a cold component visit includes its first working preview in the HTML', async () => {
  const { html } = await prerender('/components/dialog')
  const document = new DOMParser().parseFromString(html, 'text/html')
  expect(document.querySelector('#preview-default button')).not.toBeNull()
}, 30000)

test('offscreen galleries release their live content and restore it when revisited', async () => {
  let notify: IntersectionObserverCallback = () => {}
  const disconnect = vi.fn()
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { notify = callback }
    observe() {}
    unobserve() {}
    disconnect = disconnect
  })
  const released = vi.fn()
  function Card() {
    const [ref, visible] = useNearViewport({ once: false, margin: '123px' })
    return <div ref={ref} data-testid="card">{visible && <span ref={node => { if (!node) released() }}>Live content</span>}</div>
  }
  const { unmount } = render(<Card />)
  const target = screen.getByTestId('card')
  const visibility = (isIntersecting: boolean) => act(() => notify([{ target, isIntersecting, time: 0, intersectionRatio: Number(isIntersecting), boundingClientRect: target.getBoundingClientRect(), intersectionRect: target.getBoundingClientRect(), rootBounds: null }], {} as IntersectionObserver))
  visibility(true)
  // Reveals wait their turn (one per task), so a gallery never mounts every card at once.
  expect(await screen.findByText('Live content')).toBeTruthy()
  visibility(false)
  expect(screen.queryByText('Live content')).toBeNull()
  expect(released).toHaveBeenCalled()
  visibility(true)
  expect(await screen.findByText('Live content')).toBeTruthy()
  unmount()
  expect(disconnect).toHaveBeenCalled()
})

test('a cold navigation keeps the old page visible and starts prefetch on click', async () => {
  let finish: (value: { default: () => React.ReactNode }) => void = () => {}
  const Next = lazy(() => new Promise<{ default: () => React.ReactNode }>(resolve => { finish = resolve }))
  const warm = vi.fn()
  setPrefetcher(warm)
  window.history.replaceState(null, '', '/old')
  function Pages() {
    const { path, pending } = useRouter()
    return <><Link to="/next">Next page</Link>{pending && <span role="status">Loading</span>}<Suspense fallback={<p>Blank fallback</p>}>{path === '/next' ? <Next /> : <p>Existing content</p>}</Suspense></>
  }
  render(<RouterProvider><Pages /></RouterProvider>)
  fireEvent.click(screen.getByRole('link'))
  expect(warm).toHaveBeenCalledWith('/next')
  expect(screen.getByText('Existing content')).toBeTruthy()
  expect(screen.queryByText('Blank fallback')).toBeNull()
  expect(screen.getByRole('status')).toBeTruthy()
  await act(async () => finish({ default: () => <p>Next content</p> }))
  expect(screen.getByText('Next content')).toBeTruthy()
  expect(screen.queryByRole('status')).toBeNull()
})

test('the route progress bar skips quick navigations, fills while loading and then goes away', async () => {
  const { rerender } = render(<RouteProgress active={false} />)
  expect(screen.queryByRole('progressbar')).toBeNull()
  rerender(<RouteProgress active />)
  // Nothing for a navigation that finishes within a moment.
  expect(screen.queryByRole('progressbar')).toBeNull()
  const bar = await screen.findByRole('progressbar', { name: 'Loading page' })
  await waitFor(() => expect(bar.style.transform).toBe('scaleX(0.9)'))
  rerender(<RouteProgress active={false} />)
  expect(screen.getByRole('progressbar').style.transform).toBe('scaleX(1)')
  await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull())
})
