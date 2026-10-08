// Descriptions, Result, Mentions, TableOfContents, ScrollProgress, Marquee, QRCode, VirtualList.
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { describe, expect, test, vi } from 'vitest'

import { Countdown } from '../src/components/atoms/data-display/countdown'
import { Descriptions } from '../src/components/atoms/data-display/descriptions'
import { DateRangePicker } from '../src/components/atoms/forms/date-range-picker'
import { Marquee } from '../src/components/atoms/data-display/marquee'
import { QRCode, qrCapacity } from '../src/components/atoms/data-display/qr-code'
import { encodeQR } from '../src/components/atoms/data-display/qr-code/qr-encoder'
import { VirtualList } from '../src/components/atoms/data-display/virtual-list'
import { Result } from '../src/components/atoms/feedback/result'
import { Statistic } from '../src/components/atoms/data-display/statistic'
import { ScrollProgress } from '../src/components/atoms/feedback/scroll-progress'
import { Mentions } from '../src/components/atoms/forms/mentions'
import { TableOfContents } from '../src/components/atoms/navigation/table-of-contents'

describe('Descriptions', () => {
  test('renders a definition list with the empty placeholder', () => {
    const { container } = render(
      <Descriptions
        title="Order"
        items={[
          { label: 'Customer', value: 'Ada' },
          { label: 'Coupon' },
          { label: 'Note', value: '', span: 3 },
        ]}
      />
    )
    expect(screen.getByRole('heading', { name: 'Order', level: 3 })).toBeTruthy()
    expect(container.querySelectorAll('dt')).toHaveLength(3)
    expect(container.querySelector('dt')?.nextElementSibling?.textContent).toBe('Ada')
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  test('span is capped at the column count and vertical stacks label over value', () => {
    const { container } = render(
      <Descriptions columns={2} layout="vertical" items={[{ label: 'A', value: '1', span: 9 }]} />
    )
    const item = container.querySelector('dl > div')!
    expect(item.className).toContain('sm:col-span-2')
    expect(item.className).not.toContain('lg:col-span')
    expect(item.className).toContain('flex-col')
  })
})

describe('Result', () => {
  test('shows title, description and actions under a heading', () => {
    render(<Result status="404" title="Not found" description="Gone." extra={<button>Home</button>} />)
    expect(screen.getByRole('heading', { name: 'Not found', level: 2 })).toBeTruthy()
    expect(screen.getByText('Gone.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Home' })).toBeTruthy()
  })

  test('status and heading level are configurable', () => {
    const { container } = render(<Result status="error" level={4} title="Failed" />)
    expect(container.firstElementChild?.getAttribute('data-status')).toBe('error')
    expect(screen.getByRole('heading', { level: 4 })).toBeTruthy()
  })
})

describe('Mentions', () => {
  const options = [
    { value: 'ada', label: 'Ada Lovelace' },
    { value: 'grace', label: 'Grace Hopper' },
    { value: 'gus', label: 'Gus Gone', disabled: true },
  ]

  test('typing the trigger opens a filtered listbox wired to the textarea', async () => {
    const user = userEvent.setup()
    render(<Mentions aria-label="Comment" options={options} />)
    const box = screen.getByRole('textbox', { name: 'Comment' })
    expect(box.getAttribute('aria-controls')).toBeNull()

    await user.type(box, 'hi @g')
    const list = screen.getByRole('listbox')
    expect(within(list).getAllByRole('option').map((o) => o.textContent)).toEqual(['Grace Hopper', 'Gus Gone'])
    expect(box.getAttribute('aria-controls')).toBe(list.id)
  })

  test('Enter inserts the highlighted option and keeps typing after it', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onValueChange = vi.fn()
    render(<Mentions aria-label="Comment" options={options} onSelect={onSelect} onValueChange={onValueChange} />)
    const box = screen.getByRole('textbox') as HTMLTextAreaElement

    await user.type(box, 'cc @a')
    await user.keyboard('{Enter}')
    expect(box.value).toBe('cc @ada ')
    expect(onSelect).toHaveBeenCalledWith(options[0], '@')
    expect(screen.queryByRole('listbox')).toBeNull()

    await user.keyboard('thanks')
    expect(box.value).toBe('cc @ada thanks')
  })

  test('arrow keys move the highlight and skip disabled options', async () => {
    const user = userEvent.setup()
    render(<Mentions aria-label="Comment" options={options} />)
    const box = screen.getByRole('textbox') as HTMLTextAreaElement
    await user.type(box, '@')
    const items = () => screen.getAllByRole('option')
    expect(items()[0].getAttribute('aria-selected')).toBe('true')
    await user.keyboard('{ArrowDown}')
    expect(items()[1].getAttribute('aria-selected')).toBe('true')
    await user.keyboard('{ArrowDown}') // gus is disabled, so it wraps to ada
    expect(items()[0].getAttribute('aria-selected')).toBe('true')
    expect(box.getAttribute('aria-activedescendant')).toBe(items()[0].id)
  })

  test('Escape closes the list; a mid-word @ (email) does not open it', async () => {
    const user = userEvent.setup()
    render(<Mentions aria-label="Comment" options={options} />)
    const box = screen.getByRole('textbox')
    await user.type(box, 'a@b')
    expect(screen.queryByRole('listbox')).toBeNull()
    await user.type(box, ' @g')
    expect(screen.getByRole('listbox')).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  test('supports several trigger characters and shows a not-found message', async () => {
    const user = userEvent.setup()
    render(<Mentions aria-label="Comment" options={options} prefix={['@', '#']} notFoundContent="Nobody" />)
    const box = screen.getByRole('textbox')
    await user.type(box, '#zzz')
    expect(screen.getByText('Nobody')).toBeTruthy()
  })
})

describe('TableOfContents', () => {
  const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta', level: 2 as const },
    { id: 'c', label: 'Gamma' },
  ]

  function Page({ onActiveChange }: { onActiveChange?: (id: string) => void }) {
    return (
      <>
        <TableOfContents items={items} onActiveChange={onActiveChange} />
        {items.map((i) => (
          <h2 key={i.id} id={i.id}>
            {i.label} section
          </h2>
        ))}
      </>
    )
  }

  test('is a labelled nav of anchors; the first item starts active', () => {
    render(<Page />)
    const nav = screen.getByRole('navigation', { name: 'On this page' })
    expect(within(nav).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['#a', '#b', '#c'])
    expect(screen.getByRole('link', { name: 'Alpha' }).getAttribute('aria-current')).toBe('location')
  })

  test('clicking scrolls to the heading and marks it active', async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()
    render(<Page onActiveChange={onActiveChange} />)
    const target = document.getElementById('c')!
    const scrollIntoView = vi.fn()
    target.scrollIntoView = scrollIntoView

    await user.click(screen.getByRole('link', { name: 'Gamma' }))
    expect(scrollIntoView).toHaveBeenCalled()
    expect(onActiveChange).toHaveBeenCalledWith('c')
    expect(screen.getByRole('link', { name: 'Gamma' }).getAttribute('aria-current')).toBe('location')
    expect(screen.getByRole('link', { name: 'Alpha' }).getAttribute('aria-current')).toBeNull()
  })

  test('scroll-spy follows the last heading that reached the top', async () => {
    render(<Page />)
    const tops: Record<string, number> = { a: -300, b: -10, c: 400 }
    for (const id of Object.keys(tops)) {
      document.getElementById(id)!.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect
    }
    fireEvent.scroll(window)
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Beta' }).getAttribute('aria-current')).toBe('location')
    )
  })

  test('a controlled activeId wins over scrolling', () => {
    render(<TableOfContents items={items} activeId="c" />)
    expect(screen.getByRole('link', { name: 'Gamma' }).getAttribute('aria-current')).toBe('location')
  })
})

