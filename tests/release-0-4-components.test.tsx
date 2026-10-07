// Carousel, Rating (+ FormRating), Statistic, Countdown and Image.
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { Carousel } from '../src/components/atoms/data-display/carousel'
import { Countdown, formatCountdown } from '../src/components/atoms/data-display/countdown'
import { Gauge } from '../src/components/atoms/data-display/gauge'
import { CircularProgress } from '../src/components/atoms/feedback/circular-progress'
import { DateRangePicker, type DateRange } from '../src/components/atoms/forms/date-range-picker'
import { Image } from '../src/components/atoms/data-display/image'
import { Statistic } from '../src/components/atoms/data-display/statistic'
import { Form } from '../src/components/atoms/forms/form'
import { Rating } from '../src/components/atoms/forms/rating'
import { FormDateRangePicker, FormRating } from '../src/components/fragments/form-fields'

describe('Rating', () => {
  test('is a radio group; clicking a star selects it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating aria-label="Quality" onValueChange={onValueChange} />)
    expect(screen.getByRole('radiogroup', { name: 'Quality' })).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(5)

    await user.click(screen.getByRole('radio', { name: '4 stars out of 5' }))
    expect(onValueChange).toHaveBeenCalledWith(4)
    expect(screen.getByRole('radio', { name: '4 stars out of 5' }).getAttribute('aria-checked')).toBe('true')
  })

  test('arrow keys move and select, Home/End jump', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating aria-label="Quality" defaultValue={2} onValueChange={onValueChange} />)
    screen.getByRole('radio', { name: '2 stars out of 5' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  test('allowHalf adds half steps; allowClear resets on a repeat click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating aria-label="Quality" allowHalf allowClear onValueChange={onValueChange} />)
    expect(screen.getAllByRole('radio')).toHaveLength(10)
    await user.click(screen.getByRole('radio', { name: '2.5 stars out of 5' }))
    expect(onValueChange).toHaveBeenLastCalledWith(2.5)
    await user.click(screen.getByRole('radio', { name: '2.5 stars out of 5' }))
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  test('readOnly renders a labelled image with no controls', () => {
    render(<Rating readOnly value={3.5} allowHalf aria-label="Average" />)
    expect(screen.getByRole('img', { name: 'Average: 3.5 stars out of 5' })).toBeTruthy()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  test('disabled stars cannot be selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating aria-label="Quality" disabled onValueChange={onValueChange} />)
    await user.click(screen.getAllByRole('radio')[2])
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test('FormRating binds to react-hook-form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function Harness() {
      const methods = useForm({ defaultValues: { score: 0 } })
      return (
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <FormRating name="score" label="Score" />
            <button type="submit">Send</button>
          </form>
        </Form>
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole('radio', { name: '3 stars out of 5' }))
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).toHaveBeenCalledWith({ score: 3 }, expect.anything())
    expect(screen.getByRole('radiogroup', { name: 'Score' })).toBeTruthy()
  })
})

describe('Statistic', () => {
  test('formats numbers with precision and shows prefix/suffix', () => {
    render(<Statistic title="Revenue" value={1234.5} precision={2} locale="en-US" prefix="$" suffix="USD" />)
    expect(screen.getByText('Revenue')).toBeTruthy()
    expect(screen.getByText('1,234.50')).toBeTruthy()
    expect(screen.getByText('$')).toBeTruthy()
    expect(screen.getByText('USD')).toBeTruthy()
  })

  test('strings are shown as is; loading swaps the value for a skeleton', () => {
    const { rerender, container } = render(<Statistic value="N/A" />)
    expect(screen.getByText('N/A')).toBeTruthy()
    rerender(<Statistic value="N/A" loading />)
    expect(screen.queryByText('N/A')).toBeNull()
    expect(container.querySelector('.animate-pulse, [class*="skeleton"], [class*="pulse"]')).toBeTruthy()
  })

  test('animated exposes the final value to screen readers', () => {
    render(<Statistic value={1000} animated locale="en-US" />)
    expect(screen.getAllByText('1,000').length).toBeGreaterThan(0)
  })
})

describe('Countdown', () => {
  test('formatCountdown pads tokens, folds omitted units and keeps [literals]', () => {
    expect(formatCountdown(3_723_000, 'HH:mm:ss')).toBe('01:02:03')
    expect(formatCountdown(5_400_000, 'mm:ss')).toBe('90:00')
    expect(formatCountdown(90_061_000, 'D [days] HH:mm:ss')).toBe('1 days 01:01:01')
    expect(formatCountdown(1_234, 's.SSS')).toBe('1.234')
    expect(formatCountdown(-5, 'HH:mm:ss')).toBe('00:00:00')
  })

  test('ticks down, calls onChange and fires onFinish once at zero', () => {
    vi.useFakeTimers()
    const onFinish = vi.fn()
    const onChange = vi.fn()
    render(<Countdown value={Date.now() + 3000} onFinish={onFinish} onChange={onChange} />)
    expect(screen.getByRole('timer').textContent).toContain('00:00:03')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByRole('timer').textContent).toContain('00:00:02')
    expect(onChange).toHaveBeenLastCalledWith(2000)
    expect(onFinish).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('timer').textContent).toContain('00:00:00')
    expect(onFinish).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  test('paused freezes the display', () => {
    vi.useFakeTimers()
    render(<Countdown value={Date.now() + 5000} paused />)
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByRole('timer').textContent).toContain('00:00:05')
    vi.useRealTimers()
  })

  test('a deadline in the past finishes immediately', () => {
    const onFinish = vi.fn()
    render(<Countdown value={Date.now() - 1000} onFinish={onFinish} />)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })
})

describe('Image', () => {
  test('shows the fallback when the image fails to load', () => {
    render(<Image src="/missing.png" alt="Avatar" fallback="HM" />)
    fireEvent.error(screen.getByAltText('Avatar'))
    expect(screen.getByRole('img', { name: 'Avatar' }).textContent).toBe('HM')
  })

  test('a missing src renders the fallback straight away', () => {
    render(<Image alt="Nothing" />)
    expect(screen.getByRole('img', { name: 'Nothing' })).toBeTruthy()
  })

  test('preview opens a lightbox once loaded and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<Image src="/a.png" alt="Sunset" preview />)
    // Not previewable until the image has loaded.
    expect(screen.queryByRole('button', { name: /preview image/i })).toBeNull()

    fireEvent.load(screen.getByAltText('Sunset'))
    await user.click(screen.getByRole('button', { name: 'Preview image: Sunset' }))
    expect(screen.getByRole('dialog', { name: 'Sunset' })).toBeTruthy()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('preview can point at a larger file', async () => {
    const user = userEvent.setup()
    render(<Image src="/small.png" alt="Map" preview="/large.png" />)
    fireEvent.load(screen.getByAltText('Map'))
    await user.click(screen.getByRole('button', { name: 'Preview image: Map' }))
    const images = screen.getAllByAltText('Map')
    expect(images.map((img) => img.getAttribute('src'))).toContain('/large.png')
  })
})

describe('Carousel', () => {
  const slides = ['One', 'Two', 'Three']

  test('props mode renders labelled slides and moves with the buttons', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(<Carousel items={slides} aria-label="Demo" onIndexChange={onIndexChange} />)
    expect(screen.getByRole('region', { name: 'Demo' }).getAttribute('aria-roledescription')).toBe('carousel')
    expect(screen.getAllByRole('group', { name: /of 3$/ })).toHaveLength(3)

    const prev = screen.getByRole('button', { name: 'Previous slide' }) as HTMLButtonElement
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(prev.disabled).toBe(true)

    await user.click(next)
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('button', { name: 'Go to slide 2' }).getAttribute('aria-current')).toBe('true')
    expect(prev.disabled).toBe(false)
  })

  test('arrow keys navigate, and the last slide disables Next', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} aria-label="Demo" />)
    screen.getByRole('button', { name: 'Go to slide 1' }).focus()
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    expect((screen.getByRole('button', { name: 'Next slide' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Go to slide 3' }).getAttribute('aria-current')).toBe('true')
  })

  test('loop wraps from the last slide to the first', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} loop aria-label="Demo" defaultIndex={2} />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByRole('button', { name: 'Go to slide 1' }).getAttribute('aria-current')).toBe('true')
  })

  test('arrows and dots can be hidden with null', () => {
    render(<Carousel items={slides} arrows={null} dots={null} aria-label="Demo" />)
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Go to slide/ })).toBeNull()
  })

  test('compound mode works with a controlled index', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(
      <Carousel.Root index={0} onIndexChange={onIndexChange} aria-label="Compound">
        <Carousel.Content>
          <Carousel.Item>A</Carousel.Item>
          <Carousel.Item>B</Carousel.Item>
        </Carousel.Content>
        <Carousel.Next />
      </Carousel.Root>
    )
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
    // Controlled: it stays on slide 0 until the parent changes `index`.
    expect(screen.getByText('A').closest('[data-carousel-item]')?.hasAttribute('data-active')).toBe(true)
  })

  test('slidesPerView sizes the slides and stops at the last reachable position', async () => {
    const user = userEvent.setup()
    render(<Carousel items={['A', 'B', 'C', 'D', 'E']} slidesPerView={3} gap={10} aria-label="Multi" />)
    const items = document.querySelectorAll<HTMLElement>('[data-carousel-item]')
    expect(items[0].style.flexBasis).toMatch(/^calc(.*20px.*)$/)
    // 5 slides, 3 visible: three resting positions, so three dots.
    expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(3)
    expect([...items].map((el) => el.hasAttribute('data-active'))).toEqual([true, true, true, false, false])

    const next = screen.getByRole('button', { name: 'Next slide' }) as HTMLButtonElement
    await user.click(next)
    await user.click(next)
    expect(next.disabled).toBe(true)
    expect([...items].map((el) => el.hasAttribute('data-active'))).toEqual([false, false, true, true, true])
  })

  test('autoPlay advances and pauses while hovered', () => {
    vi.useFakeTimers()
    render(<Carousel items={slides} autoPlay={1000} aria-label="Demo" />)
    const dot = (n: number) => screen.getByRole('button', { name: `Go to slide ${n}` })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(dot(2).getAttribute('aria-current')).toBe('true')

    fireEvent.mouseEnter(screen.getByRole('region', { name: 'Demo' }))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(dot(2).getAttribute('aria-current')).toBe('true')
    vi.useRealTimers()
  })
})

