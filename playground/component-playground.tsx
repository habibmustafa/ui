import { useState, type ComponentProps, type ReactNode } from 'react'

import { Alert, Avatar, Badge, Button, Checkbox, Input, Progress, Select, Slider, Switch, Tabs, Textarea, Toggle } from '../src'
import { CodeSnippet } from './code-snippet'
import { PreviewSurface } from './preview-surface'

type Values = Record<string, string | boolean>
type Choice = { prop: string; label: string; options: string[] }
type Definition = {
  name: string
  initial: Values
  choices?: Choice[]
  flags?: { prop: string; label: string }[]
  render: (values: Values) => ReactNode
  code: (values: Values) => string
}
const SIZES = ['tiny', 'small', 'medium', 'large', 'xlarge']
const disabled = { prop: 'disabled', label: 'Disabled' }
const checked = { prop: 'defaultChecked', label: 'Checked' }
const sizeChoice = { prop: 'size', label: 'Size', options: SIZES }
const str = (values: Values, key: string) => String(values[key])
const flag = (values: Values, key: string) => values[key] === true
const size = (values: Values) => values.size as ComponentProps<typeof Button>['size']

function element(name: string, values: Values, extra = '', children?: string) {
  const props = Object.entries(values).filter(([, value]) => value !== false).map(([key, value]) => value === true ? key : `${key}="${value}"`)
  const attributes = [...props, ...(extra ? [extra] : [])].map((prop) => `  ${prop}`).join('\n')
  return `import { ${name} } from '@habibmustafa/ui'\n\n<${name}${attributes ? '\n' + attributes + '\n' : ''}${children === undefined ? '/>' : `>\n  ${children}\n</${name}>`}`
}

const DEFINITIONS: Record<string, Definition> = {
  button: {
    name: 'Button', initial: { variant: 'primary', size: 'small', disabled: false, loading: false },
    choices: [{ prop: 'variant', label: 'Variant', options: ['primary', 'default', 'secondary', 'outline', 'dashed', 'link', 'text', 'warning', 'danger'] }, sizeChoice],
    flags: [disabled, { prop: 'loading', label: 'Loading' }],
    render: (v) => <Button variant={v.variant as ComponentProps<typeof Button>['variant']} size={size(v)} disabled={flag(v, 'disabled')} loading={flag(v, 'loading')}>Continue</Button>,
    code: (v) => element('Button', v, '', 'Continue'),
  },
  input: {
    name: 'Input', initial: { size: 'small', disabled: false, 'aria-invalid': false }, choices: [sizeChoice], flags: [disabled, { prop: 'aria-invalid', label: 'Invalid' }],
    render: (v) => <Input size={size(v)} disabled={flag(v, 'disabled')} aria-invalid={flag(v, 'aria-invalid')} aria-label="Email" placeholder="you@example.com" className="max-w-xs" />,
    code: (v) => element('Input', v, 'aria-label="Email" placeholder="you@example.com" className="max-w-xs"'),
  },
  textarea: {
    name: 'Textarea', initial: { disabled: false, 'aria-invalid': false }, flags: [disabled, { prop: 'aria-invalid', label: 'Invalid' }],
    render: (v) => <Textarea disabled={flag(v, 'disabled')} aria-invalid={flag(v, 'aria-invalid')} aria-label="Message" placeholder="Write your message…" className="max-w-sm" />,
    code: (v) => element('Textarea', v, 'aria-label="Message" placeholder="Write your message…" className="max-w-sm"'),
  },
  switch: {
    name: 'Switch', initial: { size: 'medium', defaultChecked: true, disabled: false }, choices: [{ ...sizeChoice, options: ['small', 'medium', 'large'] }], flags: [checked, disabled],
    render: (v) => <Switch size={v.size as 'small' | 'medium' | 'large'} defaultChecked={flag(v, 'defaultChecked')} disabled={flag(v, 'disabled')} aria-label="Notifications" />,
    code: (v) => element('Switch', v, 'aria-label="Notifications"'),
  },
  checkbox: {
    name: 'Checkbox', initial: { defaultChecked: true, disabled: false }, flags: [checked, disabled],
    render: (v) => <Checkbox defaultChecked={flag(v, 'defaultChecked')} disabled={flag(v, 'disabled')} aria-label="Accept terms" />,
    code: (v) => element('Checkbox', v, 'aria-label="Accept terms"'),
  },
  badge: {
    name: 'Badge', initial: { variant: 'success' }, choices: [{ prop: 'variant', label: 'Variant', options: ['default', 'secondary', 'success', 'warning', 'destructive'] }],
    render: (v) => <Badge variant={v.variant as ComponentProps<typeof Badge>['variant']}>Status</Badge>,
    code: (v) => element('Badge', v, '', 'Status'),
  },
  select: {
    name: 'Select', initial: { disabled: false }, flags: [disabled],
    render: (v) => <Select aria-label="Environment" placeholder="Choose environment" disabled={flag(v, 'disabled')} options={[{ value: 'production', label: 'Production' }, { value: 'staging', label: 'Staging' }]} />,
    code: (v) => element('Select', v, 'aria-label="Environment" placeholder="Choose environment"\n  options={[{ value: "production", label: "Production" }, { value: "staging", label: "Staging" }]}'),
  },
  progress: {
    name: 'Progress', initial: { value: '60' }, choices: [{ prop: 'value', label: 'Progress', options: ['0', '25', '60', '100'] }],
    render: (v) => <Progress value={Number(v.value)} aria-label="Upload progress" className="max-w-xs" />,
    code: (v) => element('Progress', {}, `value={${v.value}} aria-label="Upload progress" className="max-w-xs"`),
  },
  slider: {
    name: 'Slider', initial: { disabled: false }, flags: [disabled],
    render: (v) => <Slider defaultValue={[40]} max={100} step={1} disabled={flag(v, 'disabled')} aria-label="Volume" className="max-w-xs" />,
    code: (v) => element('Slider', v, 'defaultValue={[40]} max={100} step={1} aria-label="Volume" className="max-w-xs"'),
  },
  avatar: {
    name: 'Avatar', initial: { fallback: 'AM' }, choices: [{ prop: 'fallback', label: 'Initials', options: ['AM', 'SR', 'JL'] }],
    render: (v) => <Avatar fallback={str(v, 'fallback')} />,
    code: (v) => element('Avatar', v),
  },
  alert: {
    name: 'Alert', initial: { variant: 'default' }, choices: [{ prop: 'variant', label: 'Variant', options: ['default', 'destructive'] }],
    render: (v) => <Alert variant={v.variant as ComponentProps<typeof Alert>['variant']} title="A little heads up" description="Your project has an update ready to review." className="max-w-sm" />,
    code: (v) => element('Alert', v, 'title="A little heads up" description="Your project has an update ready to review." className="max-w-sm"'),
  },
  toggle: {
    name: 'Toggle', initial: { disabled: false, defaultPressed: false }, flags: [disabled, { prop: 'defaultPressed', label: 'Pressed' }],
    render: (v) => <Toggle disabled={flag(v, 'disabled')} defaultPressed={flag(v, 'defaultPressed')} aria-label="Bold">B</Toggle>,
    code: (v) => element('Toggle', v, 'aria-label="Bold"', 'B'),
  },
}

