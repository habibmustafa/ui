import type { Definition, PlaygroundPreset } from './types'

/*
 * Which components have a "Make it yours" playground, and how to load it. This file is
 * all the component page imports up front: a definition (and the component it renders)
 * is only fetched when its page opens, one small chunk per category.
 */

type Category = Record<string, Definition>

const CATEGORIES = {
  fragments: () => import('./fragments').then((module) => module.fragments as Category),
  inputs: () => import('./inputs').then((module) => module.inputs as Category),
  overlay: () => import('./overlay').then((module) => module.overlay as Category),
  navigation: () => import('./navigation').then((module) => module.navigation as Category),
  layout: () => import('./layout').then((module) => module.layout as Category),
  feedback: () => import('./feedback').then((module) => module.feedback as Category),
  data: () => import('./data').then((module) => module.data as Category),
  actions: () => import('./actions').then((module) => module.actions as Category),
  display: () => import('./display').then((module) => module.display as Category),
  forms: () => import('./forms').then((module) => module.forms as Category)
}

type CategoryName = keyof typeof CATEGORIES

/** Component id -> the category chunk holding its definition. */
export const CATEGORY_OF: Record<string, CategoryName> = {
  admonition: 'fragments',
  'code-block': 'fragments',
  'data-table': 'fragments',
  'empty-state': 'fragments',
  'error-display': 'fragments',
  'glass-panel': 'fragments',
  'info-tooltip': 'fragments',
  'metric-card': 'fragments',
  row: 'fragments',
  'status-code': 'fragments',
  'timestamp-info': 'fragments',
  calendar: 'inputs',
  combobox: 'inputs',
  'data-input': 'inputs',
  'date-field': 'inputs',
  'date-picker': 'inputs',
  'date-range-picker': 'inputs',
  'file-upload': 'inputs',
  'input-otp': 'inputs',
  label: 'inputs',
  mentions: 'inputs',
  'multi-select': 'inputs',
  'number-input': 'inputs',
  'password-input': 'inputs',
  'radio-group': 'inputs',
  rating: 'inputs',
  'time-picker': 'inputs',
  'alert-dialog': 'overlay',
  'confirm-popover': 'overlay',
  'context-menu': 'overlay',
  dialog: 'overlay',
  drawer: 'overlay',
  'dropdown-menu': 'overlay',
  'hover-card': 'overlay',
  popover: 'overlay',
  sheet: 'overlay',
  tooltip: 'overlay',
  breadcrumb: 'navigation',
  command: 'navigation',
  menubar: 'navigation',
  'navigation-menu': 'navigation',
  pagination: 'navigation',
  stepper: 'navigation',
  'table-of-contents': 'navigation',
  tabs: 'navigation',
  'text-link': 'navigation',
  'aspect-ratio': 'layout',
  box: 'layout',
  card: 'layout',
  container: 'layout',
  flex: 'layout',
  'floating-plate': 'layout',
  grid: 'layout',
  resizable: 'layout',
  'scroll-area': 'layout',
  separator: 'layout',
  stack: 'layout',
  banner: 'feedback',
  'circular-progress': 'feedback',
  result: 'feedback',
  skeleton: 'feedback',
  'shimmering-loader': 'feedback',
  spinner: 'feedback',
  accordion: 'data',
  carousel: 'data',
  collapsible: 'data',
  countdown: 'data',
  descriptions: 'data',
  gauge: 'data',
  image: 'data',
  kbd: 'data',
  marquee: 'data',
  'qr-code': 'data',
  statistic: 'data',
  chart: 'data',
  table: 'data',
  'virtual-list': 'data',
  button: 'actions',
  toggle: 'actions',
  'copy-button': 'actions',
  'toggle-group': 'actions',
  alert: 'display',
  avatar: 'display',
  badge: 'display',
  progress: 'display',
  checkbox: 'forms',
  input: 'forms',
  select: 'forms',
  slider: 'forms',
  switch: 'forms',
  textarea: 'forms'
}

export type LoadedPlayground = { definition: Definition; presets: PlaygroundPreset[] }

export const hasPlayground = (id: string) => id in CATEGORY_OF

const cache = new Map<string, LoadedPlayground>()
/** Already-loaded playgrounds render without a second pass. */
export const cachedPlayground = (id: string) => cache.get(id)

export async function loadPlayground(id: string): Promise<LoadedPlayground> {
  const cached = cache.get(id)
  if (cached) return cached
  const category = CATEGORY_OF[id]
  if (!category) throw new Error(`No playground for "${id}"`)
  const [definitions, { playgroundPresets }] = await Promise.all([
    CATEGORIES[category](),
    import('./presets')
  ])
  const definition = definitions[id]
  const loaded = { definition, presets: definition.presets ?? playgroundPresets[id] ?? [] }
  cache.set(id, loaded)
  return loaded
}
