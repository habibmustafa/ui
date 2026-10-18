import type { ComponentProps } from 'react'
import { Input, Slider, Switch } from '../../src'
import {
  bool,
  choice,
  input,
  num,
  number,
  size,
  sizeField,
  text,
  textState,
  toggle,
  width,
  widthField,
  type Definition,
  type Values
} from './types'

const fieldFlags = [
  toggle('disabled', 'Disabled'),
  toggle('readOnly', 'Read only'),
  toggle('required', 'Required'),
  toggle('invalid', 'Invalid')
]
const formFlags = (v: Values) => ({
  disabled: bool(v, 'disabled'),
  readOnly: bool(v, 'readOnly'),
  required: bool(v, 'required'),
  'aria-invalid': bool(v, 'invalid')
})

export function selectOptions(v: Values) {
  return text(v, 'options')
    .split('\n')
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((label, index, all) => ({
      value: `option-${index + 1}`,
      label,
      ...(bool(v, 'disableLast') && index === all.length - 1 ? { disabled: true } : {})
    }))
}

function normalizeSlider(v: Values): Values {
  const min = num(v, 'min')
  const max = Math.max(min + 1, num(v, 'max'))
  const step = Math.min(max - min, Math.max(1, num(v, 'step')))
  const snap = (value: number) =>
    Math.max(
      min,
      Math.min(
        min + Math.floor((max - min) / step) * step,
        min + Math.round((value - min) / step) * step
      )
    )
  const start = snap(num(v, 'start'))
  const end = Math.max(start, snap(num(v, 'end')))
  return { ...v, max, step, start, end }
}

