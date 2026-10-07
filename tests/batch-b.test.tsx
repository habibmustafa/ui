// PasswordInput, ConfirmPopover, TimePicker.
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { Button } from '../src/components/atoms/actions/button'
import { PasswordInput, estimatePasswordStrength } from '../src/components/atoms/forms/password-input'
import { TimePicker } from '../src/components/atoms/forms/time-picker'
import { ConfirmPopover } from '../src/components/atoms/overlay/confirm-popover'

describe('PasswordInput', () => {
  test('toggle shows and hides the password', async () => {
    const user = userEvent.setup()
    const { container } = render(<PasswordInput aria-label="Password" defaultValue="secret" />)
    const input = container.querySelector('input')!
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(input.type).toBe('password')
    expect(toggle.getAttribute('aria-pressed')).toBe('false')

    await user.click(toggle)
    expect(input.type).toBe('text')
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
  })

  test('strength meter updates with text and is linked to the field', async () => {
    const user = userEvent.setup()
    const { container } = render(<PasswordInput aria-label="Password" showStrength />)
    const input = container.querySelector('input')!
    await user.type(input, 'abc')
    expect(screen.getByText('Weak')).toBeTruthy()
    await user.clear(input)
    await user.type(input, 'Correct-Horse-9')
    const label = screen.getByText('Strong')
    expect(input.getAttribute('aria-describedby')).toContain(label.id)
  })

  test.each([
    ['', 0],
    ['abc', 1],
    ['abcdefgh', 1],
    ['abcdefgh1', 2],
    ['abcdefgh1!', 3],
    ['Abcdefghijk1!', 4],
  ] as const)('estimatePasswordStrength(%j) = %i', (pw, score) => {
    expect(estimatePasswordStrength(pw)).toBe(score)
  })
})

describe('ConfirmPopover', () => {
  test('focuses Cancel, confirms async with loading, then closes', async () => {
    const user = userEvent.setup()
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    render(
      <ConfirmPopover
        title="Revoke key?"
        description="Requests will fail."
        confirmText="Revoke"
        destructive
        onConfirm={onConfirm}
        trigger={<Button>Revoke key</Button>}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Revoke key' }))
    const dialog = await screen.findByRole('dialog', { name: 'Revoke key?' })
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByRole('button', { name: 'Revoke' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    // Pending: Escape doesn't close it.
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeTruthy()

    resolve()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  test('stays open when onConfirm rejects; Cancel closes and calls onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmPopover
        title="Delete?"
        onConfirm={() => Promise.reject(new Error('nope'))}
        onCancel={onCancel}
        trigger={<Button>Delete</Button>}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(await screen.findByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' }).hasAttribute('disabled')).toBe(false))
    expect(screen.getByRole('dialog')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

describe('TimePicker', () => {
  const seg = (name: string) => screen.getByRole('spinbutton', { name })

  test('typing digits fills segments, auto-advances and emits HH:mm', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker onValueChange={onValueChange} />)
    expect(screen.getByRole('group', { name: 'Time' })).toBeTruthy()

    seg('Hours').focus()
    await user.keyboard('0')
    await user.keyboard('9')
    expect(document.activeElement).toBe(seg('Minutes'))
    expect(onValueChange).not.toHaveBeenCalledWith(expect.any(String))
    await user.keyboard('45')
    expect(onValueChange).toHaveBeenLastCalledWith('09:45')
    expect(seg('Hours').getAttribute('aria-valuenow')).toBe('9')
  })

  test('a first digit that cannot start two digits jumps on immediately', async () => {
    const user = userEvent.setup()
    render(<TimePicker />)
    seg('Hours').focus()
    await user.keyboard('7')
    expect(seg('Hours').textContent).toBe('07')
    expect(document.activeElement).toBe(seg('Minutes'))
  })

  test('arrows step, wrap and respect minuteStep; Backspace empties to null', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker defaultValue="23:50" minuteStep={15} onValueChange={onValueChange} />)

    seg('Hours').focus()
    await user.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith('00:50')
    await user.keyboard('{ArrowRight}{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith('00:00')
    await user.keyboard('{ArrowDown}')
    expect(onValueChange).toHaveBeenLastCalledWith('00:45')
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  test('12-hour mode shows 1–12 + AM/PM but emits 24-hour values', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker hourCycle={12} defaultValue="14:05" onValueChange={onValueChange} />)
    expect(seg('Hours').textContent).toBe('02')
    expect(seg('AM/PM').textContent).toBe('PM')

    seg('AM/PM').focus()
    await user.keyboard('a')
    expect(onValueChange).toHaveBeenLastCalledWith('02:05')
    seg('Hours').focus()
    await user.keyboard('12')
    expect(onValueChange).toHaveBeenLastCalledWith('00:05')
  })

  test('seconds segment and controlled value resync', async () => {
    function Host() {
      const [value, setValue] = useState<string | null>('10:00:15')
      return (
        <>
          <TimePicker showSeconds value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue('18:30:00')}>
            Set
          </button>
        </>
      )
    }
    const user = userEvent.setup()
    render(<Host />)
    expect(seg('Seconds').textContent).toBe('15')
    await user.click(screen.getByRole('button', { name: 'Set' }))
    expect(seg('Hours').textContent).toBe('18')
    expect(seg('Minutes').textContent).toBe('30')
    expect(seg('Seconds').textContent).toBe('00')
  })
})
