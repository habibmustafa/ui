import type { ThemeConfig } from './create-theme'

export interface ThemePreset {
  id: string
  /** Display name. */
  name: string
  config: ThemeConfig
}

/** Starting points for the theme builder; each is a complete, checked config. */
export const THEME_PRESETS: ThemePreset[] = [
  { id: 'default', name: 'Green', config: { brand: '#3ecf8e', accent: '#7b66ff' } },
  { id: 'indigo', name: 'Indigo', config: { brand: '#6366f1', accent: '#ec4899', neutral: { tint: 0.25 } } },
  { id: 'ocean', name: 'Ocean', config: { brand: '#0ea5e9', accent: '#f59e0b', neutral: { tint: 0.2 } } },
  { id: 'violet', name: 'Violet', config: { brand: '#8b5cf6', accent: '#14b8a6', neutral: { tint: 0.3 } } },
  { id: 'sunset', name: 'Sunset', config: { brand: '#f97316', accent: '#6366f1', neutral: { tint: 0.15 }, radius: 8 } },
  { id: 'rose', name: 'Rose', config: { brand: '#e11d48', accent: '#8b5cf6', neutral: { tint: 0.15 }, radius: 10 } },
  { id: 'mono', name: 'Mono', config: { brand: '#71717a', accent: '#3b82f6', contrast: 0.6, radius: 4 } },
]
