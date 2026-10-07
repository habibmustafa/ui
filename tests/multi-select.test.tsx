import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import { MultiSelector } from '../src/components/fragments/multi-select'

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte', disabled: true },
]

function Host({
  initial = [],
  onValuesChange,
  ...rest
}: { initial?: string[]; onValuesChange?: (values: string[]) => void } & Record<string, unknown>) {
  const [values, setValues] = useState<string[]>(initial)
  return (
    <MultiSelector
      options={options}
      values={values}
      onValuesChange={(next) => {
        setValues(next)
        onValuesChange?.(next)
      }}
      label="Frameworks"
      {...rest}
    />
  )
}

const trigger = () => screen.getByRole('combobox')
const option = (name: string) => screen.getByRole('option', { name })

async function openList() {
  fireEvent.click(trigger())
  return screen.findByRole('listbox')
}

test('selecting and re-selecting an option toggles it', async () => {
  const onValuesChange = vi.fn()
  render(<Host onValuesChange={onValuesChange} />)
  await openList()

  fireEvent.click(option('React'))
  expect(onValuesChange).toHaveBeenLastCalledWith(['react'])

  fireEvent.click(option('React'))
  expect(onValuesChange).toHaveBeenLastCalledWith([])
})

test('multiple selections accumulate in order', async () => {
  const onValuesChange = vi.fn()
  render(<Host onValuesChange={onValuesChange} />)
  await openList()

  fireEvent.click(option('Vue'))
  fireEvent.click(option('React'))
  expect(onValuesChange).toHaveBeenLastCalledWith(['vue', 'react'])
})

test('a disabled option cannot be selected', async () => {
  const onValuesChange = vi.fn()
  render(<Host onValuesChange={onValuesChange} />)
  await openList()

  const svelte = option('Svelte')
  expect(svelte.getAttribute('aria-disabled')).toBe('true')
  fireEvent.click(svelte)
  expect(onValuesChange).not.toHaveBeenCalled()
})

test('the trigger summarises the current selection instead of the label', () => {
  render(<Host initial={['react', 'vue']} />)
  expect(trigger().textContent).toContain('React')
  expect(trigger().textContent).toContain('Vue')
})

test('badgeLimit collapses the overflow into a count badge', () => {
  render(<Host initial={['react', 'vue']} badgeLimit={1} />)
  expect(trigger().textContent).toContain('React')
  expect(trigger().textContent).toContain('+1')
  expect(trigger().textContent).not.toContain('Vue')
})

test('the search box filters the list and falls back to the empty label', async () => {
  render(<Host searchable searchPlaceholder="Search…" />)
  await openList()

  const search = screen.getByPlaceholderText('Search…')
  fireEvent.change(search, { target: { value: 'vu' } })
  expect(screen.queryByRole('option', { name: 'React' })).toBeNull()
  expect(option('Vue')).toBeTruthy()

  fireEvent.change(search, { target: { value: 'zzz' } })
  expect(screen.queryByRole('option')).toBeNull()
  expect(screen.getByText('No results found')).toBeTruthy()
})

test('arrow keys pick a chip and Backspace removes that one (keyboard path for deletion)', async () => {
  const onValuesChange = vi.fn()
  render(<Host initial={['react', 'vue']} onValuesChange={onValuesChange} />)
  const combobox = trigger()

  // The pointer-only × is hidden from assistive tech; the trigger describes the keys.
  const hint = document.getElementById(combobox.getAttribute('aria-describedby')!.split(' ').pop()!)
  expect(hint?.textContent).toContain('Backspace')

  combobox.focus()
  fireEvent.keyDown(combobox, { key: 'ArrowLeft' })
  expect(screen.getByText('vue picked; press Backspace to remove')).toBeTruthy()
  fireEvent.keyDown(combobox, { key: 'ArrowLeft' })
  expect(screen.getByText('react picked; press Backspace to remove')).toBeTruthy()
  fireEvent.keyDown(combobox, { key: 'ArrowRight' })
  fireEvent.keyDown(combobox, { key: 'ArrowRight' })
  expect(screen.queryByText(/picked; press Backspace/)).toBeNull()

  fireEvent.keyDown(combobox, { key: 'ArrowLeft' })
  fireEvent.keyDown(combobox, { key: 'ArrowLeft' })
  fireEvent.keyDown(combobox, { key: 'Backspace' })
  expect(onValuesChange).toHaveBeenLastCalledWith(['vue'])
})

test('options mode sends aria-describedby/-invalid to the trigger, keeping the remove hint', () => {
  render(<Host initial={['react']} aria-describedby="help" aria-invalid />)
  const describedBy = trigger().getAttribute('aria-describedby')!.split(' ')
  expect(describedBy[0]).toBe('help')
  expect(describedBy).toHaveLength(2)
  expect(document.getElementById(describedBy[1])?.textContent).toMatch(/Backspace to remove/)
  expect(trigger().getAttribute('aria-invalid')).toBe('true')
})
