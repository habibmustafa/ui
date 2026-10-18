import type { ElementType } from 'react'

import type { Definition, Field, Group, PlaygroundPreset, State, Value, Values } from './types'

/** A control plus the prop it drives. `group` and `default` are optional: both have per-type fallbacks. */
export type Control = Field & {
  /** The component prop this sets; defaults to the field key. */
  prop?: string
  group?: 'Content' | 'Appearance' | 'Behavior'
  /** Starting value. Choices start on their first option, switches off, text empty, numbers at their minimum. */
  default?: Value
  /** Leave the prop out of the code when it has this value (the component's own default). */
  omit?: Value
}

const GROUP_OF = { text: 'Content', textarea: 'Content', number: 'Content', choice: 'Appearance', boolean: 'Behavior' } as const
const ORDER = ['Content', 'Appearance', 'Behavior'] as const

function startValue(control: Control): Value {
  if (control.default !== undefined) return control.default
  switch (control.type) {
    case 'boolean':
      return false
    case 'number':
      return control.min
    case 'choice': {
      const options = typeof control.options === 'function' ? control.options({}) : control.options
      return options[0]?.value ?? ''
    }
    default:
      return ''
  }
}

/**
 * A playground from a component, its fixed props and the controls that drive the rest.
 * Every definition is a few lines: \`base\` holds what the example always needs (children,
 * data, required props); each control maps one value onto one prop.
 */
export function define(spec: {
  name: string
  component: ElementType
  base?: Record<string, unknown>
  controls: Control[]
  /** Props computed from the current values, for anything a control cannot express. */
  props?: (values: Values) => Record<string, unknown>
  normalize?: Definition['normalize']
  /** Starting scenarios shown as chips above the preview. */
  presets?: PlaygroundPreset[]
  /** For a controlled component: the prop and event that keep the preview and the code in step. */
  state?: State
}): Definition {
  const initial: Values = {}
  for (const control of spec.controls) initial[control.key] = startValue(control)
  const groups: Group[] = ORDER.map((label) => ({
    label,
    fields: spec.controls.filter((control) => (control.group ?? GROUP_OF[control.type]) === label)
  })).filter((group) => group.fields.length)

  return {
    name: spec.name,
    initial,
    groups,
    normalize: spec.normalize,
    presets: spec.presets,
    build: (values) => {
      const props: Record<string, unknown> = { ...spec.base }
      for (const control of spec.controls) {
        const value = values[control.key]
        const omitted = control.omit ?? (control.type === 'boolean' ? false : undefined)
        if (control.prop === '' || value === omitted || value === '' || value === 'none') continue
        props[control.prop ?? control.key] = value
      }
      return {
        name: spec.name,
        component: spec.component,
        props: { ...props, ...spec.props?.(values) },
        state: spec.state
      }
    }
  }
}

const opts = (items: string[]) => items.map((value) => ({ value, label: value }))

type Extra = Pick<Control, 'prop' | 'group' | 'default' | 'omit' | 'when' | 'help'> & { step?: number }

/** Short constructors for the controls of `define`. */
export const c = {
  text: (key: string, label: string, def = '', extra: Extra = {}): Control => ({
    key,
    label,
    type: 'text',
    default: def,
    ...extra
  }),
  area: (key: string, label: string, def = '', extra: Extra = {}): Control => ({
    key,
    label,
    type: 'textarea',
    default: def,
    ...extra
  }),
  flag: (key: string, label: string, def = false, extra: Extra = {}): Control => ({
    key,
    label,
    type: 'boolean',
    default: def,
    ...extra
  }),
  pick: (key: string, label: string, items: string[], def = items[0], extra: Extra = {}): Control => ({
    key,
    label,
    type: 'choice',
    options: opts(items),
    default: def,
    ...extra
  }),
  num: (
    key: string,
    label: string,
    min: number,
    max: number,
    def = min,
    extra: Extra = {}
  ): Control => ({ key, label, type: 'number', min, max, default: def, ...extra })
}
