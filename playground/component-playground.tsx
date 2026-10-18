import { useEffect, useId, useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { Checkbox, Input, Select, Tabs, Textarea, ToggleGroup, cn } from '../src'
import { CodeSnippet, SnippetCopyButton } from './code-snippet'
import { PreviewSurface } from './preview-surface'
import { cachedPlayground, hasPlayground, loadPlayground, type LoadedPlayground } from './playground-config/registry'
import {
  exampleCode,
  exampleSummary,
  renderExample,
  type Field,
  type Update,
  type Value,
  type Values
} from './playground-config/types'

export { hasPlayground }

function NumberControl({
  field,
  value,
  id,
  descriptionId,
  onChange
}: {
  field: Extract<Field, { type: 'number' }>
  value: number
  id: string
  descriptionId?: string
  onChange: (value: Value) => void
}) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])
  const commit = () => {
    const parsed = draft.trim() ? Number(draft) : value
    const next = Math.min(field.max, Math.max(field.min, Number.isFinite(parsed) ? parsed : value))
    const step = field.step ?? 1
    const rounded =
      field.min +
      Math.min(Math.floor((field.max - field.min) / step), Math.round((next - field.min) / step)) *
        step
    setDraft(String(rounded))
    onChange(rounded)
  }
  return (
    <Input
      id={id}
      aria-describedby={descriptionId}
      type="number"
      size="small"
      min={field.min}
      max={field.max}
      step={field.step ?? 1}
      value={draft}
      onChange={(event) => {
        const next = event.target.value
        setDraft(next)
        const parsed = Number(next)
        if (
          next.trim() &&
          Number.isFinite(parsed) &&
          parsed >= field.min &&
          parsed <= field.max &&
          Number.isInteger((parsed - field.min) / (field.step ?? 1))
        )
          onChange(parsed)
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
    />
  )
}

function Control({ field, values, update }: { field: Field; values: Values; update: Update }) {
  const id = useId()
  const descriptionId = field.help ? `${id}-help` : undefined
  if (field.when && !field.when(values)) return null
  const value = values[field.key]
  const onChange = (next: Value) => update({ [field.key]: next })
  let control
  switch (field.type) {
    case 'boolean':
      return (
        <div>
          <label
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-md border bg-background px-3 py-1.5 text-sm"
            htmlFor={id}
            title={field.help}
          >
            <Checkbox
              id={id}
              checked={value === true}
              onCheckedChange={(next) => onChange(next === true)}
              aria-describedby={descriptionId}
            />
            {field.label}
          </label>
          {field.help && (
            <span id={descriptionId} className="sr-only">
              {field.help}
            </span>
          )}
        </div>
      )
    case 'choice': {
      const options = typeof field.options === 'function' ? field.options(values) : field.options
      // A segmented row only fits short labels; longer ones (formats, variant names) get a select.
      const compact =
        field.key === 'size' || // shown as XS–XL
        (options.every((option) => option.label.length <= 13) &&
        options.reduce((total, option) => total + option.label.length, 0) <= 29)
      if (
        options.length >= 2 &&
        options.length <= 5 &&
        compact &&
        !options.some((option) => option.value === '')
      ) {
        control = (
          <ToggleGroup
            type="single"
            variant="segmented"
            tone="outline"
            size="tiny"
            allowDeselect={false}
            value={String(value)}
            onValueChange={onChange}
            aria-labelledby={`${id}-label`}
            aria-describedby={descriptionId}
            className="w-full flex-wrap justify-start"
            items={options.map((option) => ({
              ...option,
              className: 'min-w-0 flex-1 px-2',
              'aria-label': option.label,
              label:
                field.key === 'size'
                  ? ({ tiny: 'XS', small: 'S', medium: 'M', large: 'L', xlarge: 'XL' }[
                      option.value
                    ] ?? option.label)
                  : option.label
            }))}
          />
        )
        break
      }
      // Radix reserves the empty value for clearing; the panel's None is a real option.
      const empty = '__playground_empty__'
      control = (
        <Select
          id={id}
          size="small"
          value={String(value) || empty}
          onValueChange={(next) => onChange(next === empty ? '' : next)}
          options={options.map((option) => ({ ...option, value: option.value || empty }))}
          aria-describedby={descriptionId}
        />
      )
      break
    }
    case 'number':
      control = (
        <NumberControl
          field={{ ...field, ...field.bounds?.(values) }}
          value={Number(value)}
          id={id}
          descriptionId={descriptionId}
          onChange={onChange}
        />
      )
      break
    case 'textarea':
      control = (
        <Textarea
          id={id}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="resize-y"
          aria-describedby={descriptionId}
        />
      )
      break
    case 'text':
      control = (
        <Input
          id={id}
          size="small"
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={descriptionId}
        />
      )
  }
  return (
    <div className="space-y-1.5">
      <label id={`${id}-label`} htmlFor={id} className="text-xs font-medium text-foreground-light">
        {field.label}
      </label>
      {control}
      {field.help && (
        <p id={descriptionId} className="text-xs text-foreground-lighter">
          {field.help}
        </p>
      )}
    </div>
  )
}

/** Value fields in a grid; on/off switches gathered into one row of chips below them. */
function GroupFields({
  fields,
  values,
  update
}: {
  fields: Field[]
  values: Values
  update: Update
}) {
  const visible = fields.filter((field) => !field.when || field.when(values))
  const flags = visible.filter((field) => field.type === 'boolean')
  const rest = visible.filter((field) => field.type !== 'boolean')
  return (
    <div className="space-y-4">
      {rest.length > 0 && (
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((field) => (
            <Control key={field.key} field={field} values={values} update={update} />
          ))}
        </div>
      )}
      {flags.length > 0 && (
        <div role="group" aria-label="Options" className="flex flex-wrap gap-2">
          {flags.map((field) => (
            <Control key={field.key} field={field} values={values} update={update} />
          ))}
        </div>
      )}
    </div>
  )
}