export const hasPlayground = (id: string) => Boolean(DEFINITIONS[id])

export function ComponentPlayground({ id }: { id: string }) {
  const definition = DEFINITIONS[id]
  const [values, setValues] = useState(definition.initial)
  const [revision, setRevision] = useState(0)
  const update = (prop: string, value: string | boolean) => setValues((previous) => ({ ...previous, [prop]: value }))

  return (
    <section id="playground" aria-label={`${definition.name} playground`} className="mb-12 scroll-mt-32">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Make it yours</h2>
        <p className="text-xs text-foreground-lighter">Change a setting. Take the code.</p>
      </div>
      <Tabs.Root defaultValue="preview">
        <Tabs.List className="gap-5" aria-label="Interactive playground">
          <Tabs.Trigger value="preview">Playground</Tabs.Trigger>
          <Tabs.Trigger value="code">Your code</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="preview">
          <PreviewSurface onReset={() => { setValues(definition.initial); setRevision((value) => value + 1) }} controls={<>
            {definition.choices?.map((choice) => <label key={choice.prop} className="flex items-center gap-2 text-xs text-foreground-light">
              {choice.label}
              <Select size="tiny" aria-label={choice.label} value={str(values, choice.prop)} onValueChange={(value) => update(choice.prop, value)} options={choice.options.map((option) => ({ value: option, label: option }))} className="w-auto min-w-24 text-foreground" />
            </label>)}
            {definition.flags?.map((field) => <label key={field.prop} className="flex cursor-pointer items-center gap-2 py-1 text-xs text-foreground-light"><Checkbox checked={flag(values, field.prop)} onCheckedChange={(value) => update(field.prop, value === true)} />{field.label}</label>)}
          </>}>
            <div key={JSON.stringify(values) + revision} className="flex w-full items-center justify-center">{definition.render(values)}</div>
          </PreviewSurface>
        </Tabs.Content>
        <Tabs.Content value="code"><CodeSnippet code={definition.code(values)} /></Tabs.Content>
      </Tabs.Root>
    </section>
  )
}
