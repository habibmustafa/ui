// Spinner, ScrollArea, CopyButton, Banner.
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { CopyButton } from '../src/components/atoms/actions/copy-button'
import { Banner } from '../src/components/atoms/feedback/banner'
import { Spinner } from '../src/components/atoms/feedback/spinner'
import { ScrollArea } from '../src/components/atoms/layout/scroll-area'

test('Spinner is a labelled status, or hidden when decorative', () => {
  const { rerender } = render(<Spinner label="Loading projects" />)
  expect(screen.getByRole('status').textContent).toBe('Loading projects')
  rerender(<Spinner decorative />)
  expect(screen.queryByRole('status')).toBeNull()
})

test('ScrollArea viewport is a focusable, named region', () => {
  render(
    <ScrollArea aria-label="Releases" className="h-20">
      <p>content</p>
    </ScrollArea>
  )
  const region = screen.getByRole('region', { name: 'Releases' })
  expect(region.getAttribute('tabindex')).toBe('0')
  expect(region.textContent).toBe('content')
})

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  vi.spyOn(document, 'hasFocus').mockReturnValue(true)
  return writeText
}

test('CopyButton copies, confirms, announces and resets', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  // user-event installs its own clipboard stub in setup(), so mock after it.
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const writeText = mockClipboard()
  const onCopied = vi.fn()
  render(<CopyButton value="secret" aria-label="Copy key" onCopied={onCopied} timeout={1000} />)

  await user.click(screen.getByRole('button', { name: 'Copy key' }))
  expect(writeText).toHaveBeenCalledWith('secret')
  expect(onCopied).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy()
  expect(screen.getByText('Copied to clipboard')).toBeTruthy()

  await act(() => vi.advanceTimersByTimeAsync(1100))
  expect(screen.getByRole('button', { name: 'Copy key' })).toBeTruthy()
  vi.useRealTimers()
})

test('CopyButton accepts an async value and a visible label', async () => {
  const user = userEvent.setup()
  const writeText = mockClipboard()
  render(<CopyButton label="Copy token" value={async () => 'tok_123'} />)
  await user.click(screen.getByRole('button', { name: 'Copy token' }))
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('tok_123'))
  expect(await screen.findByRole('button', { name: 'Copied' })).toBeTruthy()
})

test('Banner is a region named by its title and can be dismissed', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(
    <>
      <Banner title="Maintenance" dismissible onOpenChange={onOpenChange}>
        Tonight
      </Banner>
      <Banner>No title</Banner>
    </>
  )
  expect(screen.getByRole('region', { name: 'Maintenance' }).textContent).toContain('Tonight')
  expect(screen.getByRole('region', { name: 'Announcement' })).toBeTruthy()

  await user.click(screen.getByRole('button', { name: 'Dismiss' }))
  expect(onOpenChange).toHaveBeenCalledWith(false)
  expect(screen.queryByRole('region', { name: 'Maintenance' })).toBeNull()
})
