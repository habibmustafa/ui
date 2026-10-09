import { parseColor, toGamut, toHslTriplet, toOklchCss, type Oklch } from './color'

/*
 * Theme generator: a small config in, CSS custom properties out.
 *
 * The library's neutral palette is already derived in CSS from a few inputs
 * (--surface-hue, --chroma, --contrast — see styles/vendor/theme/semantic.css); the
 * stepped scales (--brand-200…600, --secondary-*, --warning-*, --destructive-*) are
 * per-theme literals. This generator fills both: it sets the inputs, and rebuilds
 * each scale from a *profile* measured off the original theme (the lightness and
 * relative chroma of every step, per mode) with the chosen color's hue and
 * saturation. So the default config reproduces the shipped palette, and any other
 * color keeps the same light/dark contrast structure (button text stays readable,
 * hover steps stay distinct).
 *
 * Only keys present in the config are emitted: createTheme({ brand }) touches the
 * brand tokens and nothing else.
 */

export interface ThemeConfig {
  /** Main brand color, as any CSS color (hex, rgb(), hsl(), oklch()). */
  brand?: string
  /** Second accent: the info color, the second chart series and the secondary scale. */
  accent?: string
  neutral?: {
    /** Hue (0–360) of the neutral tint. Defaults to the brand hue. */
    hue?: number
    /** 0 = plain gray (the default), 1 = clearly tinted surfaces and text. */
    tint?: number
  }
  /** 0 – 1; 0.5 is the default. Higher = stronger text, borders and dividers. */
  contrast?: number
  status?: {
    /** Hue of warning colors (default ≈ 75, amber). */
    warningHue?: number
    /** Hue of destructive colors (default ≈ 25, red). */
    destructiveHue?: number
  }
  /** Corner radius of `rounded-md` in px (default 8); the other sizes scale with it. */
  radius?: number
  font?: {
    /** CSS font-family for body text, e.g. "'IBM Plex Sans'". The font must be loaded. */
    sans?: string
    /** CSS font-family for code. */
    mono?: string
  }
}

export type ThemeVariables = Record<`--${string}`, string>

export interface ThemeTokens {
  /** The config these tokens were generated from. */
  config: ThemeConfig
  /** Variables shared by both modes (radius, fonts). */
  shared: ThemeVariables
  light: ThemeVariables
  dark: ThemeVariables
}

/** The values the library ships with — what an empty config means. */
export const DEFAULT_THEME = {
  brand: '#8b5cf6',
  accent: '#14b8a6',
  neutral: { hue: undefined as number | undefined, tint: 0 },
  contrast: 0.5,
  status: { warningHue: 75, destructiveHue: 25 },
  radius: 8,
  font: { sans: 'Inter', mono: "'Source Code Pro'" },
} as const

type Mode = 'light' | 'dark'
type Step = { l: number; c: number; dh?: number }

/* Profiles measured from the original light.css / dark.css (OKLCH). `c` is relative
   to the scale's reference chroma; `dh` a per-step hue offset where the original
   ramp deliberately drifts (amber → yellow as warning gets lighter). */
const BRAND_REF_C = 0.155
/* Lightest a light-mode brand fill may be: ~3:1 against white for a mid-chroma hue
   (WCAG 1.4.11, non-text contrast for switches, sliders, checked states). */
