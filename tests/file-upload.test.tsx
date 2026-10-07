// FileUpload: validation helpers, picking, dropping, rejecting and removing files.
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import {
  FileUpload,
  fileMatchesAccept,
  formatFileSize,
  validateFiles,
} from '../src/components/atoms/forms/file-upload'

const file = (name: string, size: number, type: string) =>
  new File([new Uint8Array(size)], name, { type })

describe('helpers', () => {
  test.each([
    [0, '0 B'],
    [1023, '1023 B'],
    [1536, '1.5 KB'],
    [10 * 1024, '10 KB'],
    [5 * 1024 * 1024, '5 MB'],
  ])('formatFileSize(%i) = %s', (bytes, text) => {
    expect(formatFileSize(bytes)).toBe(text)
  })

  test('fileMatchesAccept understands extensions, exact types and wildcards', () => {
    const png = file('photo.PNG', 1, 'image/png')
    const pdf = file('doc.pdf', 1, 'application/pdf')
    expect(fileMatchesAccept(png, 'image/*')).toBe(true)
    expect(fileMatchesAccept(png, '.png')).toBe(true)
    expect(fileMatchesAccept(pdf, 'image/*, .pdf')).toBe(true)
    expect(fileMatchesAccept(pdf, 'image/png')).toBe(false)
    expect(fileMatchesAccept(pdf, undefined)).toBe(true)
  })

  test('validateFiles reports every reason and enforces the count in arrival order', () => {
    const { accepted, rejected } = validateFiles(
      [
        file('a.png', 10, 'image/png'),
        file('big.png', 5000, 'image/png'),
        file('b.txt', 5000, 'text/plain'),
        file('c.png', 10, 'image/png'),
        file('d.png', 10, 'image/png'),
      ],
      { accept: 'image/*', maxSize: 1000, maxFiles: 3, current: 1 }
    )
    expect(accepted.map((f) => f.name)).toEqual(['a.png', 'c.png'])
    expect(rejected.map((r) => [r.file.name, r.reasons])).toEqual([
      ['big.png', ['size']],
      ['b.txt', ['type', 'size']],
      ['d.png', ['count']],
    ])
  })
})

function hiddenInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

test('picking files adds them to the list and reports the selection', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const { container } = render(<FileUpload onValueChange={onValueChange} />)

  await user.upload(hiddenInput(container), [file('a.txt', 2048, 'text/plain'), file('b.txt', 10, 'text/plain')])
  expect(onValueChange).toHaveBeenLastCalledWith([expect.any(File), expect.any(File)])

  const list = screen.getByRole('list', { name: 'Selected files' })
  const items = within(list).getAllByRole('listitem')
  expect(items.map((li) => li.textContent)).toEqual(['a.txt2 KB', 'b.txt10 B'])
})

test('dropping files validates them and lists rejections', () => {
  const onReject = vi.fn()
  render(<FileUpload accept="image/*" maxSize={100} onReject={onReject} />)

  const zone = screen.getByText('Drag and drop files here').parentElement!
  fireEvent.dragEnter(zone, { dataTransfer: { files: [] } })
  expect(zone.hasAttribute('data-dragging')).toBe(true)

  fireEvent.drop(zone, {
    dataTransfer: { files: [file('ok.png', 10, 'image/png'), file('notes.txt', 10, 'text/plain')] },
  })
  expect(zone.hasAttribute('data-dragging')).toBe(false)
  expect(screen.getByText('ok.png')).toBeTruthy()
  expect(screen.getByText('notes.txt: file type not accepted')).toBeTruthy()
  expect(onReject).toHaveBeenCalledWith([{ file: expect.any(File), reasons: ['type'] }])
})

test('remove buttons drop a file from the selection', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const { container } = render(<FileUpload onValueChange={onValueChange} />)
  await user.upload(hiddenInput(container), [file('a.txt', 1, 'text/plain'), file('b.txt', 1, 'text/plain')])

  await user.click(screen.getByRole('button', { name: 'Remove a.txt' }))
  const names = (onValueChange.mock.lastCall![0] as File[]).map((f) => f.name)
  expect(names).toEqual(['b.txt'])
  expect(screen.queryByText('a.txt')).toBeNull()
})

test('single-file mode replaces the current file', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const { container } = render(<FileUpload multiple={false} onValueChange={onValueChange} />)
  const input = hiddenInput(container)
  expect(input.multiple).toBe(false)

  await user.upload(input, file('first.pdf', 1, 'application/pdf'))
  await user.upload(input, file('second.pdf', 1, 'application/pdf'))
  expect((onValueChange.mock.lastCall![0] as File[]).map((f) => f.name)).toEqual(['second.pdf'])
})

test('the Browse button is the accessible control and opens the picker', async () => {
  const user = userEvent.setup()
  const { container } = render(<FileUpload description="PDF only" />)
  const input = hiddenInput(container)
  const click = vi.spyOn(input, 'click')

  const browse = screen.getByRole('button', { name: 'Browse files' })
  expect(browse.getAttribute('aria-describedby')).toBe(screen.getByText('PDF only').id)
  expect(input.getAttribute('aria-hidden')).toBe('true')
  await user.click(browse)
  expect(click).toHaveBeenCalledTimes(1)
})

test('disabled ignores drops and disables Browse', () => {
  const onValueChange = vi.fn()
  render(<FileUpload disabled onValueChange={onValueChange} />)
  const zone = screen.getByText('Drag and drop files here').parentElement!
  fireEvent.drop(zone, { dataTransfer: { files: [file('a.txt', 1, 'text/plain')] } })
  expect(onValueChange).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Browse files' }).hasAttribute('disabled')).toBe(true)
})
