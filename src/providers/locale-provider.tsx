'use client'

import * as React from 'react'

/*
 * The built-in words the newer components speak: button names, screen-reader text and
 * empty states. Everything defaults to English and works without a provider; wrap a
 * subtree in <LocaleProvider labels={{ ... }}> to translate or reword any of it.
 * Values that depend on a number or a name are functions, so plurals and word order
 * stay in the translator's hands. A component's own prop (`closeLabel`, `placeholder`,
 * `aria-label`, ...) always wins over the provider.
 */

export interface Labels {
  carouselRole: string
  carouselSlideRole: string
  carouselPrevious: string
  carouselNext: string
  carouselDots: string
  carouselGoTo: (slide: number) => string
  carouselSlide: (slide: number, total: number) => string
  imagePreview: (alt: string) => string
  imageClose: string
  scrollProgress: string
  mentionsEmpty: string
  mentionsList: string
  dateRangePlaceholder: string
  dateRangeClear: string
  tableOfContents: string
  qrCode: string
  marqueeRole: string
  ratingValue: (value: number, max: number) => string
  /** The time left, for screen readers; `ms` is the remaining time in milliseconds. */
  timeLeft: (ms: number) => string
}

export const defaultLabels: Labels = {
  carouselRole: 'carousel',
  carouselSlideRole: 'slide',
  carouselPrevious: 'Previous slide',
  carouselNext: 'Next slide',
  carouselDots: 'Choose slide',
  carouselGoTo: (slide) => `Go to slide ${slide}`,
  carouselSlide: (slide, total) => `${slide} of ${total}`,
  imagePreview: (alt) => `Preview image: ${alt}`,
  imageClose: 'Close preview',
  scrollProgress: 'Reading progress',
  mentionsEmpty: 'No matches',
  mentionsList: 'Suggestions',
  dateRangePlaceholder: 'Pick a date range',
  dateRangeClear: 'Clear',
  tableOfContents: 'On this page',
  qrCode: 'QR code',
  marqueeRole: 'marquee',
  ratingValue: (value, max) => `${value} ${value === 1 ? 'star' : 'stars'} out of ${max}`,
  timeLeft: (ms) => {
    const total = Math.ceil(ms / 1000)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${[h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ')} left`
  },
}

const LabelsContext = React.createContext<Labels>(defaultLabels)

export interface LocaleProviderProps {
  /** Any subset of the labels; the rest stay English. */
  labels?: Partial<Labels>
  children: React.ReactNode
}

export function LocaleProvider({ labels, children }: LocaleProviderProps) {
  const parent = React.useContext(LabelsContext)
  const value = React.useMemo<Labels>(() => ({ ...parent, ...labels }), [parent, labels])
  return <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>
}

/** The labels in effect: the nearest LocaleProvider's, or the English defaults. */
export function useLabels(): Labels {
  return React.useContext(LabelsContext)
}