const LIGHT_FILL_MAX_L = 0.63
const BRAND: Record<Mode, Record<string, Step>> = {
  light: {
    '600': { l: 0.518, c: 0.117 },
    '500': { l: 0.6, c: 0.15 },
    '400': { l: 0.76, c: 0.155 },
    '300': { l: 0.9, c: 0.09 },
    '200': { l: 0.947, c: 0.047 },
  },
  dark: {
    '600': { l: 0.839, c: 0.104 },
    '500': { l: 0.436, c: 0.104 },
    '400': { l: 0.276, c: 0.062 },
    '300': { l: 0.247, c: 0.055 },
    '200': { l: 0.13, c: 0.024 },
  },
}
/* Accessible text / control color (`text-primary`), per mode. */
const PRIMARY: Record<Mode, Step> = {
  light: { l: 0.525, c: 0.12 },
  dark: { l: 0.76, c: 0.15 },
}
/* Chart series built from brand (1) and accent (2): line/bar and soft fill. */
const CHART: Record<Mode, { line: Step; fill: Step }> = {
  light: { line: { l: 0.6, c: 0.16 }, fill: { l: 0.86, c: 0.07 } },
  dark: { line: { l: 0.72, c: 0.15 }, fill: { l: 0.38, c: 0.08 } },
}
const ACCENT_REF_C = 0.218
const ACCENT: Record<string, Step> = {
  default: { l: 0.613, c: 0.218 },
  '400': { l: 0.298, c: 0.12 },
  '200': { l: 0.185, c: 0.059 },
}
const WARNING: Record<Mode, Record<string, Step>> = {
  light: {
    '600': { l: 0.676, c: 0.155, dh: -17 },
    '500': { l: 0.824, c: 0.123, dh: 1 },
    '400': { l: 0.924, c: 0.088, dh: 12 },
    '300': { l: 0.968, c: 0.042, dh: 16 },
    '200': { l: 0.989, c: 0.009, dh: 10 },
  },
  dark: {
    default: { l: 0.708, c: 0.152, dh: -4 },
    '600': { l: 0.708, c: 0.152, dh: -4 },
    '500': { l: 0.409, c: 0.088, dh: -8 },
    '400': { l: 0.316, c: 0.071, dh: -10 },
    '300': { l: 0.253, c: 0.056, dh: -8 },
    '200': { l: 0.228, c: 0.048, dh: 2 },
  },
}
const DESTRUCTIVE: Record<Mode, Record<string, Step>> = {
  light: {
    default: { l: 0.627, c: 0.194, dh: 8 },
    '600': { l: 0.552, c: 0.193, dh: 8 },
    '500': { l: 0.816, c: 0.082, dh: 7 },
    '400': { l: 0.912, c: 0.042, dh: 2 },
    '300': { l: 0.967, c: 0.016, dh: 2 },
    '200': { l: 0.993, c: 0.003, dh: -8 },
  },
  dark: {
    default: { l: 0.627, c: 0.194, dh: 8 },
    '600': { l: 0.685, c: 0.172, dh: 8 },
    '500': { l: 0.401, c: 0.129, dh: 7 },
    '400': { l: 0.313, c: 0.085, dh: 5 },
    '300': { l: 0.26, c: 0.057, dh: 5 },
    '200': { l: 0.202, c: 0.015, dh: 8 },
  },
}

const MODES: Mode[] = ['light', 'dark']
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const hue = (h: number) => ((h % 360) + 360) % 360

/** Scales the profile's chroma by how saturated the chosen color is. */
function chromaFactor(color: Oklch, reference: number) {
  return clamp(color.c / reference, 0, 1.6)
}

function step(profile: Step, h: number, factor = 1): Oklch {
  return toGamut({ l: profile.l, c: profile.c * factor, h: hue(h + (profile.dh ?? 0)) })
}

function requireColor(value: string, key: string): Oklch {
  const color = parseColor(value)
  if (!color) throw new Error(`createTheme: "${value}" is not a color this generator can read (${key}).`)
  return color
}

