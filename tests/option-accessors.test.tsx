// Select / Combobox / MultiSelect options in any shape: a field name (valueExpr/displayExpr)
// or a function (getOptionValue/getOptionLabel, which wins), and values may be numbers.
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { Combobox } from '../src/components/atoms/forms/combobox'
import { MultiSelector } from '../src/components/atoms/forms/multi-select'
import { Select } from '../src/components/atoms/forms/select'
import { readOption } from '../src/lib/options'

const users = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Linus' },
  { id: 3, name: 'Grace' },
]

test('readOption: field names, functions win, label falls back to the value', () => {
  expect(readOption({ value: 'a', label: 'A' }, {})).toMatchObject({ value: 'a', key: 'a', label: 'A' })
  expect(readOption(users[0], { valueExpr: 'id', displayExpr: 'name' })).toMatchObject({
    value: 1,
    key: '1',
    label: 'Ada',
  })
  expect(
    readOption(users[0], {
      valueExpr: 'nope',
      getOptionValue: (u) => u.id * 10,
      getOptionLabel: (u) => u.name.toUpperCase(),
    })
  ).toMatchObject({ value: 10, label: 'ADA' })
  expect(readOption({ value: 7 }, {}).label).toBe('7')
})

test('Select: custom shape, number value, label shown in the trigger', () => {
  render(<Select options={users} valueExpr="id" displayExpr="name" defaultValue={2} />)
  expect(screen.getByRole('combobox').textContent).toContain('Linus')
})

test('Select: functions work, and a number value round-trips through the clear ×', () => {
  const onValueChange = vi.fn()
  render(
    <Select
      options={users}
      getOptionValue={(u) => u.id}
      getOptionLabel={(u) => u.name}
      defaultValue={3}
      clearable
      onValueChange={onValueChange}
    />
  )
  expect(screen.getByRole('combobox').textContent).toContain('Grace')
  fireEvent.click(screen.getByTitle('Clear selection'))
  expect(onValueChange).toHaveBeenCalledWith(null)
})

test('Combobox: custom shape, number value in and out', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(
    <Combobox
      aria-label="User"
      options={users}
      valueExpr="id"
      getOptionLabel={(u) => u.name}
      value={2}
      onValueChange={onValueChange}
    />
  )
  const trigger = screen.getByRole('combobox', { name: 'User' })
  expect(trigger.textContent).toContain('Linus')

  await user.click(trigger)
  await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Grace' }))
  expect(onValueChange).toHaveBeenLastCalledWith(3)
})

test('Combobox: a numeric value 0 still counts as selected (clearable shows the ×)', () => {
  render(
    <Combobox
      options={[{ value: 0, label: 'Zero' }]}
      value={0}
      clearable
      onValueChange={() => {}}
    />
  )
  expect(screen.getByTitle('Clear selection')).toBeTruthy()
})

test('MultiSelector: custom shape, numbers in and out, chips show the label', async () => {
  const onValuesChange = vi.fn()
  render(
    <MultiSelector
      options={users}
      valueExpr="id"
      displayExpr="name"
      values={[1]}
      onValuesChange={onValuesChange}
      label="Users"
    />
  )
  expect(screen.getByRole('combobox').textContent).toContain('Ada')

  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(await screen.findByRole('option', { name: 'Linus' }))
  expect(onValuesChange).toHaveBeenLastCalledWith([1, 2])
})
