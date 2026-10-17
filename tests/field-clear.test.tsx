// The × on Select / Combobox / MultiSelect / DateRangePicker triggers: opt-in with clearable (on by default
// for DateRangePicker), only with a value, and it clears without opening the list.
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import { Combobox } from '../src/components/atoms/forms/combobox'
import { DateRangePicker } from '../src/components/atoms/forms/date-range-picker'
import { MultiSelector } from '../src/components/atoms/forms/multi-select'
import { Select } from '../src/components/atoms/forms/select'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]
const clearButton = () => screen.queryByTitle('Clear selection')

test('Select: × clears to null and does not open the list', () => {
  const onValueChange = vi.fn()
  render(<Select options={options} defaultValue="a" onValueChange={onValueChange} clearable />)

  fireEvent.click(clearButton()!)
  expect(onValueChange).toHaveBeenCalledWith(null)
  expect(clearButton()).toBeNull()
  expect(screen.queryByRole('listbox')).toBeNull()
})

test('Select: Backspace on the trigger clears, and it is opt-in', () => {
  const onValueChange = vi.fn()
  const { unmount } = render(
    <Select options={options} defaultValue="a" onValueChange={onValueChange} clearable />
  )
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' })
  expect(onValueChange).toHaveBeenCalledWith(null)
  unmount()

  render(<Select options={options} defaultValue="a" />)
  expect(clearButton()).toBeNull()
})

test('Combobox: × clears to null; nothing selected means no ×', () => {
  const onValueChange = vi.fn()
  const { rerender } = render(<Combobox options={options} value={null} clearable />)
  expect(clearButton()).toBeNull()

  rerender(<Combobox options={options} value="b" onValueChange={onValueChange} clearable />)
  fireEvent.click(clearButton()!)
  expect(onValueChange).toHaveBeenCalledWith(null)
  expect(screen.queryByRole('listbox')).toBeNull()
})

test('Combobox: Delete on the trigger clears', () => {
  const onValueChange = vi.fn()
  render(<Combobox options={options} value="a" onValueChange={onValueChange} clearable />)
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Delete' })
  expect(onValueChange).toHaveBeenCalledWith(null)
})

test('MultiSelector: × removes every value', () => {
  const onValuesChange = vi.fn()
  render(
    <MultiSelector
      options={options}
      values={['a', 'b']}
      onValuesChange={onValuesChange}
      label="Letters"
      clearable
    />
  )
  fireEvent.click(clearButton()!)
  expect(onValuesChange).toHaveBeenCalledWith([])
})

test('DateRangePicker: × resets the range in one click; clearable={false} hides it', () => {
  const onValueChange = vi.fn()
  const range = { from: new Date(2026, 9, 1), to: new Date(2026, 9, 9) }
  const { unmount } = render(<DateRangePicker value={range} onValueChange={onValueChange} />)
  fireEvent.click(clearButton()!)
  expect(onValueChange).toHaveBeenCalledWith(undefined)
  unmount()

  render(<DateRangePicker value={range} clearable={false} />)
  expect(clearButton()).toBeNull()
})

test('DateRangePicker: a form-style reset (value back to undefined) shows nothing stale', () => {
  const range = { from: new Date(2026, 9, 1), to: new Date(2026, 9, 9) }
  const { rerender } = render(<DateRangePicker value={undefined} />)
  rerender(<DateRangePicker value={range} />)
  rerender(<DateRangePicker value={undefined} />)
  expect(screen.getByRole('button', { name: /Pick a date range/ })).toBeTruthy()
})
