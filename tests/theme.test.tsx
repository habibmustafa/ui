// Theme generator: color maths, the default config reproducing the shipped palette,
// CSS output, and ThemeProvider's `tokens` prop.
import { render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

import { ThemeProvider } from '../src/providers'
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  contrastRatio,
  createTheme,
  parseColor,
  themeToCss,
  toHex,
} from '../src/theme'

const themeFile = (mode: 'light' | 'dark') =>
  readFileSync(join(__dirname, `../src/styles/vendor/theme/themes/${mode}.css`), 'utf8')

/** `--brand-500: 155.3deg 78.4% 40%;` → { '--brand-500': '155.3deg 78.4% 40%' } */
function literalScales(mode: 'light' | 'dark') {
  const out: Record<string, string> = {}
  for (const m of themeFile(mode).matchAll(
    /^\s*(--(?:brand|secondary|warning|destructive)-[a-z0-9]+):\s*([\d.]+deg [\d.]+% [\d.]+%);/gm
  )) {
    out[m[1]] = m[2]
  }
  return out
}

const fromTriplet = (triplet: string) => {
  const [h, s, l] = triplet.split(' ').map(parseFloat)
  return parseColor(`hsl(${h} ${s}% ${l}%)`)!
}

describe('color maths', () => {
  test('hex round-trips through OKLCH', () => {
    for (const hex of ['#000000', '#ffffff', '#3ecf8e', '#6366f1', '#e11d48', '#71717a']) {
      expect(toHex(parseColor(hex)!)).toBe(hex)
    }
  })

  test('parses rgb(), hsl() and oklch() as the same color', () => {
    const fromHex = parseColor('#6366f1')!
    for (const input of ['rgb(99 102 241)', 'rgb(99, 102, 241)', 'hsl(238.7 83.5% 66.7%)']) {
      const color = parseColor(input)!
      expect(Math.abs(color.l - fromHex.l)).toBeLessThan(0.005)
      expect(Math.abs(color.h - fromHex.h)).toBeLessThan(1)
    }
    expect(parseColor('oklch(0.6 0.2 270)')).toEqual({ l: 0.6, c: 0.2, h: 270 })
    expect(parseColor('oklch(60% 0.2 270)')).toEqual({ l: 0.6, c: 0.2, h: 270 })
    expect(parseColor('not a color')).toBeNull()
    expect(parseColor('#12')).toBeNull()
  })

  test('WCAG contrast ratio', () => {
    const black = parseColor('#000')!
    const white = parseColor('#fff')!
    expect(contrastRatio(black, white)).toBeCloseTo(21, 1)
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5)
    // #767676 on white is the classic 4.54:1 AA boundary.
    expect(contrastRatio(parseColor('#767676')!, white)).toBeCloseTo(4.54, 1)
  })
})

