// TimePicker's analog clock popover (keyboard path; pointer geometry is checked in the
// browser — jsdom has no layout).
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { TimePicker } from '../src/components/atoms/forms/time-picker'

test('clock button opens a dial on hours, Enter moves to minutes, Enter closes', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<TimePicker aria-label="Start" defaultValue="09:30" onValueChange={onValueChange} />)

  await user.click(screen.getByRole('button', { name: 'Choose time' }))
  const dial = await screen.findByRole('slider', { name: 'Select hours' })
  await waitFor(() => expect(document.activeElement).toBe(dial))
  expect(dial.getAttribute('aria-valuenow')).toBe('9')
  expect(screen.getByRole('button', { name: 'Edit hours' }).getAttribute('aria-pressed')).toBe('true')

  await user.keyboard('{ArrowUp}{ArrowUp}')
  expect(onValueChange).toHaveBeenLastCalledWith('11:30')
  await user.keyboard('{Enter}')
  const minutes = screen.getByRole('slider', { name: 'Select minutes' })
  expect(minutes.getAttribute('aria-valuetext')).toBe('30 minutes')

  await user.keyboard('{PageUp}')
  expect(onValueChange).toHaveBeenLastCalledWith('11:35')
  await user.keyboard('{Enter}')
  await waitFor(() => expect(screen.queryByRole('slider')).toBeNull())
})

test('hours wrap 23 -> 0 in 24h; 12h dial runs 1–12 with AM/PM buttons', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const { unmount } = render(<TimePicker defaultValue="23:00" onValueChange={onValueChange} />)
  await user.click(screen.getByRole('button', { name: 'Choose time' }))
  await screen.findByRole('slider', { name: 'Select hours' })
  await user.keyboard('{ArrowUp}')
  expect(onValueChange).toHaveBeenLastCalledWith('00:00')
  unmount()

  onValueChange.mockClear()
  render(<TimePicker hourCycle={12} defaultValue="13:15" onValueChange={onValueChange} />)
  await user.click(screen.getByRole('button', { name: 'Choose time' }))
  const dial = await screen.findByRole('slider', { name: 'Select hours' })
  expect(dial.getAttribute('aria-valuemin')).toBe('1')
  expect(dial.getAttribute('aria-valuemax')).toBe('12')
  expect(dial.getAttribute('aria-valuenow')).toBe('1')
  await user.click(screen.getByRole('button', { name: 'AM' }))
  expect(onValueChange).toHaveBeenLastCalledWith('01:15')
})

test('minuteStep snaps arrow steps on the minutes dial; header buttons switch views', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<TimePicker defaultValue="10:00" minuteStep={15} onValueChange={onValueChange} />)
  await user.click(screen.getByRole('button', { name: 'Choose time' }))
  await user.click(await screen.findByRole('button', { name: 'Edit minutes' }))
  screen.getByRole('slider', { name: 'Select minutes' }).focus()
  await user.keyboard('{ArrowDown}')
  expect(onValueChange).toHaveBeenLastCalledWith('10:45')
})

test('clock={false} keeps the plain icon', () => {
  render(<TimePicker clock={false} />)
  expect(screen.queryByRole('button', { name: 'Choose time' })).toBeNull()
})
