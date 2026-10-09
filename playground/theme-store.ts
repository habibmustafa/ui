import { useSyncExternalStore } from 'react'

import { DEFAULT_THEME, parseColor, type ThemeConfig } from '../src'

/*
 * The theme builder's state: every control's value (not just the non-default ones),
 * kept in a tiny external store so the /theme page and the site-wide <ThemeStyle>
 * in app.tsx read the same thing. Persisted to localStorage; the builder also mirrors
 * it into the URL so a link reproduces the theme.
 */

export interface BuilderState {
  brand: string
  accent: string
  tint: number
  /** null = follow the brand hue. */
  neutralHue: number | null
  contrast: number
  warningHue: number
  destructiveHue: number
  radius: number
  sans: string
  mono: string
}

export interface FontOption {
  id: string
  label: string
  /** CSS font-family value. */
  family: string
  /** Google Fonts family name to load, or null when nothing needs loading. */
  google: string | null
}

export const SANS_FONTS: FontOption[] = [
  { id: 'inter', label: 'Inter', family: 'Inter', google: null },
  { id: 'system', label: 'System UI', family: "system-ui, -apple-system, 'Segoe UI', Roboto", google: null },
  { id: 'ibm-plex-sans', label: 'IBM Plex Sans', family: "'IBM Plex Sans'", google: 'IBM Plex Sans:wght@400;500;600' },
  { id: 'manrope', label: 'Manrope', family: 'Manrope', google: 'Manrope:wght@400;500;600' },
  { id: 'nunito-sans', label: 'Nunito Sans', family: "'Nunito Sans'", google: 'Nunito Sans:wght@400;500;600' },
  { id: 'geist', label: 'Geist', family: 'Geist', google: 'Geist:wght@400;500;600' },
]

export const MONO_FONTS: FontOption[] = [
  { id: 'source-code-pro', label: 'Source Code Pro', family: "'Source Code Pro'", google: null },
  { id: 'jetbrains-mono', label: 'JetBrains Mono', family: "'JetBrains Mono'", google: 'JetBrains Mono:wght@400;500' },
  { id: 'ibm-plex-mono', label: 'IBM Plex Mono', family: "'IBM Plex Mono'", google: 'IBM Plex Mono:wght@400;500' },
  { id: 'fira-code', label: 'Fira Code', family: "'Fira Code'", google: 'Fira Code:wght@400;500' },
]

export const DEFAULT_STATE: BuilderState = {
  brand: DEFAULT_THEME.brand,
  accent: DEFAULT_THEME.accent,
  tint: DEFAULT_THEME.neutral.tint,
  neutralHue: null,
  contrast: DEFAULT_THEME.contrast,
  warningHue: DEFAULT_THEME.status.warningHue,
  destructiveHue: DEFAULT_THEME.status.destructiveHue,
  radius: DEFAULT_THEME.radius,
  sans: 'inter',
  mono: 'source-code-pro',
}

const fontById = (list: FontOption[], id: string) => list.find((f) => f.id === id) ?? list[0]
export const sansFont = (state: BuilderState) => fontById(SANS_FONTS, state.sans)
export const monoFont = (state: BuilderState) => fontById(MONO_FONTS, state.mono)

/** The library config for this state, leaving out everything still at its default. */
export function toConfig(state: BuilderState): ThemeConfig {
  const d = DEFAULT_STATE
  const config: ThemeConfig = {}
  if (state.brand !== d.brand) config.brand = state.brand
  if (state.accent !== d.accent) config.accent = state.accent
  if (state.tint !== d.tint || state.neutralHue !== d.neutralHue) {
    config.neutral = { tint: state.tint, ...(state.neutralHue !== null && { hue: state.neutralHue }) }
  }
  if (state.contrast !== d.contrast) config.contrast = state.contrast
  if (state.warningHue !== d.warningHue || state.destructiveHue !== d.destructiveHue) {
    config.status = {
      ...(state.warningHue !== d.warningHue && { warningHue: state.warningHue }),
      ...(state.destructiveHue !== d.destructiveHue && { destructiveHue: state.destructiveHue }),
    }
  }
  if (state.radius !== d.radius) config.radius = state.radius
  if (state.sans !== d.sans || state.mono !== d.mono) {
    config.font = {
      ...(state.sans !== d.sans && { sans: sansFont(state).family }),
      ...(state.mono !== d.mono && { mono: monoFont(state).family }),
    }
  }
  return config
}

/** Builder state for a library config (a preset or an imported file). */
export function fromConfig(config: ThemeConfig): BuilderState {
  const d = DEFAULT_STATE
  const font = (list: FontOption[], family: string | undefined, fallback: string) =>
    family ? (list.find((f) => f.family === family)?.id ?? fallback) : fallback
  return {
    brand: config.brand && parseColor(config.brand) ? config.brand : d.brand,
    accent: config.accent && parseColor(config.accent) ? config.accent : d.accent,
    tint: config.neutral?.tint ?? d.tint,
    neutralHue: config.neutral?.hue ?? null,
    contrast: config.contrast ?? d.contrast,
    warningHue: config.status?.warningHue ?? d.warningHue,
    destructiveHue: config.status?.destructiveHue ?? d.destructiveHue,
    radius: config.radius ?? d.radius,
    sans: font(SANS_FONTS, config.font?.sans, d.sans),
    mono: font(MONO_FONTS, config.font?.mono, d.mono),
  }
}