describe('CircularProgress', () => {
  test('determinate: exposes value, min and max and prints the percentage', () => {
    render(<CircularProgress value={40} showValue aria-label="Upload" />)
    const bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    expect(bar.textContent).toBe('40%')
  })

  test('clamps out-of-range values and honours max', () => {
    render(<CircularProgress value={15} max={10} aria-label="Quota" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('10')
  })

  test('indeterminate: no aria-valuenow', () => {
    render(<CircularProgress aria-label="Loading" />)
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false)
  })

  test('children replace the percentage', () => {
    render(<CircularProgress value={90} showValue aria-label="Quota">9/10</CircularProgress>)
    expect(screen.getByRole('progressbar').textContent).toBe('9/10')
  })
})

describe('Gauge', () => {
  test('is a meter with value, min and max', () => {
    render(<Gauge value={42} aria-label="CPU" />)
    const meter = screen.getByRole('meter', { name: 'CPU' })
    expect(meter.getAttribute('aria-valuenow')).toBe('42')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.textContent).toBe('42')
  })

  test('clamps to the range and formats the printed value', () => {
    render(<Gauge value={250} max={200} formatValue={(v) => `${v}%`} aria-label="Load" />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuenow')).toBe('200')
    expect(meter.textContent).toBe('200%')
  })

  test('thresholds pick the tone by value', () => {
    const thresholds = [
      { from: 0, tone: 'success' },
      { from: 60, tone: 'warning' },
      { from: 85, tone: 'destructive' },
    ] as const
    const { rerender } = render(<Gauge value={10} thresholds={thresholds} aria-label="Load" />)
    expect(screen.getByRole('meter').className).toContain('text-success-600')
    rerender(<Gauge value={70} thresholds={thresholds} aria-label="Load" />)
    expect(screen.getByRole('meter').className).toContain('text-warning')
    rerender(<Gauge value={95} thresholds={thresholds} aria-label="Load" />)
    expect(screen.getByRole('meter').className).toContain('text-destructive')
  })

  test('label and range captions render', () => {
    render(<Gauge value={5} min={0} max={10} label="Score" showRange aria-label="Score" />)
    expect(screen.getByText('Score')).toBeTruthy()
    expect(screen.getByText('10')).toBeTruthy()
  })
})

