/*
 * Small colour toolkit for the theme generator: parse a CSS colour, work in OKLCH,
 * map back into sRGB, and measure WCAG contrast. No dependencies; the conversions
 * are Björn Ottosson's OKLab matrices.
 */

export interface Oklch {
  /** Lightness, 0–1. */
  l: number
  /** Chroma, 0 – ~0.37 in sRGB. */
  c: number
  /** Hue in degrees, 0–360. */
  h: number
}

type Rgb = [number, number, number]

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const round = (n: number, digits: number) => Number(n.toFixed(digits))

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function rgbToOklch([r, g, b]: Rgb): Oklch {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c, h }
}

/** OKLCH → gamma-encoded sRGB, unclamped (components may fall outside 0–1). */
function oklchToRgbRaw({ l: L, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180
  const A = c * Math.cos(rad)
  const B = c * Math.sin(rad)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

/** Reduces chroma (keeping lightness and hue) until the colour fits in sRGB. */
export function toGamut(color: Oklch): Oklch {
  const l = clamp(color.l, 0, 1)
  if (inGamut(oklchToRgbRaw({ ...color, l }))) return { ...color, l }
  let low = 0
  let high = color.c
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2
    if (inGamut(oklchToRgbRaw({ l, c: mid, h: color.h }))) low = mid
    else high = mid
  }
  return { l, c: low, h: color.h }
}

export function oklchToRgb(color: Oklch): Rgb {
  return oklchToRgbRaw(toGamut(color)).map((v) => clamp(v, 0, 1)) as Rgb
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)]
}

const NUMBER = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?`

/**
 * Parses #rgb, #rrggbb, rgb(), hsl() and oklch() (space or comma separated, alpha
 * ignored). Returns null for anything else, so callers can keep the last valid value.
 */
export function parseColor(input: string): Oklch | null {
  const value = input.trim().toLowerCase()

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value)
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1]
    const rgb = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255) as Rgb
    return rgbToOklch(rgb)
  }

  const fn = /^(rgb|rgba|hsl|hsla|oklch)\((.*)\)$/.exec(value)
  if (!fn) return null
  const parts = fn[2]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .slice(0, 3)
  if (parts.length < 3) return null
  const num = (part: string) => (new RegExp(`^${NUMBER}`).test(part) ? parseFloat(part) : NaN)
  const [a, b, c] = parts.map(num)
  if ([a, b, c].some(Number.isNaN)) return null

  if (fn[1].startsWith('rgb')) {
    const channel = (part: string, n: number) => (part.endsWith('%') ? n / 100 : n / 255)
    return rgbToOklch([channel(parts[0], a), channel(parts[1], b), channel(parts[2], c)])
  }
  if (fn[1].startsWith('hsl')) {
    return rgbToOklch(hslToRgb(((a % 360) + 360) % 360, clamp(b / 100, 0, 1), clamp(c / 100, 0, 1)))
  }
  // oklch(L C H): L as 0–1 or a percentage.
  return { l: parts[0].endsWith('%') ? a / 100 : a, c: Math.max(0, b), h: ((c % 360) + 360) % 360 }
}

export function toHex(color: Oklch): string {
  return `#${oklchToRgb(color)
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}

/** `oklch(L C H)` with the colour already mapped into sRGB. */
export function toOklchCss(color: Oklch): string {
  const { l, c, h } = toGamut(color)
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`
}

/** The `H S% L%` triplet the stepped scales use (`hsl(var(--brand-500))`). */
export function toHslTriplet(color: Oklch): string {
  const [r, g, b] = oklchToRgb(color)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d > 1e-6) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = (h * 60 + 360) % 360
  }
  return `${round(h, 1)}deg ${round(s * 100, 1)}% ${round(l * 100, 1)}%`
}

function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2 contrast ratio between two colours (1 – 21). */
export function contrastRatio(a: Oklch | Rgb, b: Oklch | Rgb): number {
  const rgb = (x: Oklch | Rgb) => (Array.isArray(x) ? x : oklchToRgb(x))
  const [la, lb] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (la + 0.05) / (lb + 0.05)
}