/* ---------------------------------------------------------------- URL */

const URL_KEYS: { [K in keyof BuilderState]: string } = {
  brand: 'brand',
  accent: 'accent',
  tint: 'tint',
  neutralHue: 'nhue',
  contrast: 'contrast',
  warningHue: 'warn',
  destructiveHue: 'danger',
  radius: 'radius',
  sans: 'font',
  mono: 'mono',
}

export function stateToQuery(state: BuilderState): string {
  const params = new URLSearchParams()
  for (const key of Object.keys(URL_KEYS) as (keyof BuilderState)[]) {
    const value = state[key]
    if (value === DEFAULT_STATE[key] || value === null) continue
    params.set(URL_KEYS[key], typeof value === 'string' ? value.replace(/^#/, '') : String(value))
  }
  return params.toString()
}

/** Reads builder params from a query string; null when it carries none. */
export function stateFromQuery(query: string): BuilderState | null {
  const params = new URLSearchParams(query)
  if (![...params.keys()].some((key) => Object.values(URL_KEYS).includes(key))) return null
  const state: BuilderState = { ...DEFAULT_STATE }
  const color = (raw: string | null, fallback: string) => {
    if (!raw) return fallback
    const value = /^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw) ? `#${raw}` : raw
    return parseColor(value) ? value : fallback
  }
  const number = (raw: string | null, fallback: number, min: number, max: number) => {
    const n = raw === null ? NaN : Number(raw)
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
  }
  state.brand = color(params.get('brand'), state.brand)
  state.accent = color(params.get('accent'), state.accent)
  state.tint = number(params.get('tint'), state.tint, 0, 1)
  state.neutralHue = params.has('nhue') ? number(params.get('nhue'), 0, 0, 360) : null
  state.contrast = number(params.get('contrast'), state.contrast, 0, 1)
  state.warningHue = number(params.get('warn'), state.warningHue, 0, 360)
  state.destructiveHue = number(params.get('danger'), state.destructiveHue, 0, 360)
  state.radius = number(params.get('radius'), state.radius, 0, 24)
  const font = params.get('font')
  if (font && SANS_FONTS.some((f) => f.id === font)) state.sans = font
  const mono = params.get('mono')
  if (mono && MONO_FONTS.some((f) => f.id === mono)) state.mono = mono
  return state
}

/* ---------------------------------------------------------------- store */

/** The builder's theme styles every page of the site. */
interface Snapshot {
  state: BuilderState
}

const STORAGE_KEY = 'ui-theme-builder'
const listeners = new Set<() => void>()

function load(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Snapshot>
      return { state: { ...DEFAULT_STATE, ...parsed.state } }
    }
  } catch {
    // Blocked or corrupt storage: start from the defaults.
  }
  return { state: DEFAULT_STATE }
}

// What the server renders and what hydration starts from; the stored state takes over right
// after hydration (see useThemeBuilder).
const SERVER_SNAPSHOT: Snapshot = { state: DEFAULT_STATE }

let snapshot: Snapshot = typeof window === 'undefined' ? SERVER_SNAPSHOT : load()

/** The state the store holds right now, which is what the next render will see. */
export const getBuilderState = () => snapshot.state

function commit(next: Snapshot) {
  snapshot = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Not persisted; still applies for this visit.
  }
  listeners.forEach((listener) => listener())
}

export function setBuilderState(update: Partial<BuilderState> | BuilderState) {
  commit({ state: { ...snapshot.state, ...update } })
}

export function useThemeBuilder(): Snapshot {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => snapshot,
    () => SERVER_SNAPSHOT
  )
}

/* ---------------------------------------------------------- early paint */

/*
 * Prerendered pages come with the default builder theme. To keep a visitor's own theme
 * from flashing in only after hydration, the CSS it generates is cached here and an
 * inline script in index.html injects it (as <style id="ui-theme-early">) before first
 * paint. The live <ThemeStyle> replaces it once the app has hydrated.
 */
export const EARLY_CSS_KEY = 'ui-theme-builder-css'
export const EARLY_STYLE_ID = 'ui-theme-early'

/** The generated CSS only holds custom-property blocks; index.html applies the same check. */
export const isEarlyCssSafe = (css: string) => !/[<\\@]|url\(/i.test(css)

export function saveEarlyCss(css: string) {
  try {
    if (css && isEarlyCssSafe(css)) localStorage.setItem(EARLY_CSS_KEY, css)
    else localStorage.removeItem(EARLY_CSS_KEY)
  } catch {
    // Not cached: the theme then appears at hydration instead of first paint.
  }
}

/* ---------------------------------------------------------------- fonts */

const loadedFonts = new Set<string>()

/** Adds the Google Fonts stylesheet for a font once (no-op for bundled/system fonts). */
export function ensureFontLoaded(font: FontOption) {
  if (!font.google || loadedFonts.has(font.id) || typeof document === 'undefined') return
  loadedFonts.add(font.id)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${font.google.replace(/ /g, '+')}&display=swap`
  document.head.appendChild(link)
}
