import type { ComponentProps } from 'react'
import { Alert, Badge } from '../../src'
import {
  bool,
  choice,
  icon,
  iconField,
  input,
  num,
  number,
  text,
  toggle,
  width,
  widthField,
  type Definition
} from './types'

export const display = {
  badge: {
    name: 'Badge',
    initial: { label: 'Status', variant: 'success', icon: 'none' },
    groups: [
      { label: 'Content', fields: [input('label', 'Badge text'), iconField()] },
      {
        label: 'Appearance',
        fields: [
          choice('variant', 'Variant', 'default', 'secondary', 'success', 'warning', 'destructive')
        ]
      }
    ],
    build: (v) => ({
      name: 'Badge',
      props: {
        variant: v.variant as ComponentProps<typeof Badge>['variant'],
        children: (
          <>
            {icon(v.icon)}
            {text(v, 'label')}
          </>
        )
      }
    })
  },
  progress: {
    name: 'Progress',
    initial: {
      label: 'Upload progress',
      value: 60,
      indeterminate: false,
      thickness: 'thin',
      width: 'comfortable'
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('label', 'Accessible label'),
          { ...number('value', 'Progress (%)', 0, 100), when: (v) => !bool(v, 'indeterminate') }
        ]
      },
      {
        label: 'Appearance',
        fields: [choice('thickness', 'Thickness', 'thin', 'medium', 'thick'), widthField]
      },
      {
        label: 'Behavior',
        fields: [
          {
            ...toggle('indeterminate', 'Indeterminate'),
            help: 'An unknown value: the bar has no percentage or filled portion.'
          }
        ]
      }
    ],
    build: (v) => ({
      name: 'Progress',
      props: {
        value: bool(v, 'indeterminate') ? null : num(v, 'value'),
        'aria-label': text(v, 'label') || 'Upload progress',
        className: `${width(v)} ${{ thin: 'h-1', medium: 'h-2', thick: 'h-3' }[text(v, 'thickness')]}`
      }
    })
  },
  avatar: {
    name: 'Avatar',
    initial: { fallback: 'AM', src: '', alt: 'Profile photo', size: 'medium', ring: false },
    groups: [
      {
        label: 'Content',
        fields: [
          input('fallback', 'Fallback text'),
          {
            ...input('src', 'Image URL'),
            help: 'Leave empty to show the fallback. A failed image also uses the fallback.'
          },
          input('alt', 'Image description')
        ]
      },
      {
        label: 'Appearance',
        fields: [
          choice('size', 'Size', 'small', 'medium', 'large', 'xlarge'),
          toggle('ring', 'Outline ring')
        ]
      }
    ],
    build: (v) => ({
      name: 'Avatar',
      props: {
        src: text(v, 'src') || undefined,
        alt: text(v, 'alt'),
        fallback: text(v, 'fallback'),
        className: `${{ small: 'size-8 text-xs', medium: 'size-10 text-sm', large: 'size-16 text-lg', xlarge: 'size-24 text-2xl' }[text(v, 'size')]}${bool(v, 'ring') ? ' ring-2 ring-border ring-offset-2 ring-offset-background' : ''}`
      }
    })
  },
  alert: {
    name: 'Alert',
    initial: {
      title: 'A little heads up',
      description: 'Your project has an update ready to review.',
      variant: 'default',
      icon: 'Info',
      width: 'comfortable',
      role: 'alert'
    },
    groups: [
      {
        label: 'Content',
        fields: [
          input('title', 'Title'),
          { key: 'description', label: 'Description', type: 'textarea' },
          iconField()
        ]
      },
      {
        label: 'Appearance',
        fields: [choice('variant', 'Variant', 'default', 'destructive'), widthField]
      },
      {
        label: 'Behavior',
        fields: [
          {
            ...choice('role', 'Announcement', 'alert', 'status'),
            help: 'Alert announces urgent updates; status is polite.'
          }
        ]
      }
    ],
    build: (v) => ({
      name: 'Alert',
      props: {
        title: text(v, 'title'),
        description: text(v, 'description') || undefined,
        variant: v.variant as ComponentProps<typeof Alert>['variant'],
        icon: icon(v.icon),
        className: width(v),
        role: text(v, 'role') as 'alert' | 'status'
      }
    })
  }
} satisfies Record<string, Definition>
