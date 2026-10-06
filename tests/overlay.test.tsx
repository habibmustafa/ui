// Behaviour of the props-driven overlays (Dialog, Popover): open/close via trigger,
// Escape and controlled state, plus focus return. AlertDialog's async confirm flow
// has its own suite (alert-dialog.test.tsx).
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { Button } from '../src/components/atoms/actions/button'
import { Dialog } from '../src/components/atoms/overlay/dialog'
import { Popover } from '../src/components/atoms/overlay/popover'

test('Dialog opens from its trigger, closes on Escape and returns focus', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(
    <Dialog
      trigger={<Button>Edit profile</Button>}
      title="Edit profile"
      description="Change your details."
      onOpenChange={onOpenChange}
    >
      <input aria-label="Name" />
    </Dialog>
  )

  const trigger = screen.getByRole('button', { name: 'Edit profile' })
  await user.click(trigger)
  const dialog = await screen.findByRole('dialog', { name: 'Edit profile' })
  expect(onOpenChange).toHaveBeenLastCalledWith(true)
  expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
  expect(dialog.contains(document.activeElement)).toBe(true)

  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(onOpenChange).toHaveBeenLastCalledWith(false)
  expect(document.activeElement).toBe(trigger)
})

test('Dialog confirm runs onConfirm and closes; dismissible={false} ignores Escape', async () => {
  const user = userEvent.setup()
  const onConfirm = vi.fn()
  render(
    <Dialog
      defaultOpen
      dismissible={false}
      trigger={<Button>Open</Button>}
      title="Apply changes"
      onConfirm={onConfirm}
      confirmText="Apply"
    />
  )

  await screen.findByRole('dialog')
  await user.keyboard('{Escape}')
  expect(screen.getByRole('dialog')).toBeTruthy()

  await user.click(screen.getByRole('button', { name: 'Apply' }))
  expect(onConfirm).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('Dialog controlled open follows the parent', async () => {
  const user = userEvent.setup()

  function Host() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          External open
        </button>
        <Dialog open={open} onOpenChange={setOpen} trigger={<Button>Trigger</Button>} title="Controlled" />
      </>
    )
  }

  render(<Host />)
  expect(screen.queryByRole('dialog')).toBeNull()
  await user.click(screen.getByRole('button', { name: 'External open' }))
  expect(await screen.findByRole('dialog', { name: 'Controlled' })).toBeTruthy()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('Popover (content) toggles from its trigger and closes on Escape', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(
    <Popover
      trigger={<Button>Filters</Button>}
      content={<p>Filter body</p>}
      slotProps={{ content: { 'aria-label': 'Filters' } }}
      onOpenChange={onOpenChange}
    />
  )

  const trigger = screen.getByRole('button', { name: 'Filters' })
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  await user.click(trigger)
  expect(await screen.findByText('Filter body')).toBeTruthy()
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  expect(onOpenChange).toHaveBeenLastCalledWith(true)

  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByText('Filter body')).toBeNull())
  expect(onOpenChange).toHaveBeenLastCalledWith(false)
})
