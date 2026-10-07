// NumberInput, Combobox and Stepper.
import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { NumberInput } from '../src/components/atoms/forms/number-input'
import { Stepper } from '../src/components/atoms/navigation/stepper'
import { Combobox } from '../src/components/fragments/combobox'

test('NumberInput steps with keys and buttons and clamps to min/max', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(
    <NumberInput aria-label="Qty" defaultValue={5} min={0} max={20} onValueChange={onValueChange} />
  )
  const input = screen.getByRole('spinbutton', { name: 'Qty' })
  expect(input.getAttribute('aria-valuenow')).toBe('5')
  expect(input.getAttribute('aria-valuemin')).toBe('0')
  expect(input.getAttribute('aria-valuemax')).toBe('20')

  input.focus()
  await user.keyboard('{ArrowUp}')
  expect(onValueChange).toHaveBeenLastCalledWith(6)
  await user.keyboard('{Shift>}{ArrowUp}{/Shift}')
  expect(onValueChange).toHaveBeenLastCalledWith(16)
  await user.keyboard('{PageUp}')
  expect(onValueChange).toHaveBeenLastCalledWith(20)
  await user.keyboard('{Home}')
  expect(onValueChange).toHaveBeenLastCalledWith(0)

  expect(screen.getByRole('button', { name: 'Decrease' }).hasAttribute('disabled')).toBe(true)
  await user.click(screen.getByRole('button', { name: 'Increase' }))
  expect(onValueChange).toHaveBeenLastCalledWith(1)
})

test('NumberInput commits typed text on blur: parsed, clamped, empty -> null', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<NumberInput aria-label="Qty" defaultValue={5} max={10} onValueChange={onValueChange} />)
  const input = screen.getByRole('spinbutton', { name: 'Qty' }) as HTMLInputElement

  await user.clear(input)
  await user.type(input, '42')
  expect(onValueChange).not.toHaveBeenCalled()
  await user.tab()
  expect(onValueChange).toHaveBeenLastCalledWith(10)
  expect(input.value).toBe('10')

  await user.clear(input)
  await user.tab()
  expect(onValueChange).toHaveBeenLastCalledWith(null)
  expect(input.hasAttribute('aria-valuenow')).toBe(false)

  await user.type(input, 'abc')
  await user.tab()
  expect(input.value).toBe('')
})

test('NumberInput keeps step precision and applies format', async () => {
  const user = userEvent.setup()
  render(
    <NumberInput aria-label="Price" defaultValue={1.1} step={0.1} format={(v) => v.toFixed(2)} />
  )
  const input = screen.getByRole('spinbutton', { name: 'Price' }) as HTMLInputElement
  expect(input.value).toBe('1.10')
  input.focus()
  await user.keyboard('{ArrowUp}{ArrowUp}')
  // 1.1 + 0.1 + 0.1 without float drift
  expect(input.getAttribute('aria-valuenow')).toBe('1.3')
  expect(input.value).toBe('1.30')
})

test('NumberInput controlled value follows the parent', async () => {
  const user = userEvent.setup()
  function Host() {
    const [value, setValue] = useState<number | null>(3)
    return (
      <>
        <NumberInput aria-label="Qty" value={value} onValueChange={setValue} />
        <button type="button" onClick={() => setValue(9)}>
          Set 9
        </button>
      </>
    )
  }
  render(<Host />)
  await user.click(screen.getByRole('button', { name: 'Set 9' }))
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('9')
})

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', keywords: ['yellow'] },
  { value: 'cherry', label: 'Cherry', disabled: true },
]

test('Combobox opens, filters by label and keywords, selects and closes', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<Combobox aria-label="Fruit" options={fruits} onValueChange={onValueChange} />)

  const trigger = screen.getByRole('combobox', { name: 'Fruit' })
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  expect(trigger.textContent).toContain('Select…')

  await user.click(trigger)
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  expect(document.getElementById(trigger.getAttribute('aria-controls')!)).not.toBeNull()

  await user.type(screen.getByPlaceholderText('Search…'), 'yell')
  const listbox = screen.getByRole('listbox')
  expect(within(listbox).getAllByRole('option').map((o) => o.textContent)).toEqual(['Banana'])

  await user.click(within(listbox).getByRole('option', { name: 'Banana' }))
  expect(onValueChange).toHaveBeenLastCalledWith('banana')
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  expect(trigger.textContent).toContain('Banana')
})

