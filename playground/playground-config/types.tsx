import {
  createElement,
  Fragment,
  isValidElement,
  type ComponentProps,
  type ElementType,
  type ReactNode
} from 'react'
import {
  ArrowRight,
  Bell,
  Bold,
  Check,
  Download,
  Info,
  Mail,
  Search,
  TriangleAlert,
  User
} from 'lucide-react'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Input,
  Progress,
  Select,
  Slider,
  Switch,
  Textarea,
  Toggle
} from '../../src'
import { PKG } from '../package-info'

/**
 * A prop the preview runs and the code spells out differently: a function, a date, a
 * generated list. `value` is what renders; `code` is what the example shows.
 */
export class Raw {
  readonly code: string
  readonly value: unknown
  constructor(code: string, value: unknown) {
    this.code = code
    this.value = value
  }
}
export const raw = (code: string, value: unknown) => new Raw(code, value)
function resolveRaw(value: unknown): unknown {
  if (value instanceof Raw) return value.value
  if (Array.isArray(value)) return value.map(resolveRaw)
  if (value && typeof value === 'object' && !isValidElement(value))
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveRaw(item)]))
  return value
}

export type Value = string | number | boolean
export type Values = Record<string, Value>
export type Update = (patch: Values) => void
export type Option = { value: string; label: string }
type BaseField = { key: string; label: string; help?: string; when?: (values: Values) => boolean }
export type Field = BaseField &
  (
    | { type: 'text' | 'textarea' }
    | {
        type: 'number'
        min: number
        max: number
        step?: number
        bounds?: (values: Values) => { min: number; max: number; step?: number }
      }
    | { type: 'boolean' }
    | { type: 'choice'; options: Option[] | ((values: Values) => Option[]) }
  )
export type Group = { label: string; fields: Field[] }
const COMPONENTS = {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Input,
  Progress,
  Select,
  Slider,
  Switch,
  Textarea,
  Toggle
}
type ComponentName = keyof typeof COMPONENTS
export type State = {
  prop: string
  event: string
  type: string
  textEvent?: boolean
  patch: (value: unknown) => Values
}
/**
 * What a playground renders. The twelve first components resolve `name` through COMPONENTS;
 * every other one passes its `component` directly, so a definition's chunk imports only
 * what it uses.
 */
export type Example = {
  name: string
  component?: ElementType
  props: Record<string, unknown>
  state?: State
  label?: string
}
export type PlaygroundPreset = { label: string; values: Values }
export type Definition = {
  name: string
  initial: Values
  groups: Group[]
  build: (values: Values) => Example
  normalize?: (values: Values) => Values
  /** Scenario chips; the definitions in presets.ts predate this and are merged in by the loader. */
  presets?: PlaygroundPreset[]
}

export const text = (v: Values, key: string) => String(v[key] ?? '')
export const bool = (v: Values, key: string) => v[key] === true
export const num = (v: Values, key: string) => Number(v[key])
export const options = (...items: string[]): Option[] =>
  items.map((value) => ({ value, label: value }))
export const choice = (key: string, label: string, ...items: string[]): Field => ({
  key,
  label,
  type: 'choice',
  options: options(...items)
})
export const toggle = (key: string, label: string): Field => ({ key, label, type: 'boolean' })
export const input = (key: string, label: string): Field => ({ key, label, type: 'text' })
export const number = (key: string, label: string, min: number, max: number, step = 1): Field => ({
  key,
  label,
  type: 'number',
  min,
  max,
  step
})
export const sizeField = choice('size', 'Size', 'tiny', 'small', 'medium', 'large', 'xlarge')
export const size = (v: Values) => v.size as NonNullable<ComponentProps<typeof Button>['size']>
export const widths = { compact: 'w-full max-w-xs', comfortable: 'w-full max-w-md', full: 'w-full' }
export const widthField = choice('width', 'Width', 'compact', 'comfortable', 'full')
export const width = (v: Values) => widths[v.width as keyof typeof widths]
export const icons = {
  ArrowRight,
  Bell,
  Bold,
  Check,
  Download,
  Info,
  Mail,
  Search,
  TriangleAlert,
  User
}
export const iconField = (key = 'icon', label = 'Icon') =>
  choice(key, label, 'none', ...Object.keys(icons))
export function icon(value: Value): ReactNode {
  const Icon = icons[value as keyof typeof icons]
  return Icon ? <Icon aria-hidden="true" className="size-4" /> : undefined
}
export const textState: State = {
  prop: 'value',
  event: 'onChange',
  type: 'string',
  textEvent: true,
  patch: (value) => ({ value: String(value) })
}

/** Preview and exported JSX consume the same props, including icons and option data. */
export function renderExample(example: Example, update: Update) {
  const state = example.state
  const events = state
    ? {
        [state.event]: (event: unknown) =>
          update(
            state.patch(
              state.textEvent ? (event as { target: { value: string } }).target.value : event
            )
          )
      }
    : {}
  const preview = createElement(example.component ?? (COMPONENTS[example.name as ComponentName] as ElementType), {
    ...(resolveRaw(example.props) as Record<string, unknown>),
    ...events
  })
  return example.label ? (
    <label className="flex items-center gap-3 text-sm">
      {preview}
      <span>{example.label}</span>
    </label>
  ) : (
    preview
  )
}

