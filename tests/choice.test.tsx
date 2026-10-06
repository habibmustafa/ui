// Behaviour of the props-driven choice controls (RadioGroup, ToggleGroup, Select) and the
// accessibility wiring the a11y suite surfaced (Select/FormSelect labelling, MultiSelector
// combobox state).
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { RadioGroup } from '../src/components/atoms/forms/radio-group'
import { Select } from '../src/components/atoms/forms/select'
import { ToggleGroup } from '../src/components/atoms/actions/toggle-group'
import {
  MultiSelectorContent,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorRoot,
  MultiSelectorTrigger,
} from '../src/components/fragments/multi-select'

const plans = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team', disabled: true },
]

test('RadioGroup (options) labels each radio and reports the picked value', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<RadioGroup name="plan" options={plans} defaultValue="free" onValueChange={onValueChange} />)

  const free = screen.getByRole('radio', { name: 'Free' })
  const pro = screen.getByRole('radio', { name: 'Pro' })
  expect(free.getAttribute('aria-checked')).toBe('true')

  await user.click(screen.getByText('Pro'))
  expect(onValueChange).toHaveBeenLastCalledWith('pro')
  expect(pro.getAttribute('aria-checked')).toBe('true')
  expect(free.getAttribute('aria-checked')).toBe('false')

  expect(screen.getByRole('radio', { name: 'Team' }).hasAttribute('disabled')).toBe(true)
})

test('RadioGroup arrow keys move focus between radios and skip disabled options', async () => {
  // Radix selects the focused radio from a focus handler gated on a document-level
  // arrow-key flag, which jsdom's synthetic events don't reproduce — roving focus is
  // what this asserts; selection by click is covered above.
  const user = userEvent.setup()
  render(<RadioGroup name="plan" options={plans} defaultValue="free" />)

  await user.click(screen.getByRole('radio', { name: 'Free' }))
  await user.keyboard('{ArrowDown}')
  expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Pro' }))
  await user.keyboard('{ArrowDown}')
  // Team is disabled — wraps around to Free.
  expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Free' }))
})

const alignments = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

test('ToggleGroup single allows one pressed item and can be cleared', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<ToggleGroup type="single" items={alignments} onValueChange={onValueChange} />)

  const left = screen.getByRole('radio', { name: 'Left' })
  await user.click(left)
  expect(onValueChange).toHaveBeenLastCalledWith('left')
  expect(left.getAttribute('aria-checked')).toBe('true')

  await user.click(screen.getByRole('radio', { name: 'Right' }))
  expect(left.getAttribute('aria-checked')).toBe('false')

  await user.click(screen.getByRole('radio', { name: 'Right' }))
  expect(onValueChange).toHaveBeenLastCalledWith('')
})

test('ToggleGroup multiple reports every pressed item', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<ToggleGroup type="multiple" items={alignments} onValueChange={onValueChange} />)

  await user.click(screen.getByRole('button', { name: 'Left' }))
  await user.click(screen.getByRole('button', { name: 'Right' }))
  expect(onValueChange).toHaveBeenLastCalledWith(['left', 'right'])
  expect(screen.getByRole('button', { name: 'Right' }).getAttribute('aria-pressed')).toBe('true')
})

const databases = [
  { value: 'postgres', label: 'Postgres' },
  { value: 'mysql', label: 'MySQL' },
]

test('Select (options) opens, picks an option and reports it', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<Select options={databases} placeholder="Pick one" aria-label="Database" onValueChange={onValueChange} />)

  const trigger = screen.getByRole('combobox', { name: 'Database' })
  expect(trigger.textContent).toContain('Pick one')

  await user.click(trigger)
  await user.click(await screen.findByRole('option', { name: 'MySQL' }))
  expect(onValueChange).toHaveBeenLastCalledWith('mysql')
  expect(trigger.textContent).toContain('MySQL')
})

test('Select (options) forwards id and aria-* to the trigger so a <label> names it', () => {
  render(
    <>
      <label htmlFor="db">Database</label>
      <Select id="db" options={databases} aria-describedby="db-help" aria-invalid />
      <p id="db-help">Where your data lives.</p>
    </>
  )
  const trigger = screen.getByRole('combobox', { name: 'Database' })
  expect(trigger.id).toBe('db')
  expect(trigger.getAttribute('aria-describedby')).toBe('db-help')
  expect(trigger.getAttribute('aria-invalid')).toBe('true')
})

test('MultiSelector trigger is a named combobox that reflects its open state', async () => {
  const user = userEvent.setup()

  function Host() {
    const [values, setValues] = useState<string[]>([])
    return (
      <MultiSelectorRoot values={values} onValuesChange={setValues}>
        <MultiSelectorTrigger label="Frameworks" />
        <MultiSelectorContent>
          <MultiSelectorList>
            <MultiSelectorItem value="react">React</MultiSelectorItem>
          </MultiSelectorList>
        </MultiSelectorContent>
      </MultiSelectorRoot>
    )
  }

  render(<Host />)
  const trigger = screen.getByRole('combobox', { name: 'Frameworks' })
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')
  expect(trigger.hasAttribute('aria-controls')).toBe(false)

  await user.click(trigger)
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  const controls = trigger.getAttribute('aria-controls')
  expect(controls).toBeTruthy()
  expect(document.getElementById(controls!)).not.toBeNull()
})
