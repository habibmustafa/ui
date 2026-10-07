import { ArrowRight, BookOpen, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Alert,
  Badge,
  Button,
  Checkbox,
  CircularProgress,
  Gauge,
  Label,
  Rating,
  Slider,
  Statistic,
  Switch,
  Tabs,
  THEME_PRESETS,
  cn,
  parseColor,
  toHex,
  useTheme,
} from '../../src'
import { COMPONENT_COUNT } from '../catalog'
import { ColorField } from '../color-field'
import { gradeContrast, measureContrast } from '../hero-contrast'
import { InstallCommand } from '../install-command'
import { Link } from '../router'
import { DEFAULT_STATE, fromConfig, setBuilderState, stateToQuery, useThemeBuilder } from '../theme-store'

/*
 * The landing page's one loud element: a live theme. The brand colour (and hue) written
 * here goes through the same store as the theme builder, app.tsx renders it with the
 * library's own <ThemeStyle>, and everything on the page — the specimen beside it, the
 * sections below, dark mode — regenerates. The contrast figures are measured from the
 * rendered elements, so they are what a visitor's eyes actually get.
 */

/** Archivo with the width axis opened up: the site's display voice, headings only. */
export const DISPLAY =
  "[font-family:Archivo,Inter,system-ui,sans-serif] [font-variation-settings:'wdth'_116] tracking-[-0.02em]"

const RAMP = [
  { id: '200', className: 'bg-brand-200' },
  { id: '300', className: 'bg-brand-300' },
  { id: '400', className: 'bg-brand-400' },
  { id: '500', className: 'bg-brand-500' },
  { id: '600', className: 'bg-brand-600' },
  { id: 'fill', className: 'bg-brand-default' },
] as const

const CHECKS = [
  { id: 'button', label: 'Button text on the brand fill' },
  { id: 'link', label: 'Brand-coloured link on the page' },
  { id: 'text', label: 'Body text on the page' },
] as const

type Ratios = Partial<Record<(typeof CHECKS)[number]['id'], number | null>>

