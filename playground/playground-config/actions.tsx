import type { ComponentProps } from 'react'
import { Button, CopyButton, Toggle, ToggleGroup } from '../../src'
import { c, define } from './define'
import {
  bool,
  choice,
  icon,
  iconField,
  input,
  size,
  sizeField,
  text,
  toggle,
  type Definition
} from './types'

export const actions = {
  button: {
    name: 'Button',
    initial: {
      label: 'Continue',
      variant: 'primary',
      size: 'small',
      icon: 'none',
      iconRight: 'none',
      disabled: false,
      loading: false,
      block: false,
      rounded: false,
      focusableWhenDisabled: false
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Button text'),
          iconField('icon', 'Leading icon'),
          iconField('iconRight', 'Trailing icon')
        ]
      },
      {
        label: 'Appearance',
        fields: [
          choice(
            'variant',
            'Variant',
            'primary',
            'default',
            'secondary',
            'outline',
            'dashed',
            'link',
            'text',
            'warning',
            'danger'
          ),
          sizeField,
          toggle('rounded', 'Fully rounded'),
          toggle('block', 'Full width')
        ]
      },
      {
        label: 'Behavior',
        fields: [
          toggle('disabled', 'Disabled'),
          toggle('loading', 'Loading'),
          {
            ...toggle('focusableWhenDisabled', 'Focusable when disabled'),
            help: 'Keep the button reachable with Tab when disabled or loading.'
          }
        ]
      }
    ],
    build: (v) => ({
      name: 'Button',
      props: {
        variant: v.variant as ComponentProps<typeof Button>['variant'],
        size: size(v),
        children: text(v, 'label'),
        'aria-label': text(v, 'label') || 'Action',
        icon: icon(v.icon),
        iconRight: icon(v.iconRight),
        disabled: bool(v, 'disabled'),
        loading: bool(v, 'loading'),
        block: bool(v, 'block'),
        rounded: bool(v, 'rounded'),
        focusableWhenDisabled: bool(v, 'focusableWhenDisabled')
      }
    })
  },
  toggle: {
    name: 'Toggle',
    initial: {
      label: 'Bold',
      icon: 'Bold',
      variant: 'default',
      size: 'default',
      pressed: false,
      disabled: false
    },
    groups: [
      { label: 'Content', fields: [input('label', 'Accessible label'), iconField()] },
      {
        label: 'Appearance',
        fields: [
          choice('variant', 'Variant', 'default', 'outline', 'segmented'),
          choice('size', 'Size', 'tiny', 'sm', 'default', 'lg')
        ]
      },
      { label: 'Behavior', fields: [toggle('pressed', 'Pressed'), toggle('disabled', 'Disabled')] }
    ],
    build: (v) => ({
      name: 'Toggle',
      props: {
        variant: v.variant as ComponentProps<typeof Toggle>['variant'],
        size: v.size as ComponentProps<typeof Toggle>['size'],
        'aria-label': text(v, 'label') || 'Toggle',
        children: icon(v.icon) ?? text(v, 'label'),
        pressed: bool(v, 'pressed'),
        disabled: bool(v, 'disabled')
      },
      state: {
        prop: 'pressed',
        event: 'onPressedChange',
        type: 'boolean',
        patch: (value) => ({ pressed: value === true })
      }
    })
  },
  'copy-button': define({
    name: 'CopyButton',
    component: CopyButton,
    base: {},
    controls: [
      c.text('value', 'Text to copy', 'npm install @habibmustafa/ui'),
      c.text('label', 'Label', 'Copy'),
      c.text('copiedLabel', 'Label after copying', 'Copied', { omit: 'Copied' }),
      c.pick('variant', 'Variant', ['default', 'primary', 'secondary', 'outline', 'dashed', 'link', 'text'], 'default'),
      c.pick('size', 'Size', ['tiny', 'small', 'medium', 'large', 'xlarge'], 'small'),
      c.flag('block', 'Full width')
    ]
  }),
  'toggle-group': define({
    name: 'ToggleGroup',
    component: ToggleGroup,
    base: {
      'aria-label': 'Text style',
      items: [
        { value: 'bold', label: 'Bold' },
        { value: 'italic', label: 'Italic' },
        { value: 'underline', label: 'Underline' }
      ]
    },
    controls: [
      c.pick('type', 'Selection', ['single', 'multiple']),
      c.pick('variant', 'Variant', ['default', 'outline', 'segmented'], 'default', { omit: 'default' }),
      c.pick('size', 'Size', ['default', 'tiny', 'sm', 'lg'], 'default', { omit: 'default' }),
      c.flag('allowDeselect', 'Can deselect the last one', true, { omit: true, when: (v) => v.type === 'single' })
    ],
    props: (v) => (v.type === 'multiple' ? { defaultValue: ['bold'] } : { defaultValue: 'bold' })
  })
} satisfies Record<string, Definition>
