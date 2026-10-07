import { Check, Download, Link2, Moon, RotateCcw, Sun, Upload } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'

import {
  Badge,
  Button,
  Dialog,
  Input,
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
  toHex,
  toast,
  useTheme,
  type ThemeConfig,
} from '../../src'
import { CodeSnippet } from '../code-snippet'
import {
  DEFAULT_STATE,
  MONO_FONTS,
  PRESET_LABELS,
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

function ColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }
  const parsed = parseColor(value)
  const hex = parsed ? toHex(parsed) : '#000000'
  const invalid = draft !== value && !parseColor(draft)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${id}-text`}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label}: rəng seçici`}
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-[34px] w-10 shrink-0 cursor-pointer rounded-md border border-control bg-transparent p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <Input
          id={`${id}-text`}
          value={draft}
          aria-invalid={invalid || undefined}
          aria-describedby={`${id}-hint`}
          spellCheck={false}
          onChange={(event) => {
            setDraft(event.target.value)
            if (parseColor(event.target.value)) onChange(event.target.value.trim())
          }}
          onBlur={() => setDraft(value)}
          className="font-mono"
        />
      </div>
      <p id={`${id}-hint`} className={cn('text-xs', invalid ? 'text-destructive' : 'text-foreground-lighter')}>
        {invalid ? 'Tanınmayan rəng — HEX, rgb(), hsl() və ya oklch() yazın.' : description}
      </p>
    </div>
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
  { key: 'text', label: 'Əsas mətn' },
  { key: 'text-light', label: 'İkinci dərəcəli mətn' },
  { key: 'text-lighter', label: 'Köməkçi mətn' },
  { key: 'primary', label: 'Keçid (primary)' },
  { key: 'button', label: 'Əsas düymə' },
  { key: 'destructive', label: 'Xəta mətni' },
  { key: 'warning', label: 'Xəbərdarlıq mətni' },
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
      <ul className="flex flex-col gap-1.5" aria-label="Kontrast yoxlaması">
        {rows.map((row) => {
          const ratio = row.ratio
          const grade =
            ratio === null ? null : ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA böyük' : 'Zəif'
          return (
            <li key={row.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-foreground-light">{row.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {ratio === null ? '—' : `${ratio.toFixed(1)}:1`}
                </span>
                {grade && (
                  <Badge variant={grade === 'Zəif' ? 'destructive' : grade === 'AA böyük' ? 'warning' : 'success'}>
                    {grade}
                  </Badge>
                )}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-foreground-lighter">
        WCAG: adi mətn üçün AA ≥ 4,5:1, AAA ≥ 7:1; böyük mətn üçün 3:1 kifayətdir.
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
      if (!next) return setError('Linkdə tema parametrləri tapılmadı.')
    } else {
      try {
        const parsed: unknown = JSON.parse(input)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
        const config = parsed as ThemeConfig
        for (const key of ['brand', 'accent'] as const) {
          if (config[key] !== undefined && (typeof config[key] !== 'string' || !parseColor(config[key]))) {
            return setError(`"${key}" oxunan rəng deyil.`)
          }
        }
        next = fromConfig(config)
      } catch {
        return setError('JSON oxunmadı. Export-dakı JSON-u və ya builder linkini yapışdırın.')
      }
    }
    setBuilderState(next)
    toast.success('Tema idxal olundu')
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>JSON konfiq və ya builder linki</Label>
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
          Tətbiq et
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
          Export / İdxal
        </Button>
      </Dialog.Trigger>
      <Dialog.Content size="xlarge">
        <Dialog.Header>
          <Dialog.Title>Temanı layihəyə köçürün</Dialog.Title>
          <Dialog.Description>
            CSS faylı heç bir kod dəyişikliyi tələb etmir. Kod variantı temanı runtime-da dəyişməyə imkan verir.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Section>
          <Tabs.Root defaultValue="css">
            <Tabs.List className="gap-5">
              <Tabs.Trigger value="css">CSS</Tabs.Trigger>
              <Tabs.Trigger value="code">Kod</Tabs.Trigger>
              <Tabs.Trigger value="json">JSON</Tabs.Trigger>
              <Tabs.Trigger value="import">İdxal</Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Content value="css" className="flex flex-col gap-3">
              <CodeSnippet code={css} lang="css" maxHeight={340} />
              <div>
                <Button variant="default" icon={<Download />} onClick={() => download('theme.css', css, 'text/css')}>
                  theme.css yüklə
                </Button>
              </div>
            </Tabs.Content>
            <Tabs.Content value="code" className="flex flex-col gap-3">
              <p className="text-sm text-foreground-light">
                Eyni generator kitabxanada da var: konfiqi kodda saxlayın, lazım olanda dəyişin.
              </p>
              <CodeSnippet code={codeFile(config)} maxHeight={340} />
            </Tabs.Content>
            <Tabs.Content value="json" className="flex flex-col gap-3">
              <CodeSnippet code={json} maxHeight={340} />
              <div>
                <Button variant="default" icon={<Download />} onClick={() => download('theme.json', json, 'application/json')}>
                  theme.json yüklə
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
          <h1 className="scroll-m-20 text-3xl tracking-tight">Tema yaradıcısı</h1>
          <p className="mt-2 max-w-2xl text-lg text-foreground-light">
            Rəngi, kontrastı, radiusu və şrifti seçin — bütün səhifə dərhal yenilənir. Hazır olanda CSS və ya kod kimi
            götürün.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="text"
            icon={<RotateCcw />}
            disabled={sameState(state, DEFAULT_STATE)}
            onClick={() => setBuilderState(DEFAULT_STATE)}
          >
            Sıfırla
          </Button>
          <Button
            variant="default"
            icon={<Link2 />}
            onClick={() =>
              navigator.clipboard.writeText(link).then(() => toast.success('Link kopyalandı', { description: link }))
            }
          >
            Linki kopyala
          </Button>
          <ExportDialog state={state} link={link} />
        </div>
      </div>

      <div role="group" aria-label="Hazır temalar" className="flex flex-wrap gap-2">
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
              {PRESET_LABELS[preset.id] ?? preset.name}
              {active && <Check aria-hidden="true" className="h-3.5 w-3.5" />}
            </button>
          )
        })}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          aria-label="Tema parametrləri"
          className="rounded-lg border bg-surface-75 p-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
        >
          <Section title="Rənglər">
            <ColorField
              label="Brend rəngi"
              description="Düymələr, keçidlər, fokus, qrafikin 1-ci seriyası."
              value={state.brand}
              onChange={(brand) => update({ brand })}
            />
            <ColorField
              label="Vurğu rəngi"
              description="Info rəngi və qrafikin 2-ci seriyası."
              value={state.accent}
              onChange={(accent) => update({ accent })}
            />
          </Section>

          <Section title="Neytral rənglər">
            <SliderField
              label="Çalar"
              value={state.tint}
              min={0}
              max={1}
              step={0.05}
              format={(v) => (v === 0 ? 'Boz' : `${Math.round(v * 100)}%`)}
              onChange={(tint) => update({ tint })}
            />
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={`${everywhereId}-follow`}>Brendin tonunu izlə</Label>
              <Switch
                id={`${everywhereId}-follow`}
                checked={state.neutralHue === null}
                onCheckedChange={(follow) => update({ neutralHue: follow ? null : Math.round(brandHue) })}
              />
            </div>
            {state.neutralHue !== null && (
              <SliderField
                label="Neytral ton"
                value={state.neutralHue}
                min={0}
                max={360}
                format={(v) => `${Math.round(v)}°`}
                swatch={hueSwatch(state.neutralHue)}
                onChange={(neutralHue) => update({ neutralHue })}
              />
            )}
            <SliderField
              label="Kontrast"
              value={state.contrast}
              min={0}
              max={1}
              step={0.05}
              format={(v) => (v === 0.5 ? 'Standart' : `${Math.round(v * 100)}%`)}
              onChange={(contrast) => update({ contrast })}
            />
          </Section>

          <Section title="Status rəngləri">
            <SliderField
              label="Xəbərdarlıq tonu"
              value={state.warningHue}
              min={40}
              max={110}
              format={(v) => `${Math.round(v)}°`}
              swatch={hueSwatch(state.warningHue)}
              onChange={(warningHue) => update({ warningHue })}
            />
            <SliderField
              label="Xəta tonu"
              value={state.destructiveHue}
              min={0}
              max={50}
              format={(v) => `${Math.round(v)}°`}
              swatch={hueSwatch(state.destructiveHue)}
              onChange={(destructiveHue) => update({ destructiveHue })}
            />
          </Section>

          <Section title="Forma və şrift">
            <SliderField
              label="Künc radiusu"
              value={state.radius}
              min={0}
              max={16}
              format={(v) => `${v}px`}
              onChange={(radius) => update({ radius })}
            />
            <div className="flex flex-col gap-2">
              <Label id={`${everywhereId}-sans`}>Əsas şrift</Label>
              <Select
                aria-labelledby={`${everywhereId}-sans`}
                value={state.sans}
                onValueChange={(sans) => update({ sans })}
                options={SANS_FONTS.map((font) => ({ value: font.id, label: font.label }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label id={`${everywhereId}-mono`}>Kod şrifti</Label>
              <Select
                aria-labelledby={`${everywhereId}-mono`}
                value={state.mono}
                onValueChange={(mono) => update({ mono })}
                options={MONO_FONTS.map((font) => ({ value: font.id, label: font.label }))}
              />
            </div>
          </Section>

          <Section title="Kontrast yoxlaması">
            <ContrastPanel rows={rows} />
          </Section>

          <Section title="Sayt">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label htmlFor={everywhereId}>Bütün saytda tətbiq et</Label>
                <p className="mt-1 text-xs text-foreground-lighter">Komponent səhifələrini də bu temada gəzin.</p>
              </div>
              <Switch id={everywhereId} checked={everywhere} onCheckedChange={setApplyEverywhere} />
            </div>
          </Section>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground-light">Önizləmə</p>
            <ToggleGroup
              type="single"
              variant="segmented"
              tone="outline"
              size="tiny"
              allowDeselect={false}
              aria-label="Önizləmə rejimi"
              value={resolvedTheme}
              onValueChange={(mode: string) => mode && setTheme(mode as 'light' | 'dark')}
              items={[
                { value: 'light', label: 'Açıq', icon: <Sun aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" /> },
                { value: 'dark', label: 'Tünd', icon: <Moon aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" /> },
              ]}
            />
          </div>
          <ThemePreview />
        </div>
      </div>
    </div>
  )
}
