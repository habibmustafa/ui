'use client'

import * as React from 'react'

/*
 * The built-in words the components speak: button names, screen-reader text and
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

  // Shared actions and states
  close: string
  confirm: string
  cancel: string
  dismiss: string
  copy: string
  copied: string
  copiedToClipboard: string
  clearSelection: string
  reveal: string
  loading: string
  noResults: string
  moreInformation: string
  contactSupport: string
  previous: string
  next: string

  // Pagination
  previousPage: string
  nextPage: string

  // Date and time pickers
  selectMonth: string
  selectYear: string
  clearDate: string
  openCalendar: string
  time: string
  chooseTime: string
  timePeriod: string
  am: string
  pm: string
  empty: string
  notSet: string
  /** `unit` is "hours", "minutes" or "seconds". */
  selectTimeUnit: (unit: string) => string

  // Inputs
  showPassword: string
  increase: string
  decrease: string
  clearSearch: string
  dropFiles: string
  browseFiles: string
  selectedFiles: string

  // Navigation and layout
  toggleMenu: string
  toggleSidebar: string
  breadcrumbMore: string
  breadcrumbNavigateTitle: string
  breadcrumbNavigate: string
  progress: string
  scrollLeft: string
  scrollRight: string
  scrollableContent: string

  // Data
  selectAllRows: string
  selectRow: string
  timestampUtc: string
  timestampRelative: string
  timestamp: string

  // Theme toggle
  appearance: string
  /** Accessible name of the theme toggle; `name` is the current theme's label. */
  themeLabel: (name: string) => string
  themeSystem: string
  themeDark: string
  themeLight: string

  // Admonition default titles
  admonitionNote: string
  admonitionCaution: string
  admonitionDanger: string
  admonitionDeprecated: string
  admonitionWarning: string
  admonitionSuccess: string
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

  close: 'Close',
  confirm: 'Confirm',
  cancel: 'Cancel',
  dismiss: 'Dismiss',
  copy: 'Copy',
  copied: 'Copied',
  copiedToClipboard: 'Copied to clipboard',
  clearSelection: 'Clear selection',
  reveal: 'Reveal',
  loading: 'Loading',
  noResults: 'No results found.',
  moreInformation: 'More information',
  contactSupport: 'Contact support',
  previous: 'Previous',
  next: 'Next',

  previousPage: 'Go to previous page',
  nextPage: 'Go to next page',

  selectMonth: 'Select month',
  selectYear: 'Select year',
  clearDate: 'Clear date',
  openCalendar: 'Open calendar',
  time: 'Time',
  chooseTime: 'Choose time',
  timePeriod: 'AM/PM',
  am: 'AM',
  pm: 'PM',
  empty: 'Empty',
  notSet: 'Not set',
  selectTimeUnit: (unit) => `Select ${unit}`,

  showPassword: 'Show password',
  increase: 'Increase',
  decrease: 'Decrease',
  clearSearch: 'Clear search',
  dropFiles: 'Drag and drop files here',
  browseFiles: 'Browse files',
  selectedFiles: 'Selected files',

  toggleMenu: 'Toggle menu',
  toggleSidebar: 'Toggle sidebar',
  breadcrumbMore: 'More',
  breadcrumbNavigateTitle: 'Navigate to',
  breadcrumbNavigate: 'Select a page to navigate to.',
  progress: 'Progress',
  scrollLeft: 'Scroll left',
  scrollRight: 'Scroll right',
  scrollableContent: 'Horizontally scrollable content',

  selectAllRows: 'Select all rows on this page',
  selectRow: 'Select row',
  timestampUtc: 'UTC',
  timestampRelative: 'Relative',
  timestamp: 'Timestamp',

  appearance: 'Appearance',
  themeLabel: (name) => `Theme: ${name}`,
  themeSystem: 'System',
  themeDark: 'Dark',
  themeLight: 'Light',

  admonitionNote: 'Note',
  admonitionCaution: 'Caution',
  admonitionDanger: 'Danger',
  admonitionDeprecated: 'Deprecated',
  admonitionWarning: 'Warning',
  admonitionSuccess: 'Success',
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