export const forms = {
  input: {
    name: 'Input',
    initial: {
      label: 'Email',
      placeholder: 'you@example.com',
      value: '',
      prefix: '',
      suffix: '',
      type: 'text',
      size: 'small',
      width: 'compact',
      maxLength: 100,
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Accessible label'),
          input('placeholder', 'Placeholder'),
          input('value', 'Value'),
          input('prefix', 'Prefix'),
          input('suffix', 'Suffix')
        ]
      },
      { label: 'Appearance', fields: [sizeField, widthField] },
      {
        label: 'Behavior',
        fields: [
          choice('type', 'Input type', 'text', 'email', 'password', 'search', 'tel', 'url'),
          number('maxLength', 'Maximum characters', 1, 1000),
          ...fieldFlags
        ]
      }
    ],
    build: (v) => ({
      name: 'Input',
      props: {
        size: size(v),
        type: v.type as ComponentProps<typeof Input>['type'],
        value: text(v, 'value'),
        placeholder: text(v, 'placeholder'),
        prefix: text(v, 'prefix') || undefined,
        suffix: text(v, 'suffix') || undefined,
        'aria-label': text(v, 'label') || 'Input',
        className: width(v),
        maxLength: num(v, 'maxLength'),
        ...formFlags(v)
      },
      state: textState
    })
  },
  textarea: {
    name: 'Textarea',
    initial: {
      label: 'Message',
      placeholder: 'Write your message…',
      value: '',
      rows: 4,
      maxLength: 500,
      resize: 'vertical',
      width: 'comfortable',
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Accessible label'),
          input('placeholder', 'Placeholder'),
          { key: 'value', label: 'Value', type: 'textarea' }
        ]
      },
      {
        label: 'Appearance',
        fields: [
          number('rows', 'Rows', 2, 12),
          choice('resize', 'Resize', 'vertical', 'horizontal', 'both', 'none'),
          widthField
        ]
      },
      {
        label: 'Behavior',
        fields: [number('maxLength', 'Maximum characters', 1, 5000), ...fieldFlags]
      }
    ],
    build: (v) => ({
      name: 'Textarea',
      props: {
        value: text(v, 'value'),
        placeholder: text(v, 'placeholder'),
        rows: num(v, 'rows'),
        maxLength: num(v, 'maxLength'),
        'aria-label': text(v, 'label') || 'Message',
        className: `${width(v)} ${{ vertical: 'resize-y', horizontal: 'resize-x', both: 'resize', none: 'resize-none' }[text(v, 'resize')]}`,
        ...formFlags(v)
      },
      state: textState
    })
  },
  switch: {
    name: 'Switch',
    initial: {
      label: 'Notifications',
      showLabel: true,
      size: 'medium',
      checked: true,
      disabled: false,
      required: false,
      name: 'notifications'
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Label'),
          toggle('showLabel', 'Show label'),
          input('name', 'Form field name')
        ]
      },
      { label: 'Appearance', fields: [choice('size', 'Size', 'small', 'medium', 'large')] },
      {
        label: 'Behavior',
        fields: [
          toggle('checked', 'Checked'),
          toggle('disabled', 'Disabled'),
          toggle('required', 'Required')
        ]
      }
    ],
    build: (v) => ({
      name: 'Switch',
      label: bool(v, 'showLabel') ? text(v, 'label') : undefined,
      props: {
        size: v.size as ComponentProps<typeof Switch>['size'],
        checked: bool(v, 'checked'),
        disabled: bool(v, 'disabled'),
        required: bool(v, 'required'),
        name: text(v, 'name'),
        'aria-label': text(v, 'label') || 'Notifications'
      },
      state: {
        prop: 'checked',
        event: 'onCheckedChange',
        type: 'boolean',
        patch: (value) => ({ checked: value === true })
      }
    })
  },
  checkbox: {
    name: 'Checkbox',
    initial: {
      label: 'Accept terms',
      showLabel: true,
      checked: 'checked',
      disabled: false,
      required: false,
      name: 'terms',
      value: 'accepted'
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Label'),
          toggle('showLabel', 'Show label'),
          input('name', 'Form field name'),
          input('value', 'Form value')
        ]
      },
      {
        label: 'Behavior',
        fields: [
          choice('checked', 'Checked state', 'unchecked', 'checked', 'indeterminate'),
          toggle('disabled', 'Disabled'),
          toggle('required', 'Required')
        ]
      }
    ],
    build: (v) => ({
      name: 'Checkbox',
      label: bool(v, 'showLabel') ? text(v, 'label') : undefined,
      props: {
        checked: v.checked === 'indeterminate' ? 'indeterminate' : v.checked === 'checked',
        disabled: bool(v, 'disabled'),
        required: bool(v, 'required'),
        name: text(v, 'name'),
        value: text(v, 'value'),
        'aria-label': text(v, 'label') || 'Accept terms'
      },
      state: {
        prop: 'checked',
        event: 'onCheckedChange',
        type: 'boolean | "indeterminate"',
        patch: (value) => ({
          checked:
            value === 'indeterminate' ? 'indeterminate' : value === true ? 'checked' : 'unchecked'
        })
      }
    })
  },
  select: {
    name: 'Select',
    initial: {
      label: 'Environment',
      placeholder: 'Choose environment',
      options: 'Production\nStaging\nDevelopment',
      value: '',
      size: 'small',
      width: 'compact',
      grouped: false,
      groupLabel: 'Environments',
      disableLast: false,
      clearable: true,
      disabled: false,
      required: false,
      invalid: false,
      dir: 'ltr'
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Accessible label'),
          input('placeholder', 'Placeholder'),
          {
            key: 'options',
            label: 'Options',
            type: 'textarea',
            help: 'One label per line, up to 50 options.'
          },
          {
            key: 'value',
            label: 'Selected option',
            type: 'choice',
            options: (v) => [{ value: '', label: 'None' }, ...selectOptions(v)]
          },
          toggle('grouped', 'Group options'),
          { ...input('groupLabel', 'Group label'), when: (v) => bool(v, 'grouped') }
        ]
      },
      {
        label: 'Appearance',
        fields: [sizeField, widthField, choice('dir', 'Direction', 'ltr', 'rtl')]
      },
      {
        label: 'Behavior',
        fields: [
          toggle('clearable', 'Clearable'),
          toggle('disableLast', 'Disable last option'),
          toggle('disabled', 'Disabled'),
          toggle('required', 'Required'),
          toggle('invalid', 'Invalid')
        ]
      }
    ],
    normalize: (v) => ({
      ...v,
      value: selectOptions(v).some((option) => option.value === v.value && !option.disabled)
        ? v.value
        : ''
    }),
    build: (v) => ({
      name: 'Select',
      props: {
        value: text(v, 'value') || null,
        size: size(v),
        className: width(v),
        placeholder: text(v, 'placeholder'),
        'aria-label': text(v, 'label') || 'Environment',
        'aria-invalid': bool(v, 'invalid'),
        clearable: bool(v, 'clearable'),
        disabled: bool(v, 'disabled'),
        required: bool(v, 'required'),
        dir: v.dir as 'ltr' | 'rtl',
        ...(bool(v, 'grouped')
          ? { groups: [{ label: text(v, 'groupLabel'), options: selectOptions(v) }] }
          : { options: selectOptions(v) })
      },
      state: {
        prop: 'value',
        event: 'onValueChange',
        type: 'string | null',
        patch: (value) => ({ value: value == null ? '' : String(value) })
      }
    })
  },
  slider: {
    name: 'Slider',
    initial: {
      label: 'Volume',
      size: 'medium',
      min: 0,
      max: 100,
      step: 1,
      start: 40,
      end: 80,
      range: false,
      orientation: 'horizontal',
      dir: 'ltr',
      inverted: false,
      disabled: false,
      invalid: false,
      width: 'compact'
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Accessible label'),
          toggle('range', 'Range (two thumbs)'),
          {
            key: 'start',
            label: 'Value / range start',
            type: 'number',
            min: -1000,
            max: 10000,
            bounds: (v) => ({ min: num(v, 'min'), max: num(v, 'max'), step: num(v, 'step') })
          },
          {
            key: 'end',
            label: 'Range end',
            type: 'number',
            min: -1000,
            max: 10000,
            when: (v) => bool(v, 'range'),
            bounds: (v) => ({ min: num(v, 'start'), max: num(v, 'max'), step: num(v, 'step') })
          }
        ]
      },
      {
        label: 'Appearance',
        fields: [
          choice('size', 'Size', 'small', 'medium', 'large'),
          choice('orientation', 'Orientation', 'horizontal', 'vertical'),
          { ...widthField, when: (v) => v.orientation === 'horizontal' }
        ]
      },
      {
        label: 'Behavior',
        fields: [
          {
            key: 'min',
            label: 'Minimum',
            type: 'number',
            min: -1000,
            max: 9999,
            bounds: (v) => ({ min: -1000, max: num(v, 'max') - 1 })
          },
          {
            key: 'max',
            label: 'Maximum',
            type: 'number',
            min: -999,
            max: 10000,
            bounds: (v) => ({ min: num(v, 'min') + 1, max: 10000 })
          },
          {
            key: 'step',
            label: 'Step',
            type: 'number',
            min: 1,
            max: 1000,
            bounds: (v) => ({ min: 1, max: Math.min(1000, num(v, 'max') - num(v, 'min')) })
          },
          choice('dir', 'Direction', 'ltr', 'rtl'),
          toggle('inverted', 'Inverted'),
          toggle('disabled', 'Disabled'),
          toggle('invalid', 'Invalid')
        ]
      }
    ],
    normalize: normalizeSlider,
    build: (v) => ({
      name: 'Slider',
      props: {
        value: bool(v, 'range') ? [num(v, 'start'), num(v, 'end')] : [num(v, 'start')],
        min: num(v, 'min'),
        max: num(v, 'max'),
        step: num(v, 'step'),
        size: v.size as ComponentProps<typeof Slider>['size'],
        orientation: v.orientation as 'horizontal' | 'vertical',
        dir: v.dir as 'ltr' | 'rtl',
        inverted: bool(v, 'inverted'),
        disabled: bool(v, 'disabled'),
        'aria-invalid': bool(v, 'invalid'),
        'aria-label': text(v, 'label') || 'Volume',
        thumbLabels: bool(v, 'range')
          ? [`${text(v, 'label') || 'Value'} minimum`, `${text(v, 'label') || 'Value'} maximum`]
          : undefined,
        className: v.orientation === 'vertical' ? 'h-48' : width(v)
      },
      state: {
        prop: 'value',
        event: 'onValueChange',
        type: 'number[]',
        patch: (value) => {
          const values = value as number[]
          return { start: values[0], ...(values.length > 1 ? { end: values[1] } : {}) }
        }
      }
    })
  }
} satisfies Record<string, Definition>