describe('ScrollProgress', () => {
  function Harness() {
    const box = useRef<HTMLDivElement>(null)
    return (
      <>
        <ScrollProgress target={box} position="static" />
        <div ref={box} data-testid="box" />
      </>
    )
  }

  test('starts empty and follows a scroll container', async () => {
    render(<Harness />)
    const bar = screen.getByRole('progressbar', { name: 'Reading progress' })
    expect(bar.getAttribute('aria-valuenow')).toBe('0')

    const box = screen.getByTestId('box')
    Object.defineProperty(box, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(box, 'clientHeight', { value: 200, configurable: true })
    box.scrollTop = 400
    fireEvent.scroll(box)
    await waitFor(() => expect(bar.getAttribute('aria-valuenow')).toBe('50'))
  })

  test('a container with nothing to scroll stays at 0', async () => {
    render(<Harness />)
    fireEvent.scroll(screen.getByTestId('box'))
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })
})

describe('Marquee', () => {
  test('repeats its content but exposes it to assistive tech once', () => {
    const { container } = render(
      <Marquee aria-label="Logos" repeat={3}>
        <span>Acme</span>
      </Marquee>
    )
    expect(screen.getByRole('group', { name: 'Logos' })).toBeTruthy()
    const tracks = container.querySelectorAll('[role="group"] > div')
    expect(tracks).toHaveLength(3)
    expect([...tracks].map((t) => t.getAttribute('aria-hidden'))).toEqual([null, 'true', 'true'])
    expect(screen.getAllByText('Acme')).toHaveLength(3)
  })

  test('direction, orientation and duration land on the animation', () => {
    const { container } = render(
      <Marquee vertical reverse duration={12}>
        <span>x</span>
      </Marquee>
    )
    const track = container.querySelector('[role="group"] > div') as HTMLElement
    expect(track.style.animationName).toBe('marquee-y')
    expect(track.style.animationDuration).toBe('12s')
    // Play state is left to the classes so pause-on-hover can win.
    expect(track.style.animationPlayState).toBe('')
    expect(track.style.animationDirection).toBe('reverse')
  })
})

describe('QRCode', () => {
  test('draws an accessible SVG sized by version', () => {
    const { container } = render(<QRCode value="hello" label="Site link" size={120} />)
    const svg = screen.getByRole('img', { name: 'Site link' })
    expect(svg.getAttribute('width')).toBe('120')
    // Version 1 is 21 modules, plus the 4-module quiet zone on each side.
    expect(svg.getAttribute('viewBox')).toBe('0 0 29 29')
    expect(container.querySelector('path')?.getAttribute('d')).toBeTruthy()
  })

  test('the finder patterns sit in three corners', () => {
    const m = encodeQR('https://example.com', 'M')
    const n = m.length
    const ring = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        expect(m[y][x + i]).toBe(true)
        expect(m[y + 6][x + i]).toBe(true)
        expect(m[y + i][x]).toBe(true)
        expect(m[y + i][x + 6]).toBe(true)
      }
      expect(m[y + 3][x + 3]).toBe(true)
      expect(m[y + 1][x + 1]).toBe(false)
    }
    ring(0, 0)
    ring(n - 7, 0)
    ring(0, n - 7)
  })

  test('longer text picks a bigger version; higher levels hold less', () => {
    expect(encodeQR('a'.repeat(100), 'L').length).toBeGreaterThan(encodeQR('a', 'L').length)
    expect(qrCapacity('L')).toBeGreaterThan(qrCapacity('H'))
    // UTF-8 is counted in bytes: 3 bytes per character here.
    expect(encodeQR('漢'.repeat(60), 'L').length).toBeGreaterThan(encodeQR('a'.repeat(60), 'L').length)
  })

  test('input that does not fit renders the fallback and reports the error', () => {
    const onError = vi.fn()
    render(<QRCode value={'x'.repeat(qrCapacity('H') + 1)} level="H" fallback={<p>Too long</p>} onError={onError} />)
    expect(screen.getByText('Too long')).toBeTruthy()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(RangeError)
  })
})

