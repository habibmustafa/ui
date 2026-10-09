import { contrastRatio, parseColor } from '../src'

/*
 * Measures the contrast of real, rendered elements: whatever color the theme resolved
 * to (an oklch() token, an hsl() variable) is read back from the DOM, so the number on
 * the landing page is the number a user's eyes get, not a calculation about a token.
 */

let context: CanvasRenderingContext2D | null | undefined

/** Any CSS color → "#rrggbb". The canvas does the color-space conversion. */
function toHexString(css: string): string | null {
  if (context === undefined) {
    context = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  }
  if (!context) return null
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = '#000'
  context.fillStyle = css
  context.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
  return a < 250 ? null : `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

/** The first opaque background at or above an element. */
function backgroundOf(el: Element): string | null {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const hex = toHexString(getComputedStyle(node).backgroundColor)
    if (hex) return hex
  }
  return toHexString(getComputedStyle(document.body).backgroundColor) ?? '#ffffff'
}

/** WCAG contrast of an element's text color against its own (or inherited) background. */
export function measureContrast(el: Element | null): number | null {
  if (!el) return null
  const fg = toHexString(getComputedStyle(el).color)
  const bg = backgroundOf(el)
  const a = fg && parseColor(fg)
  const b = bg && parseColor(bg)
  return a && b ? contrastRatio(a, b) : null
}

export interface ContrastGrade {
  label: string
  tone: 'success' | 'warning' | 'destructive'
}

export function gradeContrast(ratio: number): ContrastGrade {
  if (ratio >= 7) return { label: 'AAA', tone: 'success' }
  if (ratio >= 4.5) return { label: 'AA', tone: 'success' }
  if (ratio >= 3) return { label: 'Large text only', tone: 'warning' }
  return { label: 'Fails', tone: 'destructive' }
}
