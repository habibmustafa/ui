// LocaleProvider: the built-in words of the newer components can be reworded or translated.
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'

import { Carousel } from '../src/components/atoms/data-display/carousel'
import { Countdown } from '../src/components/atoms/data-display/countdown'
import { Image } from '../src/components/atoms/data-display/image'
import { Mentions } from '../src/components/atoms/forms/mentions'
import { Rating } from '../src/components/atoms/forms/rating'
import { TableOfContents } from '../src/components/atoms/navigation/table-of-contents'
import { LocaleProvider, defaultLabels } from '../src/providers'

const az = {
  carouselPrevious: 'Əvvəlki slayd',
  carouselNext: 'Növbəti slayd',
  carouselGoTo: (n: number) => `${n}-ci slayda keç`,
  carouselSlide: (n: number, total: number) => `${total} slayddan ${n}`,
  imageClose: 'Önizləməni bağla',
  imagePreview: (alt: string) => `Şəkli böyüt: ${alt}`,
  mentionsEmpty: 'Nəticə yoxdur',
  tableOfContents: 'Bu səhifədə',
  ratingValue: (v: number, max: number) => `${max} ulduzdan ${v}`,
  timeLeft: (ms: number) => `${Math.ceil(ms / 1000)} saniyə qalıb`,
}

describe('LocaleProvider', () => {
  test('works without a provider: the English defaults', () => {
    render(<Carousel items={['a', 'b']} aria-label="Demo" />)
    expect(screen.getByRole('button', { name: defaultLabels.carouselNext })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeTruthy()
  })

  test('translates the carousel buttons, dots and slide names', () => {
    render(
      <LocaleProvider labels={az}>
        <Carousel items={['a', 'b']} aria-label="Demo" />
      </LocaleProvider>
    )
    expect(screen.getByRole('button', { name: 'Növbəti slayd' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Əvvəlki slayd' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '2-ci slayda keç' })).toBeTruthy()
    expect(screen.getAllByRole('group', { name: '2 slayddan 1' })).toHaveLength(1)
  })

  test('translates the image preview and its close button', async () => {
    const user = userEvent.setup()
    render(
      <LocaleProvider labels={az}>
        <Image src="/a.png" alt="Gün batımı" preview />
      </LocaleProvider>
    )
    fireEvent.load(screen.getByAltText('Gün batımı'))
    await user.click(screen.getByRole('button', { name: 'Şəkli böyüt: Gün batımı' }))
    expect(screen.getByRole('button', { name: 'Önizləməni bağla' })).toBeTruthy()
  })

  test('translates Mentions, TableOfContents, Rating and Countdown', async () => {
    const user = userEvent.setup()
    render(
      <LocaleProvider labels={az}>
        <Mentions aria-label="Qeyd" options={[{ value: 'ada' }]} />
        <TableOfContents items={[{ id: 'x', label: 'X' }]} />
        <Rating aria-label="Qiymət" defaultValue={3} />
        <Countdown title="Qalıb" value={Date.now() + 90_000} />
      </LocaleProvider>
    )
    await user.type(screen.getByRole('textbox', { name: 'Qeyd' }), '@zzz')
    expect(screen.getByText('Nəticə yoxdur')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Bu səhifədə' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: '5 ulduzdan 3' })).toBeTruthy()
    expect(screen.getByRole('timer').getAttribute('aria-label')).toBe('Qalıb: 90 saniyə qalıb')
  })

  test('a component prop beats the provider, and an unset label stays English', () => {
    render(
      <LocaleProvider labels={{ carouselNext: 'Irəli' }}>
        <Carousel items={['a', 'b']} aria-label="Demo" />
        <TableOfContents items={[{ id: 'x', label: 'X' }]} aria-label="Contents" />
      </LocaleProvider>
    )
    expect(screen.getByRole('button', { name: 'Irəli' })).toBeTruthy()
    // Not provided: still the English default.
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeTruthy()
    // The component's own aria-label wins over the (default) label.
    expect(screen.getByRole('navigation', { name: 'Contents' })).toBeTruthy()
  })

  test('nested providers merge: the inner one only overrides what it sets', () => {
    render(
      <LocaleProvider labels={{ carouselNext: 'Outer next', carouselPrevious: 'Outer previous' }}>
        <LocaleProvider labels={{ carouselNext: 'Inner next' }}>
          <Carousel items={['a', 'b']} aria-label="Demo" />
        </LocaleProvider>
      </LocaleProvider>
    )
    expect(screen.getByRole('button', { name: 'Inner next' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Outer previous' })).toBeTruthy()
  })
})
