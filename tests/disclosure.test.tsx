// Behaviour of the props-driven modes of the disclosure-style hybrids (Tabs, Accordion,
// Collapsible): controlled vs uncontrolled state, change callbacks and keyboard use.
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { Accordion } from '../src/components/atoms/data-display/accordion'
import { Collapsible } from '../src/components/atoms/data-display/collapsible'
import { Tabs } from '../src/components/atoms/navigation/tabs'
import { Button } from '../src/components/atoms/actions/button'

const tabItems = [
  { value: 'a', label: 'Alpha', content: 'Alpha panel' },
  { value: 'b', label: 'Beta', content: 'Beta panel' },
  { value: 'c', label: 'Gamma', content: 'Gamma panel', disabled: true },
]

const selected = (name: string) => screen.getByRole('tab', { name }).getAttribute('aria-selected')

test('Tabs (items) selects the first item by default and switches on click', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<Tabs items={tabItems} onValueChange={onValueChange} />)

  expect(selected('Alpha')).toBe('true')
  expect(screen.getByRole('tabpanel').textContent).toBe('Alpha panel')

  await user.click(screen.getByRole('tab', { name: 'Beta' }))
  expect(onValueChange).toHaveBeenLastCalledWith('b')
  expect(selected('Beta')).toBe('true')
  expect(screen.getByRole('tabpanel').textContent).toBe('Beta panel')
})

test('Tabs arrow keys move between tabs and skip disabled ones', async () => {
  const user = userEvent.setup()
  render(<Tabs items={tabItems} />)

  await user.click(screen.getByRole('tab', { name: 'Alpha' }))
  await user.keyboard('{ArrowRight}')
  expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Beta' }))
  expect(selected('Beta')).toBe('true')

  // Gamma is disabled: focus wraps back to Alpha.
  await user.keyboard('{ArrowRight}')
  expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Alpha' }))
})

test('Tabs controlled value only changes when the parent updates it', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const { rerender } = render(<Tabs items={tabItems} value="a" onValueChange={onValueChange} />)

  await user.click(screen.getByRole('tab', { name: 'Beta' }))
  expect(onValueChange).toHaveBeenLastCalledWith('b')
  expect(selected('Alpha')).toBe('true')

  rerender(<Tabs items={tabItems} value="b" onValueChange={onValueChange} />)
  expect(selected('Beta')).toBe('true')
})

const accordionItems = [
  { value: 'one', trigger: 'First', content: 'First body' },
  { value: 'two', trigger: 'Second', content: 'Second body' },
]

const expanded = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-expanded')

test('Accordion single + collapsible opens one item at a time and can close it', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<Accordion type="single" collapsible items={accordionItems} onValueChange={onValueChange} />)

  expect(expanded('First')).toBe('false')
  await user.click(screen.getByRole('button', { name: 'First' }))
  expect(expanded('First')).toBe('true')
  expect(onValueChange).toHaveBeenLastCalledWith('one')

  await user.click(screen.getByRole('button', { name: 'Second' }))
  expect(expanded('First')).toBe('false')
  expect(expanded('Second')).toBe('true')

  await user.click(screen.getByRole('button', { name: 'Second' }))
  expect(expanded('Second')).toBe('false')
  expect(onValueChange).toHaveBeenLastCalledWith('')
})

test('Accordion multiple keeps several items open and reports an array', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(
    <Accordion type="multiple" defaultValue={['one']} items={accordionItems} onValueChange={onValueChange} />
  )

  expect(expanded('First')).toBe('true')
  await user.click(screen.getByRole('button', { name: 'Second' }))
  expect(expanded('First')).toBe('true')
  expect(expanded('Second')).toBe('true')
  expect(onValueChange).toHaveBeenLastCalledWith(['one', 'two'])
})

test('Accordion triggers respond to Enter and Space', async () => {
  const user = userEvent.setup()
  render(<Accordion type="multiple" items={accordionItems} />)

  screen.getByRole('button', { name: 'First' }).focus()
  await user.keyboard('{Enter}')
  expect(expanded('First')).toBe('true')
  await user.keyboard(' ')
  expect(expanded('First')).toBe('false')
})

test('Collapsible (trigger mode) toggles and supports controlled use', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()

  function Controlled() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <span data-testid="state">{String(open)}</span>
        <Collapsible
          label="Details"
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            onOpenChange(next)
          }}
          trigger={<Button>Toggle</Button>}
          content={<p>Hidden body</p>}
        />
      </>
    )
  }

  render(<Controlled />)
  const toggle = screen.getByRole('button', { name: 'Toggle' })
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByText('Hidden body')).toBeNull()

  await user.click(toggle)
  expect(onOpenChange).toHaveBeenLastCalledWith(true)
  expect(screen.getByTestId('state').textContent).toBe('true')
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText('Hidden body')).toBeTruthy()

  await user.click(toggle)
  expect(onOpenChange).toHaveBeenLastCalledWith(false)
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
})

test('Collapsible defaultOpen starts open without a controlling parent', () => {
  render(<Collapsible defaultOpen trigger={<Button>Toggle</Button>} content={<p>Body</p>} />)
  expect(screen.getByRole('button', { name: 'Toggle' }).getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText('Body')).toBeTruthy()
})