// JSON expressions preserve quotes, newlines and JSX-significant characters in user text.
function expression(value: unknown): string {
  if (value instanceof Raw) return value.code
  if (isValidElement<Record<string, unknown>>(value)) {
    if (value.type === Fragment) {
      const children = Array.isArray(value.props.children)
        ? value.props.children
        : [value.props.children]
      return `<>${children
        .filter((child) => child !== undefined)
        .map((child) => `{${expression(child)}}`)
        .join('')}</>`
    }
    const iconName = Object.entries(icons).find(([, component]) => component === value.type)?.[0]
    const name = iconName ?? elementName(value.type)
    if (!name) throw new Error('Unsupported playground element')
    const { children, ...rest } = value.props
    const open = `<${name}${attributes(rest)}`
    if (children === undefined || children === null) return `${open} />`
    const nodes = Array.isArray(children) ? children : [children]
    return `${open}>${nodes.map((child) => `{${expression(child)}}`).join('')}</${name}>`
  }
  // Plain data keeps the JSON spelling; only values that hold elements need the JS one.
  if (!holdsElement(value)) return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(expression).join(', ')}]`
  if (value && typeof value === 'object')
    return `{ ${Object.entries(value)
      .filter(([, item]) => item !== undefined && typeof item !== 'function')
      .map(([key, item]) => `${/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${expression(item)}`)
      .join(', ')} }`
  return JSON.stringify(value)
}

function holdsElement(value: unknown): boolean {
  if (value instanceof Raw) return true
  if (isValidElement(value)) return true
  if (Array.isArray(value)) return value.some(holdsElement)
  if (value && typeof value === 'object') return Object.values(value).some(holdsElement)
  return false
}

/*
 * Library components an example nests inside its props (a trigger Button, a Separator).
 * Definitions register the few they use, so the code can import them without this
 * module pulling the whole library in to look names up.
 */
const knownNames = new Map<unknown, string>()
export function known(name: string, component: unknown) {
  knownNames.set(component, name)
}
function elementName(type: unknown): string | undefined {
  return typeof type === 'string' ? type : knownNames.get(type)
}
Object.entries(COMPONENTS).forEach(([name, component]) => known(name, component))
function attributes(props: Record<string, unknown>) {
  return Object.entries(props)
    .filter(([key, value]) => key !== 'children' && value !== undefined && typeof value !== 'function')
    .map(([key, value]) => ` ${attribute(key, value)}`)
    .join('')
}
function attribute(key: string, value: unknown) {
  if (value === true) return key
  if (typeof value === 'string' && !/["&<>\r\n{}]/.test(value)) return `${key}="${value}"`
  return `${key}={${expression(value)}}`
}

/** The component's opening tag on one line: a glance at what the full code sets. */
export function exampleSummary(example: Example): string {
  const props = example.props as Record<string, unknown>
  const attributes = Object.entries(props)
    .filter(([key, value]) => key !== 'children' && value !== undefined && typeof value !== 'function' && value !== false)
    .map(([key, value]) => attribute(key, value).replace(/\s+/g, ' '))
  const open = `<${example.name}${attributes.map((attribute) => ' ' + attribute).join('')}`
  return props.children === undefined ? `${open} />` : `${open}>`
}

export function exampleCode(example: Example): string {
  const props = example.props as Record<string, unknown>
  const state = example.state
  const iconImports = new Set<string>()
  const libraryImports = new Set<string>([example.name])
  function collectIcons(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(collectIcons)
      return
    }
    if (isValidElement<Record<string, unknown>>(value)) {
      const name = Object.entries(icons).find(([, component]) => component === value.type)?.[0]
      if (name) iconImports.add(name)
      else {
        const used = elementName(value.type)
        if (used && typeof value.type !== 'string') libraryImports.add(used)
      }
      Object.values(value.props).forEach(collectIcons)
      return
    }
    if (value && typeof value === 'object') Object.values(value).forEach(collectIcons)
  }
  Object.values(props).forEach(collectIcons)
  const imports = [
    ...(state ? ["import { useState } from 'react'"] : []),
    ...(iconImports.size
      ? [`import { ${[...iconImports].sort().join(', ')} } from 'lucide-react'`]
      : []),
    `import { ${[...libraryImports].sort().join(', ')} } from '${PKG}'`
  ]
  const lines = Object.entries(props)
    .filter(([key, value]) => key !== 'children' && value !== undefined && typeof value !== 'function')
    .map(
      ([key, value]) => `      ${state?.prop === key ? `${key}={value}` : attribute(key, value)}`
    )
  if (state)
    lines.push(
      `      ${state.event}={${state.textEvent ? '(event) => setValue(event.target.value)' : 'setValue'}}`
    )
  const children = props.children
  const opening = `    <${example.name}${lines.length ? '\n' + lines.join('\n') + '\n    ' : ''}`
  let jsx =
    children === undefined
      ? `${opening}/>`
      : `${opening}>\n      {${expression(children)}}\n    </${example.name}>`
  if (example.label)
    jsx = `    <label className="flex items-center gap-3 text-sm">\n${jsx
      .split('\n')
      .map((line) => '  ' + line)
      .join('\n')}\n      <span>{${expression(example.label)}}</span>\n    </label>`
  return `${imports.join('\n')}\n\nexport default function ${example.name}Demo() {\n${state ? `  const [value, setValue] = useState<${state.type}>(${expression(props[state.prop])})\n\n` : ''}  return (\n${jsx}\n  )\n}`
}