describe('DateRangePicker', () => {
  const range = { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }

  test('prints the placeholder, then the formatted range', () => {
    const { rerender } = render(<DateRangePicker aria-label="Period" />)
    expect(screen.getByRole('button', { name: /^Period/ }).textContent).toContain('Pick a date range')
    rerender(<DateRangePicker aria-label="Period" value={range} />)
    expect(screen.getByRole('button', { name: /^Period/ }).textContent).toContain('Sep 10, 2026 – Sep 20, 2026')
  })

  test('picking two days reports the range and closes the popover', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateRangePicker aria-label="Period" defaultValue={{ from: new Date(2026, 8, 1) }} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: /^Period/ }))
    await user.click(screen.getByRole('button', { name: /^Saturday, September 12, 2026/ }))
    const last = onValueChange.mock.calls.at(-1)?.[0]
    expect(last.from).toBeInstanceOf(Date)
    expect(last.to).toBeInstanceOf(Date)
    expect(screen.queryByRole('grid')).toBeNull()
  })

  test('presets apply a range; Clear empties it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        aria-label="Period"
        onValueChange={onValueChange}
        presets={[{ label: 'This week', range: () => ({ from: new Date(2026, 8, 7), to: new Date(2026, 8, 13) }) }]}
      />
    )
    await user.click(screen.getByRole('button', { name: /^Period/ }))
    await user.click(screen.getByRole('button', { name: 'This week' }))
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 8, 7), to: new Date(2026, 8, 13) })

    // A complete range closes the popover; reopen it to reach Clear.
    await user.click(screen.getByRole('button', { name: /^Period/ }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
  })

  test('FormDateRangePicker binds to react-hook-form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function Harness() {
      const methods = useForm<{ period?: DateRange }>({ defaultValues: { period: range } })
      return (
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <FormDateRangePicker name="period" label="Period" />
            <button type="submit">Send</button>
          </form>
        </Form>
      )
    }
    render(<Harness />)
    expect(screen.getByRole('button', { name: /^Period/ }).textContent).toContain('Sep 10, 2026')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).toHaveBeenCalledWith({ period: range }, expect.anything())
  })
})
