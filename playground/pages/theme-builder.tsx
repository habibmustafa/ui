import { Check, Download, Link2, Moon, RotateCcw, Sun, Upload } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'

import {
  Badge,
  Button,
  Dialog,
  Label,
  Select,
  Slider,
  Switch,
  Tabs,
  Textarea,
  THEME_PRESETS,
  ToggleGroup,
  cn,
  contrastRatio,
  parseColor,
  themeToCss,
  toast,
  useTheme,
  type ThemeConfig,
} from '../../src'
import { CodeSnippet } from '../code-snippet'
import { ColorField } from '../color-field'
import {
  DEFAULT_STATE,
  MONO_FONTS,
  SANS_FONTS,
  fromConfig,
  monoFont,
  sansFont,
  setApplyEverywhere,
  setBuilderState,
  stateFromQuery,
  stateToQuery,
  toConfig,
  useThemeBuilder,
  type BuilderState,
} from '../theme-store'
import { ThemePreview } from './theme-preview'

/*
 * Theme builder (/theme). Every control writes the builder store; app.tsx renders the
 * resulting tokens with the library's own <ThemeStyle>, so the whole page — this
 * panel included — is the preview. The same createTheme() produces the exported CSS
 * and the code snippet, so what you see is what ships.
 */


const sameState = (a: BuilderState, b: BuilderState) => JSON.stringify(a) === JSON.stringify(b)

/* ------------------------------------------------------------ controls */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b py-5 first:pt-0 last:border-b-0">
      <h2 className="font-mono text-xs uppercase text-foreground-muted">{title}</h2>
      {children}
    </section>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  swatch,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  format: (value: number) => string
  /** Small colour chip next to the value (hue sliders). */
  swatch?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-foreground">{label}</span>
        <span className="flex items-center gap-1.5 tabular-nums text-foreground-light">
          {swatch && <span aria-hidden="true" className="h-3 w-3 rounded-full border" style={{ background: swatch }} />}
          {format(value)}
        </span>
      </div>
      <Slider
        aria-label={label}
        aria-valuetext={format(value)}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}

/* ------------------------------------------------------------ contrast */

interface ContrastRow {
  key: string
  label: string
  ratio: number | null
}

const CONTRAST_ROWS: { key: string; label: string }[] = [
  { key: 'text', label: 'Body text' },
  { key: 'text-light', label: 'Secondary text' },
  { key: 'text-lighter', label: 'Helper text' },
  { key: 'primary', label: 'Link (primary)' },
  { key: 'button', label: 'Primary button' },
  { key: 'destructive', label: 'Error text' },
  { key: 'warning', label: 'Warning text' },
]

/** Resolves any computed CSS colour (oklch(), color-mix, …) to sRGB via a 1px canvas. */
function makeColorReader() {
  let ctx: CanvasRenderingContext2D | null = null
  try {
    ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  } catch {
    ctx = null
  }
  if (!ctx) return null
  return (css: string) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return { rgb: [r / 255, g / 255, b / 255] as [number, number, number], alpha: a / 255 }
  }
}

function backgroundOf(element: Element, read: NonNullable<ReturnType<typeof makeColorReader>>) {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const color = read(getComputedStyle(node).backgroundColor)
    if (color.alpha > 0.95) return color.rgb
  }
  return read(getComputedStyle(document.body).backgroundColor).rgb
}

/** Re-measures whenever `key` changes (the theme query + light/dark mode). */
function useContrastRows(key: string): ContrastRow[] {
  const [rows, setRows] = useState<ContrastRow[]>(CONTRAST_ROWS.map((row) => ({ ...row, ratio: null })))

  useEffect(() => {
    const read = makeColorReader()
    if (!read) return
    // Measure after the new tokens have been applied and transitions have settled.
    const timer = setTimeout(() => {
      setRows(
        CONTRAST_ROWS.map((row) => {
          const element = document.querySelector(`[data-contrast="${row.key}"]`)
          if (!element) return { ...row, ratio: null }
          const fg = read(getComputedStyle(element).color).rgb
          return { ...row, ratio: contrastRatio(fg, backgroundOf(element, read)) }
        })
      )
    }, 260)
    return () => clearTimeout(timer)
  }, [key])

  return rows
}