describe('createTheme', () => {
  test('an empty config emits nothing', () => {
    expect(themeToCss({})).toBe('')
  })

  test('the default config reproduces the shipped scales', () => {
    const tokens = createTheme({
      brand: DEFAULT_THEME.brand,
      accent: DEFAULT_THEME.accent,
      status: { ...DEFAULT_THEME.status },
    })
    for (const mode of ['light', 'dark'] as const) {
      const shipped = literalScales(mode)
      expect(Object.keys(shipped).length, mode).toBeGreaterThanOrEqual(19)
      for (const [name, triplet] of Object.entries(shipped)) {
        const generated = tokens[mode][name as `--${string}`]
        expect(generated, `${mode} ${name}`).toBeDefined()
        const a = fromTriplet(triplet)
        const b = fromTriplet(generated)
        const where = `${mode} ${name}: shipped ${triplet}, generated ${generated}`
        expect(Math.abs(a.l - b.l), where).toBeLessThan(0.015)
        expect(Math.abs(a.c - b.c), where).toBeLessThan(0.015)
        // Hue only means something once there is color to see.
        if (Math.min(a.c, b.c) > 0.04) {
          const dh = Math.abs(((a.h - b.h + 540) % 360) - 180)
          expect(dh, where).toBeLessThan(8)
        }
      }
    }
  })

  test('only configured parts are emitted', () => {
    const tokens = createTheme({ radius: 12 })
    expect(tokens.light).toEqual({})
    expect(tokens.dark).toEqual({})
    expect(tokens.shared).toMatchObject({ '--radius-md': '12px', '--radius-xs': '4px', '--radius-xl': '24px' })
  })

  test('neutral tint 0 keeps the shipped gray; contrast offsets light by 0.1', () => {
    const tokens = createTheme({ neutral: { tint: 0, hue: 250 }, contrast: 0.5 })
    expect(tokens.light).toMatchObject({ '--chroma': '0', '--surface-hue': '250', '--contrast': '0.6' })
    expect(tokens.dark).toMatchObject({ '--chroma': '0.005', '--contrast': '0.5' })
  })

  test('brand text color keeps AA contrast for every preset', () => {
    // --primary is the text/link color; check it against near-white and near-black
    // canvases (the shipped light / dark backgrounds).
    const lightBg = parseColor('oklch(0.995 0 0)')!
    const darkBg = parseColor('oklch(0.19 0.005 157)')!
    for (const preset of THEME_PRESETS) {
      const tokens = createTheme(preset.config)
      expect(contrastRatio(parseColor(tokens.light['--primary'])!, lightBg), preset.id).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(parseColor(tokens.dark['--primary'])!, darkBg), preset.id).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('every generated color is inside sRGB', () => {
    const tokens = createTheme({ brand: 'oklch(0.7 0.4 145)', accent: '#ff00ff', status: { warningHue: 100, destructiveHue: 0 } })
    for (const vars of [tokens.light, tokens.dark]) {
      for (const [name, value] of Object.entries(vars)) {
        if (!/deg|oklch/.test(value)) continue
        const color = value.startsWith('oklch') ? parseColor(value)! : fromTriplet(value)
        expect(toHex(color), name).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })

  test('rejects an unreadable color with a clear message', () => {
    expect(() => createTheme({ brand: 'blurple' })).toThrow(/"blurple" is not a color/)
  })

  test('themeToCss qualifies selectors with :root so load order does not matter', () => {
    const css = themeToCss({ brand: '#6366f1', radius: 8 })
    expect(css).toContain(':root:root {')
    expect(css).toContain(":root.light,\n:root[data-theme='light'] {")
    expect(css).toContain(":root.dark,\n:root[data-theme='dark'] {")
    expect(css).toMatch(/--brand-500: [\d.]+deg [\d.]+% [\d.]+%;/)
  })
})

test('ThemeProvider renders tokens as a <style>', () => {
  const { container } = render(
    <ThemeProvider tokens={{ brand: '#6366f1' }}>
      <p>content</p>
    </ThemeProvider>
  )
  const style = container.querySelector('style[data-ui-theme]')
  expect(style?.textContent).toBe(themeToCss({ brand: '#6366f1' }))
})

test('a theme change lands without transitions and leaves nothing behind', () => {
  const added: string[] = []
  const append = document.head.appendChild.bind(document.head)
  document.head.appendChild = <T extends Node>(node: T) => {
    added.push((node as unknown as HTMLElement).textContent ?? '')
    return append(node)
  }
  // As the app's inline script does before first paint.
  document.documentElement.setAttribute('data-theme', 'light')
  try {
    const { rerender } = render(<ThemeProvider defaultTheme="light" tokens={{ brand: '#6366f1' }}><p>content</p></ThemeProvider>)
    // The first theme has nothing to animate from, so no restyle is forced while mounting.
    expect(added.filter((css) => css.includes('transition:none'))).toHaveLength(0)
    rerender(<ThemeProvider defaultTheme="light" tokens={{ brand: '#22aa66' }}><p>content</p></ThemeProvider>)
    expect(added.filter((css) => css.includes('transition:none'))).toHaveLength(1)
    expect(document.head.innerHTML).not.toContain('transition:none')
  } finally {
    document.head.appendChild = append
  }
})
