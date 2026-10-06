// Pagination, Slider and Kbd: the range algorithm, paging in both link and button
// modes, and the slider's per-thumb labelling.
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { Kbd, KbdGroup } from '../src/components/atoms/data-display/kbd'
import { Slider } from '../src/components/atoms/forms/slider'
import { Pagination, getPaginationRange } from '../src/components/atoms/navigation/pagination'

describe('getPaginationRange', () => {
  test.each([
    [1, 5, 1, [1, 2, 3, 4, 5]],
    [1, 7, 1, [1, 2, 3, 4, 5, 6, 7]],
    [1, 20, 1, [1, 2, 3, 4, 5, 'ellipsis-end', 20]],
    [4, 20, 1, [1, 2, 3, 4, 5, 'ellipsis-end', 20]],
    [5, 20, 1, [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 20]],
    [10, 20, 1, [1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20]],
    [17, 20, 1, [1, 'ellipsis-start', 16, 17, 18, 19, 20]],
    [20, 20, 1, [1, 'ellipsis-start', 16, 17, 18, 19, 20]],
    [10, 20, 2, [1, 'ellipsis-start', 8, 9, 10, 11, 12, 'ellipsis-end', 20]],
    [1, 0, 1, []],
  ] as const)('page %i of %i (siblings %i)', (page, total, siblings, expected) => {
    expect(getPaginationRange(page, total, siblings)).toEqual(expected)
  })

  test('keeps a constant length while paging so the control does not jump', () => {
    const lengths = new Set(
      Array.from({ length: 30 }, (_, i) => getPaginationRange(i + 1, 30, 1).length)
    )
    expect([...lengths]).toEqual([7])
  })

  test('clamps out-of-range pages', () => {
    expect(getPaginationRange(99, 20)).toEqual(getPaginationRange(20, 20))
    expect(getPaginationRange(-3, 20)).toEqual(getPaginationRange(1, 20))
  })
})

const current = () => screen.getByRole('button', { current: 'page' })

test('Pagination (button mode) pages with numbers and Previous/Next', async () => {
  const user = userEvent.setup()
  const onPageChange = vi.fn()
  render(<Pagination totalPages={10} onPageChange={onPageChange} />)

  expect(screen.getByRole('navigation', { name: 'pagination' })).toBeTruthy()
  expect(current().textContent).toBe('1')
  expect(screen.getByRole('button', { name: 'Go to previous page' }).hasAttribute('disabled')).toBe(true)

  await user.click(screen.getByRole('button', { name: 'Page 3' }))
  expect(onPageChange).toHaveBeenLastCalledWith(3)
  expect(current().textContent).toBe('3')

  await user.click(screen.getByRole('button', { name: 'Go to next page' }))
  expect(onPageChange).toHaveBeenLastCalledWith(4)
  await user.click(screen.getByRole('button', { name: 'Page 10' }))
  expect(screen.getByRole('button', { name: 'Go to next page' }).hasAttribute('disabled')).toBe(true)
})

test('Pagination controlled page only moves when the parent updates it', async () => {
  const user = userEvent.setup()

  function Host() {
    const [page, setPage] = useState(2)
    return (
      <>
        <Pagination totalPages={5} page={page} onPageChange={(next) => next !== 4 && setPage(next)} />
        <span data-testid="page">{page}</span>
      </>
    )
  }

  render(<Host />)
  await user.click(screen.getByRole('button', { name: 'Page 3' }))
  expect(current().textContent).toBe('3')
  // The parent refuses page 4.
  await user.click(screen.getByRole('button', { name: 'Page 4' }))
  expect(current().textContent).toBe('3')
  expect(screen.getByTestId('page').textContent).toBe('3')
})

test('Pagination with getHref renders real links and a non-link disabled edge', () => {
  render(<Pagination totalPages={3} defaultPage={1} getHref={(page) => `/items?page=${page}`} />)

  const page2 = screen.getByRole('link', { name: 'Page 2' })
  expect(page2.getAttribute('href')).toBe('/items?page=2')
  expect(screen.getByRole('link', { current: 'page' }).textContent).toBe('1')

  const previous = screen.getByRole('link', { name: 'Go to previous page' })
  expect(previous.hasAttribute('href')).toBe(false)
  expect(previous.getAttribute('aria-disabled')).toBe('true')
  expect(screen.getByRole('link', { name: 'Go to next page' }).getAttribute('href')).toBe('/items?page=2')
})

test('Pagination compound parts render the same anatomy', () => {
  render(
    <Pagination.Root>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Link href="#1" isActive>
            1
          </Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
  expect(screen.getByRole('list').children).toHaveLength(2)
  expect(screen.getByRole('link', { current: 'page' }).textContent).toBe('1')
})

test('Slider moves with the keyboard and reports the new value', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<Slider defaultValue={[50]} step={10} aria-label="Volume" onValueChange={onValueChange} />)

  const thumb = screen.getByRole('slider', { name: 'Volume' })
  expect(thumb.getAttribute('aria-valuenow')).toBe('50')
  thumb.focus()
  await user.keyboard('{ArrowRight}')
  expect(onValueChange).toHaveBeenLastCalledWith([60])
  expect(thumb.getAttribute('aria-valuenow')).toBe('60')
  await user.keyboard('{Home}')
  expect(thumb.getAttribute('aria-valuenow')).toBe('0')
})

test('Slider renders one labelled thumb per value', () => {
  render(<Slider defaultValue={[20, 80]} thumbLabels={['Minimum price', 'Maximum price']} />)
  expect(screen.getByRole('slider', { name: 'Minimum price' }).getAttribute('aria-valuenow')).toBe('20')
  expect(screen.getByRole('slider', { name: 'Maximum price' }).getAttribute('aria-valuenow')).toBe('80')
})

test('Kbd renders <kbd> keys inside a group', () => {
  const { container } = render(
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
  const keys = container.querySelectorAll('kbd > kbd')
  expect([...keys].map((k) => k.textContent)).toEqual(['⌘', 'K'])
})