function ContrastPanel({ rows }: { rows: ContrastRow[] }) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1.5" aria-label="Contrast check">
        {rows.map((row) => {
          const ratio = row.ratio
          const grade =
            ratio === null ? null : ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'Fail'
          return (
            <li key={row.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-foreground-light">{row.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {ratio === null ? '—' : `${ratio.toFixed(1)}:1`}
                </span>
                {grade && (
                  <Badge variant={grade === 'Fail' ? 'destructive' : grade === 'AA large' ? 'warning' : 'success'}>
                    {grade}
                  </Badge>
                )}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-foreground-lighter">
        WCAG: normal text needs AA ≥ 4.5:1 (AAA ≥ 7:1); large text needs 3:1.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------ export */

function cssFile(config: ThemeConfig, state: BuilderState, link: string) {
  const css = themeToCss(config)
  const fonts = [sansFont(state), monoFont(state)].filter((font) => font.google)
  const header = [
    '/*',
    ' * @habibmustafa/ui theme',
    ` * Edit: ${link}`,
    ' * Load this file after @habibmustafa/ui/styles.css.',
    ...fonts.map((font) => ` * Font: load "${font.label}" yourself (e.g. Google Fonts).`),
    ' */',
  ].join('\n')
  return `${header}\n\n${css || '/* Default theme: nothing to override. */'}\n`
}

function codeFile(config: ThemeConfig) {
  return `import { ThemeProvider, createTheme } from '@habibmustafa/ui'

const theme = createTheme(${JSON.stringify(config, null, 2)})

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider tokens={theme}>{children}</ThemeProvider>
}`
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function ImportTab({ onDone }: { onDone: () => void }) {
  const id = useId()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const apply = () => {
    const input = text.trim()
    let next: BuilderState | null = null
    if (/^https?:\/\//.test(input) || input.startsWith('?')) {
      next = stateFromQuery(input.includes('?') ? input.slice(input.indexOf('?') + 1) : '')
      if (!next) return setError('That link has no theme parameters.')
    } else {
      try {
        const parsed: unknown = JSON.parse(input)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
        const config = parsed as ThemeConfig
        for (const key of ['brand', 'accent'] as const) {
          if (config[key] !== undefined && (typeof config[key] !== 'string' || !parseColor(config[key]))) {
            return setError(`"${key}" is not a readable colour.`)
          }
        }
        next = fromConfig(config)
      } catch {
        return setError('Could not read that JSON. Paste the JSON from Export or a builder link.')
      }
    }
    setBuilderState(next)
    toast.success('Theme imported')
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>JSON config or builder link</Label>
      <Textarea
        id={id}
        rows={8}
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          setText(event.target.value)
          setError(null)
        }}
        placeholder={'{\n  "brand": "#6366f1",\n  "radius": 8\n}'}
        className="font-mono text-xs"
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div>
        <Button variant="primary" icon={<Upload />} disabled={!text.trim()} onClick={apply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

function ExportDialog({ state, link }: { state: BuilderState; link: string }) {
  const [open, setOpen] = useState(false)
  const config = useMemo(() => toConfig(state), [state])
  const css = cssFile(config, state, link)
  const json = JSON.stringify(config, null, 2)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="primary" icon={<Download />}>
          Export / Import
        </Button>
      </Dialog.Trigger>
      <Dialog.Content size="xlarge">
        <Dialog.Header>
          <Dialog.Title>Take the theme to your project</Dialog.Title>
          <Dialog.Description>
            The CSS file needs no code changes. The code version lets you change the theme at runtime.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Section>
          <Tabs.Root defaultValue="css">
            <Tabs.List className="gap-5">
              <Tabs.Trigger value="css">CSS</Tabs.Trigger>
              <Tabs.Trigger value="code">Code</Tabs.Trigger>
              <Tabs.Trigger value="json">JSON</Tabs.Trigger>
              <Tabs.Trigger value="import">Import</Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Content value="css" className="flex flex-col gap-3">
              <CodeSnippet code={css} lang="css" maxHeight={340} />
              <div>
                <Button variant="default" icon={<Download />} onClick={() => download('theme.css', css, 'text/css')}>
                  Download theme.css
                </Button>
              </div>
            </Tabs.Content>
            <Tabs.Content value="code" className="flex flex-col gap-3">
              <p className="text-sm text-foreground-light">
                The same generator ships in the library: keep the config in code and change it whenever you need.
              </p>
              <CodeSnippet code={codeFile(config)} maxHeight={340} />
            </Tabs.Content>
            <Tabs.Content value="json" className="flex flex-col gap-3">
              <CodeSnippet code={json} maxHeight={340} />
              <div>
                <Button variant="default" icon={<Download />} onClick={() => download('theme.json', json, 'application/json')}>
                  Download theme.json
                </Button>
              </div>
            </Tabs.Content>
            <Tabs.Content value="import">
              <ImportTab onDone={() => setOpen(false)} />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Section>
      </Dialog.Content>
    </Dialog.Root>
  )
}

/* ------------------------------------------------------------ page */

export default function ThemeBuilderPage() {
  const { state, everywhere } = useThemeBuilder()
  const { resolvedTheme, setTheme } = useTheme()
  const everywhereId = useId()

  // A shared link wins over what this browser remembered (before first paint).
  useLayoutEffect(() => {
    const fromUrl = stateFromQuery(window.location.search)
    if (fromUrl) setBuilderState(fromUrl)
  }, [])

  const query = stateToQuery(state)
  const link = `${window.location.origin}/theme${query ? `?${query}` : ''}`

  // Mirror the state into the URL (replace, so the back button isn't flooded).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.location.pathname === '/theme') {
        window.history.replaceState(null, '', `/theme${query ? `?${query}` : ''}`)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const rows = useContrastRows(`${query}|${resolvedTheme}`)
  const update = (patch: Partial<BuilderState>) => setBuilderState(patch)
  const activePreset = THEME_PRESETS.find((preset) => sameState(fromConfig(preset.config), state))
  const brandHue = parseColor(state.brand)?.h ?? 0
  const hueSwatch = (h: number) => `oklch(0.7 0.14 ${h})`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="scroll-m-20 text-3xl tracking-tight">Theme builder</h1>
          <p className="mt-2 max-w-2xl text-lg text-foreground-light">
            Pick colours, contrast, radius and fonts — the whole page updates as you go. When you're happy, take
            it as CSS or code.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="text"
            icon={<RotateCcw />}
            disabled={sameState(state, DEFAULT_STATE)}
            onClick={() => setBuilderState(DEFAULT_STATE)}
          >
            Reset
          </Button>
          <Button
            variant="default"
            icon={<Link2 />}
            onClick={() =>
              navigator.clipboard.writeText(link).then(() => toast.success('Link copied', { description: link }))
            }
          >
            Copy link
          </Button>
          <ExportDialog state={state} link={link} />
        </div>
      </div>

      <div role="group" aria-label="Presets" className="flex flex-wrap gap-2">
        {THEME_PRESETS.map((preset) => {
          const active = preset.id === activePreset?.id
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => setBuilderState(fromConfig(preset.config))}
              className={cn(
                'focus-ring inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm transition-colors',
                active
                  ? 'border-foreground-lighter bg-surface-200 text-foreground'
                  : 'text-foreground-light hover:border-foreground-muted hover:text-foreground'
              )}
            >
              <span aria-hidden="true" className="flex -space-x-1">
                <span className="h-3.5 w-3.5 rounded-full border border-background" style={{ background: preset.config.brand }} />
                <span className="h-3.5 w-3.5 rounded-full border border-background" style={{ background: preset.config.accent }} />
              </span>
              {preset.name}
              {active && <Check aria-hidden="true" className="h-3.5 w-3.5" />}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          aria-label="Theme settings"
          className="rounded-lg border bg-surface-75 p-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
        >
          <Section title="Colours">
            <ColorField
              label="Brand colour"
              description="Buttons, links, focus, first chart series."
              value={state.brand}
              onChange={(brand) => update({ brand })}
            />
            <ColorField
              label="Accent colour"
              description="Info colour and the second chart series."
              value={state.accent}
              onChange={(accent) => update({ accent })}
            />
          </Section>

          <Section title="Neutrals">
            <SliderField
              label="Tint"
              value={state.tint}
              min={0}
              max={1}
              step={0.05}
              format={(v) => (v === 0 ? 'Gray' : `${Math.round(v * 100)}%`)}
              onChange={(tint) => update({ tint })}
            />
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={`${everywhereId}-follow`}>Follow brand hue</Label>
              <Switch
                id={`${everywhereId}-follow`}
                checked={state.neutralHue === null}
                onCheckedChange={(follow) => update({ neutralHue: follow ? null : Math.round(brandHue) })}
              />
            </div>
            {state.neutralHue !== null && (
              <SliderField
                label="Neutral hue"
                value={state.neutralHue}
                min={0}
                max={360}
                format={(v) => `${Math.round(v)}°`}
                swatch={hueSwatch(state.neutralHue)}
                onChange={(neutralHue) => update({ neutralHue })}
              />
            )}
            <SliderField
              label="Contrast"
              value={state.contrast}
              min={0}
              max={1}
              step={0.05}
              format={(v) => (v === 0.5 ? 'Default' : `${Math.round(v * 100)}%`)}
              onChange={(contrast) => update({ contrast })}
            />
          </Section>

          <Section title="Status colours">
            <SliderField
              label="Warning hue"
              value={state.warningHue}
              min={40}
              max={110}
              format={(v) => `${Math.round(v)}°`}
              swatch={hueSwatch(state.warningHue)}
              onChange={(warningHue) => update({ warningHue })}
            />
            <SliderField
              label="Error hue"
              value={state.destructiveHue}
              min={0}
              max={50}
              format={(v) => `${Math.round(v)}°`}
              swatch={hueSwatch(state.destructiveHue)}
              onChange={(destructiveHue) => update({ destructiveHue })}
            />
          </Section>

          <Section title="Shape and type">
            <SliderField
              label="Corner radius"
              value={state.radius}
              min={0}
              max={16}
              format={(v) => `${v}px`}
              onChange={(radius) => update({ radius })}
            />
            <div className="flex flex-col gap-2">
              <Label id={`${everywhereId}-sans`}>Body font</Label>
              <Select
                aria-labelledby={`${everywhereId}-sans`}
                value={state.sans}
                onValueChange={(sans) => update({ sans })}
                options={SANS_FONTS.map((font) => ({ value: font.id, label: font.label }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label id={`${everywhereId}-mono`}>Code font</Label>
              <Select
                aria-labelledby={`${everywhereId}-mono`}
                value={state.mono}
                onValueChange={(mono) => update({ mono })}
                options={MONO_FONTS.map((font) => ({ value: font.id, label: font.label }))}
              />
            </div>
          </Section>

          <Section title="Contrast check">
            <ContrastPanel rows={rows} />
          </Section>

          <Section title="Site">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label htmlFor={everywhereId}>Apply across the site</Label>
                <p className="mt-1 text-xs text-foreground-lighter">Browse the component pages in this theme too.</p>
              </div>
              <Switch id={everywhereId} checked={everywhere} onCheckedChange={setApplyEverywhere} />
            </div>
          </Section>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground-light">Preview</p>
            <ToggleGroup
              type="single"
              variant="segmented"
              tone="outline"
              size="tiny"
              allowDeselect={false}
              aria-label="Preview mode"
              value={resolvedTheme}
              onValueChange={(mode: string) => mode && setTheme(mode as 'light' | 'dark')}
              items={[
                { value: 'light', label: 'Light', icon: <Sun aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" /> },
                { value: 'dark', label: 'Dark', icon: <Moon aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" /> },
              ]}
            />
          </div>
          <ThemePreview />
        </div>
      </div>
    </div>
  )
}
