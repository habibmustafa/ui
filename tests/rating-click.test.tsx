// A pointer click focuses the star before the click lands; that focus must not drop the
// hover preview, or the stars flash back to the old value until the value updates.
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import { Rating } from '../src/components/atoms/forms/rating'

const filled = (container: HTMLElement) => container.querySelectorAll('svg.fill-current').length

test('hovering then pointer-focusing a star keeps the preview', () => {
  const { container } = render(<Rating defaultValue={4} aria-label="Score" />)
  const star = screen.getByRole('radio', { name: '2 stars out of 5' })

  fireEvent.mouseEnter(star)
  expect(filled(container)).toBe(2)
  fireEvent.focus(star) // pointer focus: jsdom reports it as not :focus-visible
  expect(filled(container)).toBe(2)

  fireEvent.click(star)
  expect(filled(container)).toBe(2)
  expect(star.getAttribute('aria-checked')).toBe('true')
})

test('picking stars plays the pop on the filled ones and respects the value', () => {
  const { container } = render(<Rating aria-label="Score" />)
  fireEvent.click(screen.getByRole('radio', { name: '3 stars out of 5' }))
  expect(container.querySelectorAll('.animate-rating-pop')).toHaveLength(3)
})
