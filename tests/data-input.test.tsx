import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import { DataInput } from '../src/components/atoms/forms/data-input'
import { copyToClipboard } from '../src/lib/copy-to-clipboard'

vi.mock('../src/lib/copy-to-clipboard', () => ({ copyToClipboard: vi.fn() }))

test('reveal works without copy or extra actions', () => {
  render(<DataInput reveal defaultValue="secret" />)

  const input = screen.getByDisplayValue('secret') as HTMLInputElement
  expect(input.type).toBe('password')

  fireEvent.click(screen.getByRole('button', { name: 'Reveal' }))
  expect(input.type).toBe('text')
})

test('copy reads the current input value and keeps the forwarded ref', () => {
  const ref = createRef<HTMLInputElement>()
  render(<DataInput ref={ref} copy defaultValue="initial" />)

  const input = screen.getByDisplayValue('initial') as HTMLInputElement
  expect(ref.current).toBe(input)

  fireEvent.change(input, { target: { value: 'edited' } })
  fireEvent.click(screen.getByRole('button', { name: 'Copy' }))

  expect(copyToClipboard).toHaveBeenCalledWith('edited', expect.any(Function))
})