describe('VirtualList', () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => `Row ${i + 1}`)

  test('renders only the visible window with position info', () => {
    render(<VirtualList items={rows} itemHeight={40} height={200} aria-label="Rows" renderItem={(r) => <span>{r}</span>} />)
    const items = screen.getAllByRole('listitem')
    // 5 visible rows + overscan below; far fewer than 100,000.
    expect(items.length).toBeLessThan(20)
    expect(items[0].getAttribute('aria-posinset')).toBe('1')
    expect(items[0].getAttribute('aria-setsize')).toBe('100000')
    expect(screen.getByRole('list').style.height).toBe('4000000px')
  })

  test('scrolling swaps the rendered rows', () => {
    render(<VirtualList items={rows} itemHeight={40} height={200} aria-label="Rows" renderItem={(r) => <span>{r}</span>} />)
    expect(screen.queryByText('Row 501')).toBeNull()
    const scroller = screen.getByLabelText('Rows')
    scroller.scrollTop = 20_000
    fireEvent.scroll(scroller)
    expect(screen.getByText('Row 501')).toBeTruthy()
    expect(screen.queryByText('Row 1')).toBeNull()
  })

  test('mixed heights keep rows at exact offsets', () => {
    render(
      <VirtualList
        items={['a', 'b', 'c']}
        itemHeight={(i) => (i === 0 ? 100 : 20)}
        height={300}
        aria-label="Mixed"
        renderItem={(r) => <span>{r}</span>}
      />
    )
    const [a, b, c] = screen.getAllByRole('listitem') as HTMLElement[]
    expect([a.style.top, b.style.top, c.style.top]).toEqual(['0px', '100px', '120px'])
    expect(screen.getByRole('list').style.height).toBe('140px')
  })

  test('onEndReached fires once near the end and re-arms when items grow', () => {
    const onEndReached = vi.fn()
    const items = Array.from({ length: 20 }, (_, i) => i)
    const { rerender } = render(
      <VirtualList items={items} itemHeight={40} height={200} aria-label="L" onEndReached={onEndReached} renderItem={(r) => <span>{r}</span>} />
    )
    const scroller = screen.getByLabelText('L')
    scroller.scrollTop = 560
    fireEvent.scroll(scroller)
    scroller.scrollTop = 600
    fireEvent.scroll(scroller)
    expect(onEndReached).toHaveBeenCalledTimes(1)

    rerender(
      <VirtualList items={[...items, 20, 21]} itemHeight={40} height={200} aria-label="L" onEndReached={onEndReached} renderItem={(r) => <span>{r}</span>} />
    )
    scroller.scrollTop = 680
    fireEvent.scroll(scroller)
    expect(onEndReached).toHaveBeenCalledTimes(2)
  })

  test('shows the empty content and the scroller is keyboard-focusable', () => {
    render(<VirtualList items={[]} itemHeight={40} aria-label="None" empty={<p>Nothing here</p>} renderItem={() => null} />)
    expect(screen.getByText('Nothing here')).toBeTruthy()
    expect(screen.getByLabelText('None').getAttribute('tabindex')).toBe('0')
  })
})

