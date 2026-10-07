// DataTable: helpers, search, sorting cycle, paging, selection and server-side mode.
import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { Checkbox } from '../src/components/atoms/forms/checkbox'
import {
  DataTable,
  compareSortValues,
  filterRows,
  nextSort,
  sortRows,
  type DataTableColumn,
} from '../src/components/fragments/data-table'

describe('helpers', () => {
  test('nextSort cycles asc -> desc -> unsorted and restarts on another column', () => {
    expect(nextSort('', 'name')).toBe('name:asc')
    expect(nextSort('name:asc', 'name')).toBe('name:desc')
    expect(nextSort('name:desc', 'name')).toBe('')
    expect(nextSort('name:desc', 'age')).toBe('age:asc')
  })

  test('sortRows is numeric-aware, case-insensitive, stable and keeps empties last', () => {
    const rows = ['Item 10', 'item 9', null, 'Item 1', 'item 9'].map((v, i) => ({ v, i }))
    const asc = sortRows(rows, (r) => r.v, 'asc').map((r) => r.i)
    expect(asc).toEqual([3, 1, 4, 0, 2])
    const desc = sortRows(rows, (r) => r.v, 'desc').map((r) => r.i)
    expect(desc).toEqual([0, 1, 4, 3, 2])
  })

  test('compareSortValues orders dates and numbers by value', () => {
    expect(compareSortValues(new Date(2024, 0, 2), new Date(2024, 0, 1))).toBeGreaterThan(0)
    expect(compareSortValues(2, 10)).toBeLessThan(0)
  })

  test('filterRows needs every term to match some column', () => {
    const rows = [{ a: 'Ada Lovelace', b: 'Admin' }, { a: 'Alan Turing', b: 'Owner' }]
    expect(filterRows(rows, 'ada admin', (r) => [r.a, r.b])).toEqual([rows[0]])
    expect(filterRows(rows, '  ', (r) => [r.a])).toEqual(rows)
  })
})

interface Person {
  id: string
  name: string
  age: number
}

