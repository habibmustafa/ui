import {
  Calendar,
  Combobox,
  DataInput,
  DateField,
  DatePicker,
  DateRangePicker,
  FileUpload,
  InputOTP,
  Label,
  Mentions,
  MultiSelector,
  NumberInput,
  PasswordInput,
  RadioGroup,
  Rating,
  TimePicker
} from '../../src'
import { c, define } from './define'
import { raw } from './types'

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular' }
]
const SIZES = ['tiny', 'small', 'medium', 'large', 'xlarge']

export const inputs = {
  calendar: define({
    name: 'Calendar',
    component: Calendar,
    base: { mode: 'single', className: 'rounded-md border' },
    controls: [
      c.text('selected', 'Selected day (YYYY-MM-DD)', '2026-10-14', { prop: '' }),
      c.num('numberOfMonths', 'Months shown', 1, 2, 1, { omit: 1 }),
      c.pick('captionLayout', 'Month and year', ['label', 'dropdown'], 'label', { omit: 'label' }),
      c.flag('showOutsideDays', 'Days from other months', true, { omit: true }),
      c.flag('fixedWeeks', 'Always six weeks')
    ],
    props: (v) => {
      const [year, month, day] = String(v.selected).split('-').map(Number)
      const valid = year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31
      return {
        selected: valid
          ? raw(`new Date(${year}, ${month - 1}, ${day})`, new Date(year, month - 1, day))
          : undefined
      }
    },
    state: {
      prop: 'selected',
      event: 'onSelect',
      type: 'Date | undefined',
      patch: (next) => {
        const date = next as Date | undefined
        return {
          selected: date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            : ''
        }
      }
    }
  }),
  combobox: define({
    name: 'Combobox',
    component: Combobox,
    base: { options: frameworks, className: 'w-64', 'aria-label': 'Framework' },
    controls: [
      c.text('placeholder', 'Placeholder', 'Select a framework…'),
      c.text('searchPlaceholder', 'Search placeholder', 'Search…'),
      c.pick('size', 'Size', SIZES, 'small'),
      c.flag('clearable', 'Clearable'),
      c.flag('disabled', 'Disabled')
    ]
  }),
  'data-input': define({
    name: 'DataInput',
    component: DataInput,
    base: { defaultValue: 'sk_live_4eC39HqLyjWDarjtT1zd', readOnly: true, className: 'w-72', 'aria-label': 'API key' },
    controls: [
      c.text('prefix', 'Prefix', ''),
      c.text('suffix', 'Suffix', ''),
      c.pick('size', 'Size', SIZES, 'small'),
      c.flag('copy', 'Copy button', true),
      c.flag('reveal', 'Reveal toggle'),
      c.flag('showCopyOnHover', 'Copy on hover only')
    ]
  }),
  'date-field': define({
    name: 'DateField',
    component: DateField,
    base: {
      defaultValue: raw('new Date(2026, 9, 14)', new Date(2026, 9, 14)),
      className: 'w-64',
      'aria-label': 'Date'
    },
    controls: [
      c.pick('format', 'Format', ['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], 'DD.MM.YYYY', { omit: 'DD.MM.YYYY' }),
      c.pick('size', 'Size', SIZES, 'small', { omit: 'small' }),
      c.flag('disabled', 'Disabled'),
      c.flag('readOnly', 'Read only')
    ]
  }),
  'date-picker': define({
    name: 'DatePicker',
    component: DatePicker,
    base: { calendarProps: raw('{ mode: "single" }', { mode: 'single' }) },
    controls: [
      c.text('triggerLabel', 'Placeholder', 'Pick a date'),
      c.pick('format', 'Format', ['DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], 'DD.MM.YYYY', { omit: 'DD.MM.YYYY' })
    ]
  }),
  'date-range-picker': define({
    name: 'DateRangePicker',
    component: DateRangePicker,
    base: {},
    controls: [
      c.text('placeholder', 'Placeholder', 'Pick a date range'),
      c.num('numberOfMonths', 'Months shown', 1, 2, 2, { omit: 2 }),
      c.flag('clearable', 'Clear button', true, { omit: true }),
      c.flag('closeOnComplete', 'Close after picking', true, { omit: true })
    ]
  }),
  'file-upload': define({
    name: 'FileUpload',
    component: FileUpload,
    base: { className: 'w-full max-w-md' },
    controls: [
      c.text('label', 'Label', 'Drag and drop files here'),
      c.text('description', 'Description', 'PNG or JPG up to 5 MB'),
      c.num('maxFiles', 'Max files', 1, 10, 3),
      c.flag('multiple', 'Several files', true, { omit: true }),
      c.flag('showFileList', 'Show file list', true, { omit: true }),
      c.flag('disabled', 'Disabled')
    ]
  }),
  'input-otp': define({
    name: 'InputOTP',
    component: InputOTP,
    base: { 'aria-label': 'One-time code' },
    controls: [c.num('slots', 'Digits', 4, 8, 6), c.num('groupSize', 'Group size (0 = none)', 0, 4, 3, { omit: 0 })]
  }),
  label: define({
    name: 'Label',
    component: Label,
    base: {},
    controls: [c.text('children', 'Text', 'Email address')]
  }),
  mentions: define({
    name: 'Mentions',
    component: Mentions,
    base: {
      className: 'w-72',
      'aria-label': 'Comment',
      options: [
        { value: 'ada', label: 'Ada Lovelace', description: 'Engineering' },
        { value: 'grace', label: 'Grace Hopper', description: 'Compilers' },
        { value: 'linus', label: 'Linus Torvalds' }
      ]
    },
    controls: [
      c.pick('prefix', 'Trigger', ['@', '#'], '@', { omit: '@' }),
      c.text('defaultValue', 'Starting text', 'Looping in @')
    ]
  }),
  'multi-select': define({
    name: 'MultiSelector',
    component: MultiSelector,
    base: { options: frameworks },
    controls: [
      c.text('selected', 'Selected (comma separated)', 'react,vue', { prop: '' }),
      c.text('label', 'Label', 'Frameworks'),
      c.pick('mode', 'Mode', ['combobox', 'inline-combobox'], 'combobox', { omit: 'combobox' }),
      c.num('badgeLimit', 'Badges shown', 1, 5, 3, { omit: 3 }),
      c.flag('clearable', 'Clearable'),
      c.flag('searchable', 'Search box'),
      c.flag('deletableBadge', 'Remove from badge')
    ],
    props: (v) => ({ values: String(v.selected).split(',').filter(Boolean) }),
    state: {
      prop: 'values',
      event: 'onValuesChange',
      type: 'string[]',
      patch: (next) => ({ selected: (next as string[]).join(',') })
    }
  }),
  'number-input': define({
    name: 'NumberInput',
    component: NumberInput,
    base: { 'aria-label': 'Quantity' },
    controls: [
      c.num('defaultValue', 'Starting value', 0, 100, 5),
      c.num('min', 'Minimum', -100, 0, 0),
      c.num('max', 'Maximum', 10, 1000, 100),
      c.num('step', 'Step', 1, 10, 1, { omit: 1 }),
      c.text('prefix', 'Prefix', ''),
      c.pick('size', 'Size', SIZES, 'small'),
      c.flag('hideControls', 'Hide +/- buttons')
    ]
  }),
  'password-input': define({
    name: 'PasswordInput',
    component: PasswordInput,
    base: { defaultValue: 'hunter2!', className: 'w-72', 'aria-label': 'Password' },
    controls: [
      c.pick('size', 'Size', SIZES, 'small'),
      c.flag('showStrength', 'Strength meter'),
      c.flag('defaultVisible', 'Visible at first')
    ]
  }),
  'radio-group': define({
    name: 'RadioGroup',
    component: RadioGroup,
    base: {
      'aria-label': 'Density',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'compact', label: 'Compact' }
      ]
    },
    controls: [
      c.pick('defaultValue', 'Selected', ['default', 'comfortable', 'compact'], 'comfortable'),
      c.pick('orientation', 'Direction', ['vertical', 'horizontal'], 'vertical', { omit: 'vertical' }),
      c.flag('disabled', 'Disabled')
    ]
  }),
  rating: define({
    name: 'Rating',
    component: Rating,
    base: { 'aria-label': 'Rating' },
    controls: [
      c.num('defaultValue', 'Starting value', 0, 10, 3),
      c.num('max', 'Stars', 3, 10, 5, { omit: 5 }),
      c.pick('size', 'Size', ['small', 'medium', 'large'], 'medium'),
      c.flag('allowHalf', 'Half stars'),
      c.flag('allowClear', 'Click again to clear'),
      c.flag('readOnly', 'Read only'),
      c.flag('disabled', 'Disabled')
    ]
  }),
  'time-picker': define({
    name: 'TimePicker',
    component: TimePicker,
    base: { defaultValue: '14:30', 'aria-label': 'Time' },
    controls: [
      c.pick('hourCycle', 'Hours', ['24', '12'], '24', { prop: '' }),
      c.num('minuteStep', 'Minute step', 1, 30, 1, { omit: 1 }),
      c.pick('size', 'Size', ['tiny', 'small', 'medium', 'large'], 'small', { omit: 'small' }),
      c.flag('showSeconds', 'Show seconds'),
      c.flag('clock', 'Clock', true, { omit: true }),
      c.flag('disabled', 'Disabled')
    ],
    props: (v) => (v.hourCycle === '12' ? { hourCycle: 12 } : {})
  })
}