describe('review fixes', () => {
  test('TableOfContents activates the last heading once scrolled to the bottom', async () => {
    const items = [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'last', label: 'Last' },
    ]
    function Doc() {
      return (
        <>
          <TableOfContents items={items} />
          {items.map((i) => (
            <h2 key={i.id} id={i.id}>
              {i.label}
            </h2>
          ))}
        </>
      )
    }
    render(<Doc />)
    // "Last" is a short final section: it never reaches the top (+400px), but the page is at its end.
    const tops: Record<string, number> = { one: -500, two: -200, last: 400 }
    for (const id of Object.keys(tops)) {
      document.getElementById(id)!.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect
    }
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 1200, configurable: true })
    fireEvent.scroll(window)
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Last' }).getAttribute('aria-current')).toBe('location')
    )
    Reflect.deleteProperty(document.documentElement, 'scrollHeight')
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  test('TableOfContents can leave the URL alone', async () => {
    const user = userEvent.setup()
    const replace = vi.spyOn(history, 'replaceState')
    render(
      <>
        <TableOfContents items={[{ id: 'x', label: 'X' }]} updateHash={false} />
        <h2 id="x">X</h2>
      </>
    )
    await user.click(screen.getByRole('link', { name: 'X' }))
    expect(replace).not.toHaveBeenCalled()
  })

  test('Mentions renders its list in a portal so a clipping parent cannot hide it', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div style={{ overflow: 'hidden', height: 40 }}>
        <Mentions aria-label="Comment" options={[{ value: 'ada' }]} />
      </div>
    )
    await user.type(screen.getByRole('textbox', { name: 'Comment' }), '@')
    const list = screen.getByRole('listbox')
    expect(container.contains(list)).toBe(false)
    expect(document.body.contains(list)).toBe(true)
    // Focus stays in the textarea while the list is open.
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Comment' }))
  })

  test('Statistic animation never shows fractions for a whole-number target', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
    const { rerender, container } = render(<Statistic value={100} animated locale="en-US" duration={400} />)
    rerender(<Statistic value={200} animated locale="en-US" duration={400} />)
    const shown = () => container.querySelector('[aria-hidden="true"]')?.textContent ?? ''
    const frames: string[] = []
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        vi.advanceTimersByTime(70)
      })
      frames.push(shown())
    }
    vi.useRealTimers()
    expect(frames.every((f) => /^\d{3}$/.test(f))).toBe(true)
    expect(new Set(frames).size).toBeGreaterThan(1)
  })

  test('Countdown keeps its title in the accessible name', () => {
    render(<Countdown title="Sale ends in" value={Date.now() + 90_000} />)
    expect(screen.getByRole('timer').getAttribute('aria-label')).toBe('Sale ends in: 1m 30s left')
  })

  test('DateRangePicker keeps the chosen range in its accessible name', () => {
    const range = { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }
    const { rerender } = render(<DateRangePicker aria-label="Period" />)
    expect(screen.getByRole('button', { name: 'Period' })).toBeTruthy()
    rerender(<DateRangePicker aria-label="Period" value={range} />)
    expect(screen.getByRole('button', { name: 'Period: Sep 10, 2026 – Sep 20, 2026' })).toBeTruthy()
  })

  test('DateRangePicker with aria-labelledby appends its own text to the name', () => {
    const range = { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }
    render(
      <>
        <span id="lbl">Reporting period</span>
        <DateRangePicker aria-labelledby="lbl" value={range} />
      </>
    )
    expect(screen.getByRole('button', { name: /^Reporting period.*Sep 10, 2026/ })).toBeTruthy()
  })

  test('Marquee works out how many copies fill the box', () => {
    const original = window.ResizeObserver
    class Immediate {
      private cb: () => void
      constructor(cb: () => void) {
        this.cb = cb
      }
      observe() {
        this.cb()
      }
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = Immediate as unknown as typeof ResizeObserver
    const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000)
    const offsetWidth = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
    try {
      const { container } = render(
        <Marquee gap={20}>
          <span>x</span>
        </Marquee>
      )
      // ceil(1000 / (300 + 20)) + 1 = 5 copies, so the strip never runs short.
      expect(container.querySelectorAll('[role="group"] > div')).toHaveLength(5)
    } finally {
      window.ResizeObserver = original
      clientWidth.mockRestore()
      offsetWidth.mockRestore()
    }
  })
})