const people: Person[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i}`,
  name: `Person ${String.fromCharCode(65 + ((i * 5) % 12))}`,
  age: 20 + ((i * 7) % 30),
}))

const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', render: (p) => p.name, sortValue: (p) => p.name, searchValue: (p) => p.name },
  { key: 'age', header: 'Age', render: (p) => String(p.age), sortValue: (p) => p.age },
]

test('pages through rows and reports the visible range', async () => {
  const user = userEvent.setup()
  render(<DataTable columns={columns} data={people} rowKey={(p) => p.id} pageSize={5} />)

  expect(screen.getAllByRole('row')).toHaveLength(6)
  expect(screen.getByText('1–5 of 12')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Page 3' }))
  expect(screen.getAllByRole('row')).toHaveLength(3)
  expect(screen.getByText('11–12 of 12')).toBeTruthy()
})

test('search filters rows and jumps back to page 1', async () => {
  const user = userEvent.setup()
  render(<DataTable columns={columns} data={people} rowKey={(p) => p.id} pageSize={5} />)

  await user.click(screen.getByRole('button', { name: 'Page 2' }))
  await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'person b')
  expect(screen.getAllByRole('row').slice(1).map((r) => r.textContent)).toEqual([
    expect.stringContaining('Person B'),
  ])
  expect(screen.getByText('1–1 of 1')).toBeTruthy()

  await user.clear(screen.getByRole('searchbox'))
  await user.type(screen.getByRole('searchbox'), 'nobody')
  expect(screen.getByRole('status').textContent).toBe('No results.')
})

test('clicking a header cycles the sort and updates aria-sort', async () => {
  const user = userEvent.setup()
  const onSortChange = vi.fn()
  render(
    <DataTable columns={columns} data={people} rowKey={(p) => p.id} pageSize={null} onSortChange={onSortChange} />
  )
  const ageHeader = screen.getByRole('columnheader', { name: /Age/ })
  const ages = () => screen.getAllByRole('row').slice(1).map((r) => Number(within(r).getAllByRole('cell')[1].textContent))

  await user.click(within(ageHeader).getByRole('button'))
  expect(onSortChange).toHaveBeenLastCalledWith('age:asc')
  expect(ageHeader.getAttribute('aria-sort')).toBe('ascending')
  expect(ages()).toEqual([...ages()].sort((a, b) => a - b))

  await user.click(within(ageHeader).getByRole('button'))
  expect(ageHeader.getAttribute('aria-sort')).toBe('descending')
  expect(ages()).toEqual([...ages()].sort((a, b) => b - a))

  await user.click(within(ageHeader).getByRole('button'))
  expect(onSortChange).toHaveBeenLastCalledWith('')
  expect(ageHeader.getAttribute('aria-sort')).toBe('none')
})

test('selection: row checkboxes, page-level select-all with indeterminate state', async () => {
  const user = userEvent.setup()
  const onSelectedKeysChange = vi.fn()

  function Host() {
    const [keys, setKeys] = useState<string[]>([])
    return (
      <DataTable
        columns={columns}
        data={people}
        rowKey={(p) => p.id}
        pageSize={5}
        selectable
        selectedKeys={keys}
        onSelectedKeysChange={(next) => {
          setKeys(next)
          onSelectedKeysChange(next)
        }}
        getRowLabel={(p) => `Select ${p.name}`}
      />
    )
  }
  render(<Host />)

  const all = screen.getByRole('checkbox', { name: 'Select all rows on this page' })
  await user.click(screen.getByRole('checkbox', { name: `Select ${people[0].name}` }))
  expect(onSelectedKeysChange).toHaveBeenLastCalledWith(['p0'])
  expect(all.getAttribute('aria-checked')).toBe('mixed')

  await user.click(all)
  expect(onSelectedKeysChange.mock.lastCall![0]).toHaveLength(5)
  expect(all.getAttribute('aria-checked')).toBe('true')
  expect(screen.getByText(/5 selected/)).toBeTruthy()

  // Selection survives paging; the next page starts unselected.
  await user.click(screen.getByRole('button', { name: 'Page 2' }))
  expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' }).getAttribute('aria-checked')).toBe('false')
  expect(screen.getByText(/5 selected/)).toBeTruthy()
})

test('server-side mode reports changes and renders data as given', async () => {
  const user = userEvent.setup()
  const onPageChange = vi.fn()
  const onSortChange = vi.fn()
  const onSearchChange = vi.fn()
  render(
    <DataTable
      columns={[{ key: 'name', header: 'Name', render: (p: Person) => p.name, sortable: true }]}
      data={people.slice(0, 3)}
      totalRows={40}
      rowKey={(p) => p.id}
      pageSize={3}
      searchable
      onPageChange={onPageChange}
      onSortChange={onSortChange}
      onSearchChange={onSearchChange}
    />
  )
  expect(screen.getByText('1–3 of 40')).toBeTruthy()
  expect(screen.getAllByRole('row')).toHaveLength(4)

  await user.click(screen.getByRole('button', { name: 'Page 2' }))
  expect(onPageChange).toHaveBeenLastCalledWith(2)
  await user.click(within(screen.getByRole('columnheader', { name: /Name/ })).getByRole('button'))
  expect(onSortChange).toHaveBeenLastCalledWith('name:asc')
  await user.type(screen.getByRole('searchbox'), 'x')
  expect(onSearchChange).toHaveBeenLastCalledWith('x')
  // Rows are not re-filtered client-side.
  expect(screen.getAllByRole('row')).toHaveLength(4)
})

test('Checkbox indeterminate exposes aria-checked=mixed', () => {
  render(<Checkbox aria-label="Some" checked="indeterminate" />)
  expect(screen.getByRole('checkbox', { name: 'Some' }).getAttribute('aria-checked')).toBe('mixed')
})