export function createTheme(config: ThemeConfig = {}): ThemeTokens {
  const shared: ThemeVariables = {}
  const modes: Record<Mode, ThemeVariables> = { light: {}, dark: {} }
  const set = (vars: Partial<Record<`--${string}`, string>>) => {
    for (const mode of MODES) Object.assign(modes[mode], vars)
  }

  const brand = config.brand ? requireColor(config.brand, 'brand') : null
  if (brand) {
    const factor = chromaFactor(brand, BRAND_REF_C)
    // The picked color itself is the solid fill (switches, slider range, checked
    // states), kept in a lightness band where it holds 3:1 against the canvas: on
    // light surfaces no lighter than 0.63, on dark ones no darker than 0.5.
    const fills: Record<Mode, Oklch> = {
      light: toGamut({ ...brand, l: clamp(brand.l, 0.45, LIGHT_FILL_MAX_L) }),
      dark: toGamut({ ...brand, l: clamp(brand.l, 0.5, 0.85) }),
    }
    set({ '--hue': String(Math.round(brand.h * 10) / 10), '--primary-hue': String(Math.round(brand.h * 10) / 10) })
    for (const mode of MODES) {
      const vars = modes[mode]
      vars['--brand-default'] = toHslTriplet(fills[mode])
      for (const [name, profile] of Object.entries(BRAND[mode])) {
        vars[`--brand-${name}`] = toHslTriplet(step(profile, brand.h, factor))
      }
      vars['--primary'] = toOklchCss(step(PRIMARY[mode], brand.h, Math.min(factor, 1.4)))
      vars['--chart-1'] = toOklchCss(step(CHART[mode].line, brand.h, factor))
      vars['--chart-1-fill'] = toOklchCss(step(CHART[mode].fill, brand.h, factor))
    }
  }

  const accent = config.accent ? requireColor(config.accent, 'accent') : null
  if (accent) {
    const factor = clamp(accent.c / ACCENT_REF_C, 0, 1.3)
    set({ '--info-hue': String(Math.round(accent.h * 10) / 10) })
    for (const mode of MODES) {
      const vars = modes[mode]
      for (const [name, profile] of Object.entries(ACCENT)) {
        vars[`--secondary-${name}`] = toHslTriplet(step(profile, accent.h, factor))
      }
      const lineFactor = chromaFactor(accent, BRAND_REF_C)
      vars['--chart-2'] = toOklchCss(step(CHART[mode].line, accent.h, lineFactor))
      vars['--chart-2-fill'] = toOklchCss(step(CHART[mode].fill, accent.h, lineFactor))
    }
  }

  if (config.neutral) {
    const tint = clamp(config.neutral.tint ?? 0, 0, 1)
    const neutralHue = config.neutral.hue ?? brand?.h
    // Plain gray at tint 0 matches the shipped light (0) and dark (0.005) chroma.
    modes.light['--chroma'] = String(Math.round(tint * 0.02 * 10000) / 10000)
    modes.dark['--chroma'] = String(Math.round((0.005 + tint * 0.025) * 10000) / 10000)
    if (neutralHue !== undefined) set({ '--surface-hue': String(Math.round(hue(neutralHue) * 10) / 10) })
  }

  if (config.contrast !== undefined) {
    const contrast = clamp(config.contrast, 0, 1)
    // Light runs higher by default (0.6 vs 0.5): borders and secondary text need more
    // weight to hold up on a near-white canvas.
    modes.light['--contrast'] = String(Math.round(clamp(contrast + 0.1, 0, 1) * 1000) / 1000)
    modes.dark['--contrast'] = String(contrast)
  }

  if (config.status?.warningHue !== undefined) {
    const h = config.status.warningHue
    set({ '--warning-hue': String(hue(h)) })
    for (const mode of MODES) {
      for (const [name, profile] of Object.entries(WARNING[mode])) {
        modes[mode][`--warning-${name}`] = toHslTriplet(step(profile, h))
      }
    }
  }
  if (config.status?.destructiveHue !== undefined) {
    const h = config.status.destructiveHue
    set({ '--destructive-hue': String(hue(h)) })
    for (const mode of MODES) {
      for (const [name, profile] of Object.entries(DESTRUCTIVE[mode])) {
        modes[mode][`--destructive-${name}`] = toHslTriplet(step(profile, h))
      }
    }
  }

  if (config.radius !== undefined) {
    const r = Math.max(0, config.radius)
    const px = (n: number) => `${Math.round(n * 100) / 100}px`
    Object.assign(shared, {
      '--radius-xs': px(r / 3),
      '--radius-sm': px((r * 2) / 3),
      '--radius-md': px(r),
      '--radius-lg': px((r * 4) / 3),
      '--radius-xl': px(r * 2),
      '--radius-panel': px(r),
    })
  }

  // The type scale reads var(--font-inter, Inter) / var(--font-source-code-pro, …)
  // first, so setting those swaps the family without touching the stacks.
  if (config.font?.sans) shared['--font-inter'] = config.font.sans
  if (config.font?.mono) shared['--font-source-code-pro'] = config.font.mono

  return { config, shared, light: modes.light, dark: modes.dark }
}

function block(selector: string, vars: ThemeVariables) {
  const lines = Object.entries(vars).map(([name, value]) => `  ${name}: ${value};`)
  return lines.length ? `${selector} {\n${lines.join('\n')}\n}` : ''
}

/**
 * The tokens as a stylesheet. Selectors are `:root`-qualified (specificity 0,2,0) so
 * they win over the library's own `.light` / `[data-theme='light']` blocks whatever
 * order the stylesheets load in.
 */
export function themeToCss(tokens: ThemeTokens | ThemeConfig): string {
  const theme = 'shared' in tokens ? tokens : createTheme(tokens)
  return [
    block(':root:root', theme.shared),
    block(":root.light,\n:root[data-theme='light']", theme.light),
    block(":root.dark,\n:root[data-theme='dark']", theme.dark),
  ]
    .filter(Boolean)
    .join('\n\n')
}
