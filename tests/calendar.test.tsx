// Calendar day buttons must contain the visible day number in their accessible name
// (WCAG 2.5.3) — react-day-picker's default "Sunday, September 7th, 2026" doesn't.
import { render, screen } from '@testing-library/react'
import { es } from 'react-day-picker/locale'
import { expect, test } from 'vitest'

import { Calendar } from '../src/components/atoms/forms/calendar'

const month = new Date(2026, 8, 1) // September 2026

test('day names contain the visible number as a word', () => {
  render(<Calendar mode="single" month={month} />)
  const day7 = screen.getByRole('button', { name: 'Monday, September 7, 2026' })
  expect(day7.textContent).toBe('7')
  for (const button of screen.getAllByRole('button').filter((b) => /^\d+$/.test(b.textContent ?? ''))) {
    expect(button.getAttribute('aria-label')).toMatch(new RegExp(`(^|\\D)${button.textContent}(\\D|$)`))
  }
})

test('today and selected are still announced', () => {
  render(<Calendar mode="single" month={month} selected={new Date(2026, 8, 23)} today={new Date(2026, 8, 10)} />)
  expect(screen.getByRole('button', { name: 'Today, Thursday, September 10, 2026' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Wednesday, September 23, 2026, selected' })).toBeTruthy()
})

test('locales whose full date already has the plain number keep their own format', () => {
  render(<Calendar mode="single" month={month} locale={es} />)
  expect(screen.getByRole('button', { name: /^lunes, 7 de septiembre de 2026/ })).toBeTruthy()
})

test('a consumer labelDayButton still wins', () => {
  render(<Calendar mode="single" month={month} labels={{ labelDayButton: (d) => `Day ${d.getDate()}` }} />)
  expect(screen.getByRole('button', { name: 'Day 7' })).toBeTruthy()
})
