// Regression tests for props that used to be accepted but silently ignored.
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import {
  RadioGroupCardItem,
  RadioGroupCardRoot,
  RadioGroupStackedItem,
  RadioGroupStackedRoot,
} from '../src/components/atoms/forms/radio-group'
import { Row } from '../src/components/fragments/row'

test('RadioGroup card and stacked items render their `image`', () => {
  render(
    <>
      <RadioGroupCardRoot aria-label="Layout">
        <RadioGroupCardItem value="grid" label="Grid" image={<img alt="Grid preview" src="data:," />} />
      </RadioGroupCardRoot>
      <RadioGroupStackedRoot aria-label="Plan">
        <RadioGroupStackedItem value="pro" label="Pro" image={<img alt="Pro badge" src="data:," />} />
      </RadioGroupStackedRoot>
    </>
  )
  expect(screen.getByRole('img', { name: 'Grid preview' })).toBeTruthy()
  expect(screen.getByRole('img', { name: 'Pro badge' })).toBeTruthy()
})

test('Row scrollBehavior="auto" drops the sliding transition', () => {
  const { container, rerender } = render(
    <Row maxColumns={2}>
      <div>a</div>
      <div>b</div>
    </Row>
  )
  const track = () => container.querySelector('[role="region"] > div') as HTMLElement
  expect(track().className).toContain('transition-transform')

  rerender(
    <Row maxColumns={2} scrollBehavior="auto">
      <div>a</div>
      <div>b</div>
    </Row>
  )
  expect(track().className).not.toContain('transition-transform')
})