function Playground({ definition, presets: scenarios }: LoadedPlayground) {
  const [values, setValues] = useState<Values>(() => ({ ...definition.initial }))
  const [revision, setRevision] = useState(0)
  const [showCode, setShowCode] = useState(false)
  const codeId = useId()
  const presets = [{ label: 'Default', values: {} }, ...scenarios]
  const currentPreset = presets.find((preset) => {
    const candidate = { ...definition.initial, ...preset.values }
    const normalized = definition.normalize?.(candidate) ?? candidate
    return Object.keys(normalized).every((key) => normalized[key] === values[key])
  })
  const update: Update = (patch) =>
    setValues((previous) => {
      const next = { ...previous, ...patch }
      return definition.normalize?.(next) ?? next
    })
  const example = definition.build(values)
  const code = exampleCode(example)
  const summary = exampleSummary(example)
  return (
    <section
      id="playground"
      aria-label={`${definition.name} playground`}
      className="mb-12 scroll-mt-32"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">Make it yours</h2>
        <p className="mt-1 text-sm text-foreground-lighter">
          Start with a scenario. Make it your own.
        </p>
      </div>
      {presets.length > 1 && (
      <div
        role="group"
        aria-label="Starting scenarios"
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            aria-pressed={currentPreset?.label === preset.label}
            className={cn(
              'focus-ring cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              currentPreset?.label === preset.label
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-transparent text-foreground-light hover:border-strong hover:bg-surface-100'
            )}
            onClick={() => {
              const next = { ...definition.initial, ...preset.values }
              setValues(definition.normalize?.(next) ?? next)
              setRevision((value) => value + 1)
            }}
          >
            {preset.label}
          </button>
        ))}
        {!currentPreset && <span className="px-1 text-xs text-foreground-lighter">Custom</span>}
      </div>
      )}
      <div className="overflow-hidden rounded-xl border border-t-2 border-t-brand-default bg-studio">
        <PreviewSurface
          compact
          className="rounded-none border-0"
          controls={<span className="text-xs text-foreground-lighter">Live preview</span>}
          onReset={() => {
            setValues({ ...definition.initial })
            setRevision((value) => value + 1)
          }}
        >
          <div
            key={revision}
            role="group"
            aria-label="Live preview"
            className="flex w-full items-center justify-center"
          >
            {renderExample(example, update)}
          </div>
        </PreviewSurface>
        <div
          role="region"
          aria-label="Playground settings"
          className="border-t bg-surface-75 px-4 pb-5 pt-2 sm:px-6"
        >
          <Tabs
            layout="inline"
            listLabel="Customize"
            defaultValue={
              definition.groups.some((group) => group.label === 'Appearance')
                ? 'Appearance'
                : definition.groups[0].label
            }
            classNames={{ list: 'gap-6 border-0', content: 'mt-5' }}
            items={definition.groups.map((group) => ({
              value: group.label,
              label: group.label,
              content: <GroupFields fields={group.fields} values={values} update={update} />
            }))}
          />
        </div>
        <div role="region" aria-label="Your code" className="border-t bg-surface-75">
          <div className="flex items-center gap-2 px-4 py-2 sm:px-6">
            <button
              type="button"
              aria-label="Your code"
              aria-expanded={showCode}
              aria-controls={codeId}
              onClick={() => setShowCode((value) => !value)}
              className="focus-ring flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md py-1 text-left"
            >
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  'size-4 shrink-0 text-foreground-lighter transition-transform',
                  showCode && 'rotate-90'
                )}
              />
              <span className="shrink-0 text-xs font-medium text-foreground-light">Your code</span>
              {!showCode && (
                <code className="min-w-0 truncate font-mono text-xs text-foreground-lighter">
                  {summary}
                </code>
              )}
            </button>
            {!showCode && <SnippetCopyButton value={code} className="relative inset-auto h-8 w-8" />}
          </div>
          <div id={codeId} hidden={!showCode} className="px-4 pb-4 sm:px-6">
            {showCode && <CodeSnippet code={code} maxHeight={360} />}
          </div>
        </div>
      </div>
    </section>
  )
}

/** The section's height before its definition arrives, so the page below doesn't jump. */
function PlaygroundSkeleton() {
  return (
    <section aria-hidden="true" className="mb-12 min-h-[34rem] scroll-mt-32">
      <div className="mb-5 h-12 w-56 rounded-md bg-surface-100" />
      <div className="h-[30rem] rounded-xl border bg-surface-75" />
    </section>
  )
}

/**
 * Loads the component's definition (one small chunk per category) and shows the section.
 * Nothing about a component's playground is bundled with the page until it opens.
 */
export function ComponentPlayground({ id }: { id: string }) {
  const [, loadedOnce] = useState(0)
  const loaded = cachedPlayground(id)
  useEffect(() => {
    if (!hasPlayground(id) || cachedPlayground(id)) return
    let live = true
    void loadPlayground(id).then(() => live && loadedOnce((count) => count + 1))
    return () => {
      live = false
    }
  }, [id])
  if (!hasPlayground(id)) return null
  return loaded ? <Playground key={id} {...loaded} /> : <PlaygroundSkeleton />
}