function ThemeInstrument() {
  const { state } = useThemeBuilder()
  const { resolvedTheme } = useTheme()
  const [ratios, setRatios] = useState<Ratios>({})

  const brand = parseColor(state.brand)
  const hue = Math.round(brand?.h ?? 158)
  const changed = JSON.stringify(state) !== JSON.stringify(DEFAULT_STATE)

  // Measure after the new tokens have painted.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const next: Ratios = {}
      for (const { id } of CHECKS) {
        next[id] = measureContrast(document.querySelector(`[data-contrast="${id}"]`))
      }
      setRatios(next)
    })
    return () => cancelAnimationFrame(frame)
  }, [state, resolvedTheme])

  const setHue = (next: number) => {
    // Keep the current lightness and chroma so only the hue moves; a grey brand gets a
    // sensible chroma instead of staying grey.
    const base = brand ?? { l: 0.77, c: 0.16, h: 158 }
    setBuilderState({ brand: toHex({ l: base.l, c: base.c < 0.03 ? 0.14 : base.c, h: next }) })
  }

  return (
    <div className="mt-10 flex max-w-xl flex-col gap-5 border-t pt-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <ColorField
          label="Brand colour"
          value={state.brand}
          onChange={(brandColor) => setBuilderState({ brand: brandColor })}
          className="sm:w-56"
        />
        <ul className="flex items-center gap-2 pb-1" aria-label="Start from a preset">
          {THEME_PRESETS.map((preset) => (
            <li key={preset.id}>
              <button
                type="button"
                aria-label={preset.name}
                aria-pressed={state.brand === preset.config.brand}
                title={preset.name}
                onClick={() => setBuilderState(fromConfig(preset.config))}
                className={cn(
                  'focus-ring h-6 w-6 cursor-pointer rounded-full border-2 transition-transform hover:scale-110',
                  state.brand === preset.config.brand ? 'border-foreground' : 'border-background ring-1 ring-border'
                )}
                style={{ background: preset.config.brand }}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-sm">
          <Label>Hue</Label>
          <span className="tabular-nums text-foreground-lighter">{hue}°</span>
        </div>
        <Slider min={0} max={360} step={1} value={[hue]} onValueChange={([next]) => setHue(next)} aria-label="Brand hue" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-foreground-light">The scale it generates</p>
        <div className="flex overflow-hidden rounded-md border" role="img" aria-label="Generated brand scale, steps 200 to 600 and the solid fill">
          {RAMP.map((step) => (
            <div key={step.id} className="flex-1">
              <div className={cn('h-9', step.className)} />
              <p className="py-1 text-center text-xs tabular-nums text-foreground-lighter">{step.id}</p>
            </div>
          ))}
        </div>
      </div>

      <dl className="flex flex-col gap-1.5 text-sm" aria-label="Measured contrast">
        {CHECKS.map(({ id, label }) => {
          const ratio = ratios[id]
          const grade = ratio ? gradeContrast(ratio) : null
          return (
            <div key={id} className="flex items-center justify-between gap-3">
              <dt className="text-foreground-light">{label}</dt>
              <dd className="flex items-center gap-2">
                <span className="tabular-nums text-foreground">{ratio ? `${ratio.toFixed(1)}:1` : '…'}</span>
                {grade && (
                  <Badge variant={grade.tone} className="min-w-12 justify-center">
                    {grade.label}
                  </Badge>
                )}
              </dd>
            </div>
          )
        })}
      </dl>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Button asChild variant="default" size="small" iconRight={<ArrowRight />}>
          <Link to={`/theme${stateToQuery(state) ? `?${stateToQuery(state)}` : ''}`}>Take it to the theme builder</Link>
        </Button>
        {changed && (
          <Button variant="text" size="small" icon={<RotateCcw />} onClick={() => setBuilderState(DEFAULT_STATE)}>
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}

const QUOTA_STEPS = [
  { from: 0, tone: 'success' },
  { from: 60, tone: 'warning' },
  { from: 85, tone: 'destructive' },
] as const

/** Real components, the way an app would use them, all reading the generated tokens. */
function Specimen() {
  const [quota, setQuota] = useState(72)
  const [twoFactor, setTwoFactor] = useState(true)
  const [digest, setDigest] = useState(true)

  return (
    <div
      role="group"
      aria-label="Live preview: components using the generated theme"
      className="min-w-0 rounded-xl border bg-surface-75 p-5 shadow-sm sm:p-6 lg:sticky lg:top-20"
    >
      <Tabs
        items={[
          { value: 'overview', label: 'Overview', content: null },
          { value: 'billing', label: 'Billing', content: null },
          { value: 'team', label: 'Team', content: null },
        ]}
      />

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="flex flex-col items-start gap-2">
          <Statistic title="Monthly revenue" value={48290} prefix="$" animated />
          <Badge variant="success" className="normal-case">+12.4% on last month</Badge>
        </div>
        <Gauge
          value={quota}
          thresholds={QUOTA_STEPS}
          size={132}
          label="Quota used"
          formatValue={(value) => `${value}%`}
          aria-label="Quota used"
        />
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <Label className="text-foreground-light">Move the quota</Label>
        <Slider min={0} max={100} value={[quota]} onValueChange={([next]) => setQuota(next)} aria-label="Quota used" />
      </div>

      <div className="mt-6 flex items-center gap-5">
        <CircularProgress value={64} showValue size={56} thickness={5} aria-label="Setup progress" />
        <div className="flex flex-col gap-1">
          <p data-contrast="text" className="text-sm text-foreground">
            Setup is 64% done
          </p>
          <Rating defaultValue={4} size="small" aria-label="Rate this project" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          Two-factor sign-in
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <Checkbox checked={digest} onCheckedChange={(next) => setDigest(next === true)} />
          Weekly digest
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="primary" size="small" data-contrast="button">
          Save changes
        </Button>
        <Button variant="default" size="small">
          Cancel
        </Button>
        <Button variant="danger" size="small">
          Delete project
        </Button>
      </div>

      <Alert
        className="mt-6"
        title="Release 2.4 is ready"
        description={
          <>
            Read the{' '}
            <span data-contrast="link" className="text-brand-600 underline underline-offset-2">
              release notes
            </span>{' '}
            before you update.
          </>
        }
      />
    </div>
  )
}

export function Hero() {
  return (
    <section className="grid items-start gap-12 pt-6 pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
      <div className="min-w-0">
        <h1 className={cn('max-w-xl text-balance text-4xl font-bold leading-[1.04] text-foreground sm:text-5xl', DISPLAY)}>
          <span className="block">One brand colour in.</span>
          <span className="block">A complete, accessible theme out.</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-foreground-light">
          Pick a colour and this page, all {COMPONENT_COUNT} components and their dark mode are regenerated in OKLCH,
          with contrast checked.
        </p>

        <div className="mt-7 flex max-w-xl flex-col gap-4">
          <InstallCommand packages="@habibmustafa/ui" className="w-full" />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="primary" size="medium" icon={<BookOpen />}>
              <Link to="/components">Browse components</Link>
            </Button>
            <Button asChild variant="default" size="medium">
              <Link to="/getting-started">Get started</Link>
            </Button>
          </div>
        </div>

        <ThemeInstrument />
      </div>

      <Specimen />
    </section>
  )
}
