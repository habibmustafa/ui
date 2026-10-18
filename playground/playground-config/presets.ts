import type { PlaygroundPreset } from './types'

export type { PlaygroundPreset }

/** Each scenario starts from the component defaults, never from the last scenario. */
export const playgroundPresets: Record<string, PlaygroundPreset[]> = {
  button: [
    { label: 'With icon', values: { label: 'Download', icon: 'Download' } },
    { label: 'Loading', values: { label: 'Saving changes', loading: true } },
    {
      label: 'Destructive',
      values: { label: 'Delete project', variant: 'danger', icon: 'TriangleAlert' }
    },
    { label: 'Disabled', values: { disabled: true } }
  ],
  input: [
    {
      label: 'With prefix',
      values: { label: 'Amount', placeholder: '0.00', prefix: '$', suffix: 'USD' }
    },
    {
      label: 'Password',
      values: {
        label: 'Password',
        type: 'password',
        value: 'secret123',
        placeholder: 'Enter password'
      }
    },
    { label: 'Invalid', values: { invalid: true, value: 'not-an-email', type: 'email' } },
    { label: 'Read only', values: { readOnly: true, value: 'hello@example.com' } }
  ],
  textarea: [
    {
      label: 'Filled',
      values: { value: 'A small improvement can make a big difference.\nTell us what you think.' }
    },
    { label: 'Long form', values: { rows: 8, maxLength: 2000, placeholder: 'Tell your story…' } },
    { label: 'Invalid', values: { invalid: true, required: true } },
    { label: 'Read only', values: { readOnly: true, value: 'This message is ready to send.' } }
  ],
  switch: [
    { label: 'Off', values: { checked: false } },
    { label: 'Compact', values: { size: 'small' } },
    { label: 'Without label', values: { showLabel: false } },
    { label: 'Disabled', values: { disabled: true } }
  ],
  checkbox: [
    { label: 'Unchecked', values: { checked: 'unchecked' } },
    { label: 'Mixed', values: { checked: 'indeterminate', label: 'Select all' } },
    { label: 'Required', values: { checked: 'unchecked', required: true } },
    { label: 'Disabled', values: { disabled: true } }
  ],
  select: [
    { label: 'Selected', values: { value: 'option-1' } },
    { label: 'Grouped', values: { grouped: true, disableLast: true } },
    { label: 'Invalid', values: { invalid: true, required: true } },
    { label: 'Disabled', values: { disabled: true, value: 'option-1' } }
  ],
  slider: [
    { label: 'Range', values: { label: 'Price', range: true, start: 20, end: 80 } },
    { label: 'Stepped', values: { step: 10, start: 30 } },
    { label: 'Vertical', values: { orientation: 'vertical' } },
    { label: 'Disabled', values: { disabled: true } }
  ],
  badge: [
    { label: 'With icon', values: { label: 'Verified', icon: 'Check' } },
    { label: 'Warning', values: { label: 'Pending', variant: 'warning' } },
    { label: 'Error', values: { label: 'Failed', variant: 'destructive' } },
    { label: 'Neutral', values: { label: 'Draft', variant: 'default' } }
  ],
  progress: [
    { label: 'Just started', values: { value: 10 } },
    { label: 'Complete', values: { value: 100 } },
    { label: 'Indeterminate', values: { indeterminate: true } },
    { label: 'Thick', values: { thickness: 'thick' } }
  ],
  avatar: [
    { label: 'Different initials', values: { fallback: 'JL' } },
    { label: 'Large', values: { size: 'large' } },
    { label: 'With ring', values: { ring: true } },
    { label: 'Image fallback', values: { src: 'data:image/png;base64,invalid', fallback: 'AM' } }
  ],
  alert: [
    {
      label: 'Destructive',
      values: {
        variant: 'destructive',
        icon: 'TriangleAlert',
        title: 'Something went wrong',
        description: 'Please check your details and try again.'
      }
    },
    { label: 'Title only', values: { title: 'Your changes have been saved.', description: '' } },
    { label: 'Without icon', values: { icon: 'none' } },
    {
      label: 'Status',
      values: {
        role: 'status',
        icon: 'Check',
        title: 'All up to date',
        description: 'Your latest changes are now available.'
      }
    }
  ],
  toggle: [
    { label: 'Pressed', values: { pressed: true } },
    { label: 'Outlined', values: { variant: 'outline' } },
    { label: 'Text only', values: { icon: 'none', label: 'Bold' } },
    { label: 'Disabled', values: { disabled: true } }
  ]
}