test('Combobox clearable: picking the selected option again clears it', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(
    <Combobox aria-label="Fruit" options={fruits} defaultValue="apple" clearable onValueChange={onValueChange} />
  )
  await user.click(screen.getByRole('combobox', { name: 'Fruit' }))
  await user.click(screen.getByRole('option', { name: 'Apple' }))
  expect(onValueChange).toHaveBeenLastCalledWith(null)
})

test('Combobox submits its value through a hidden input when named', () => {
  const { container } = render(<Combobox aria-label="Fruit" name="fruit" options={fruits} defaultValue="banana" />)
  expect((container.querySelector('input[name="fruit"]') as HTMLInputElement).value).toBe('banana')
})

const steps = [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]

test('Stepper marks completed/current/upcoming steps for assistive tech', () => {
  render(<Stepper steps={steps} activeStep={1} />)
  const list = screen.getByRole('list', { name: 'Progress' })
  const items = within(list).getAllByRole('listitem')
  expect(items.map((li) => li.getAttribute('data-state'))).toEqual(['completed', 'current', 'upcoming'])
  expect(items[1].getAttribute('aria-current')).toBe('step')
  expect(items[0].textContent).toContain('(completed)')
  expect(items[2].textContent).toContain('(not started)')
})

test('Stepper onStepClick makes only completed steps clickable', async () => {
  const user = userEvent.setup()
  const onStepClick = vi.fn()
  render(<Stepper steps={steps} activeStep={2} onStepClick={onStepClick} />)

  const buttons = screen.getAllByRole('button')
  expect(buttons).toHaveLength(2)
  await user.click(buttons[0])
  expect(onStepClick).toHaveBeenCalledWith(0)
})

describe('NumberInput modes', () => {
  test('numeric: letters, separators and a "-" without negative min are dropped', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Qty" min={0} onValueChange={onValueChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Qty' }) as HTMLInputElement
    expect(input.getAttribute('inputmode')).toBe('numeric')
    await user.type(input, '-1a2.5e3')
    expect(input.value).toBe('1253')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(1253)
  })

  test('numeric with a negative min keeps one leading "-"', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="Offset" min={-10} />)
    const input = screen.getByRole('spinbutton', { name: 'Offset' }) as HTMLInputElement
    await user.type(input, '5-')
    expect(input.value).toBe('5')
    await user.clear(input)
    await user.type(input, '-5-')
    expect(input.value).toBe('-5')
  })

  test('decimal: one separator (comma becomes a dot), limited decimal places', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Weight" mode="decimal" decimalPlaces={2} onValueChange={onValueChange} />
    )
    const input = screen.getByRole('spinbutton', { name: 'Weight' }) as HTMLInputElement
    expect(input.getAttribute('inputmode')).toBe('decimal')
    await user.type(input, '3,1x41.5')
    expect(input.value).toBe('3.14')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(3.14)
  })

  test('decimal is the default when step has decimals; pasted text is cleaned', async () => {
    const user = userEvent.setup()
    render(<NumberInput aria-label="Rate" step={0.5} />)
    const input = screen.getByRole('spinbutton', { name: 'Rate' }) as HTMLInputElement
    input.focus()
    await user.paste('abc 12.75 kg')
    expect(input.value).toBe('12.75')
  })

  test('a formatted value is edited as the plain number', async () => {
    const user = userEvent.setup()
    render(
      <NumberInput
        aria-label="Amount"
        defaultValue={1234.5}
        step={0.01}
        format={(v) => v.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      />
    )
    const input = screen.getByRole('spinbutton', { name: 'Amount' }) as HTMLInputElement
    expect(input.value).toBe('1,234.50')
    await user.click(input)
    expect(input.value).toBe('1234.5')
    await user.tab()
    expect(input.value).toBe('1,234.50')
    expect(input.getAttribute('aria-valuenow')).toBe('1234.5')
  })
})
