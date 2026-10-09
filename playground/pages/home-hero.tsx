import { ArrowRight, Check, ChevronDown, Layers, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Avatar, Badge, Button, Checkbox, Label, Progress, Slider, Tabs, THEME_PRESETS, cn, parseColor, toHex, useTheme } from '../../src'
import { COMPONENT_COUNT } from '../catalog'
import { ColorField } from '../color-field'
import { DISPLAY } from '../design'
import { gradeContrast, measureContrast } from '../hero-contrast'
import { InstallCommand } from '../install-command'
import { Link } from '../router'
import { DEFAULT_STATE, fromConfig, setBuilderState, stateToQuery, useThemeBuilder } from '../theme-store'

const RAMP = ['bg-brand-200', 'bg-brand-300', 'bg-brand-400', 'bg-brand-500', 'bg-brand-600', 'bg-brand-default']
const CHECKS = [
  { id: 'button', label: 'Button text' },
  { id: 'link', label: 'Link text' },
  { id: 'text', label: 'Body text' },
] as const
type Ratios = Partial<Record<(typeof CHECKS)[number]['id'], number | null>>

function ThemeInstrument() {
  const { state } = useThemeBuilder()
  const { resolvedTheme } = useTheme()
  const [ratios, setRatios] = useState<Ratios>({})
  const [expanded, setExpanded] = useState(false)
  const brand = parseColor(state.brand)
  const hue = Math.round(brand?.h ?? 158)
  const changed = JSON.stringify(state) !== JSON.stringify(DEFAULT_STATE)
  const query = stateToQuery(state)

  useEffect(() => {
    if (!expanded) return
    const timer = setTimeout(() => {
      const next: Ratios = {}
      for (const { id } of CHECKS) next[id] = measureContrast(document.querySelector('[data-contrast="' + id + '"]'))
      setRatios(next)
    }, 260)
    return () => clearTimeout(timer)
  }, [state, resolvedTheme, expanded])

  const setHue = (next: number) => {
    const base = brand ?? { l: 0.77, c: 0.16, h: 158 }
    setBuilderState({ brand: toHex({ l: base.l, c: base.c < 0.03 ? 0.14 : base.c, h: next }) })
  }

  return (
    <div className="mt-8 max-w-xl border-t pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Try your color</p>
          <p className="mt-1 text-xs text-foreground-lighter">The whole page follows along.</p>
        </div>
        <ul className="flex flex-wrap gap-1" aria-label="Start from a preset">
          {THEME_PRESETS.map((preset) => (
            <li key={preset.id}>
              <button
                type="button"
                aria-label={preset.name}
                aria-pressed={state.brand === preset.config.brand}
                title={preset.name}
                onClick={() => setBuilderState(fromConfig(preset.config))}
                className={cn('focus-ring flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors', state.brand === preset.config.brand ? 'border-foreground' : 'border-transparent hover:border-default')}
              >
                <span className="h-5 w-5 rounded-full border border-foreground/10" style={{ background: preset.config.brand }} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <details className="group mt-4" onToggle={(event) => setExpanded(event.currentTarget.open)}>
        <summary className="focus-ring flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-md text-xs text-foreground-light hover:text-foreground [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
          Fine-tune your theme
          <ChevronDown aria-hidden="true" className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 flex flex-col gap-5 rounded-xl border bg-surface-75 p-5">
          <ColorField label="Brand color" value={state.brand} onChange={(value) => setBuilderState({ brand: value })} />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <Label>Hue</Label>
              <span className="tabular-nums text-foreground-lighter">{hue}°</span>
            </div>
            <Slider min={0} max={360} step={1} value={[hue]} onValueChange={([next]) => setHue(next)} aria-label="Brand hue" />
          </div>
          <div className="flex overflow-hidden rounded-lg border" role="img" aria-label="Generated brand scale, steps 200 to 600 and the solid fill">
            {RAMP.map((color, index) => (
              <div key={color} className="flex-1">
                <div className={cn('h-9', color)} />
                <p className="py-1.5 text-center text-xs tabular-nums text-foreground-lighter">{index === 5 ? 'Fill' : (index + 2) * 100}</p>
              </div>
            ))}
          </div>
          <dl className="flex flex-col gap-2 text-xs" aria-label="Measured contrast">
            {CHECKS.map(({ id, label }) => {
              const ratio = ratios[id]
              const grade = ratio ? gradeContrast(ratio) : null
              return (
                <div key={id} className="flex items-center justify-between gap-3">
                  <dt className="text-foreground-light">{label}</dt>
                  <dd className="flex items-center gap-2">
                    <span className="tabular-nums">{ratio ? ratio.toFixed(1) + ':1' : '—'}</span>
                    {grade && <Badge variant={grade.tone}>{grade.label}</Badge>}
                  </dd>
                </div>
              )
            })}
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="small" iconRight={<ArrowRight />}>
              <Link to={'/theme' + (query ? '?' + query : '')}>Open theme builder</Link>
            </Button>
            {changed && <Button variant="text" size="small" icon={<RotateCcw />} onClick={() => setBuilderState(DEFAULT_STATE)}>Reset</Button>}
          </div>
        </div>
      </details>
    </div>
  )
}

const TEAM = [
  { name: 'Alex Morgan', initials: 'AM', role: 'Design lead' },
  { name: 'Sam Rivera', initials: 'SR', role: 'Frontend engineer' },
  { name: 'Jordan Lee', initials: 'JL', role: 'Product designer' },
]
const TASKS = ['Define the visual direction', 'Build the component library', 'Review the first prototype']
const ACTIVITY = [
  { initials: 'AM', title: 'Alex updated the design brief', time: '12 minutes ago' },
  { initials: 'SR', title: 'Sam published 8 components', time: '45 minutes ago' },
  { initials: 'JL', title: 'Jordan shared a new prototype', time: '2 hours ago' },
]

function Specimen() {
  const [completed, setCompleted] = useState([true, true, false])
  const [period, setPeriod] = useState('week')
  const done = 22 + completed.filter(Boolean).length
  const bars = period === 'week' ? [2, 4, 3, 5, 3, 4, done - 21] : [1, 2, 2, 3, 2, 3, 2]

  return (
    <div role="group" aria-label="Live preview: components using the generated theme" className="min-w-0 overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-surface-75 px-5 py-3">
        <span className="flex items-center gap-2 text-xs font-medium"><Layers aria-hidden="true" className="h-4 w-4 text-brand-600" /> Your product</span>
        <span className="flex items-center gap-1.5 text-xs text-foreground-lighter"><span className="h-1.5 w-1.5 rounded-full bg-brand-default" /> Live preview</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1.5 text-xs text-foreground-lighter">Project overview</p>
            <h2 className="text-xl font-semibold tracking-tight">Website redesign</h2>
          </div>
          <Badge variant="success" className="mt-1">In progress</Badge>
        </div>
        <Tabs.Root defaultValue="overview">
          <Tabs.List className="gap-5" aria-label="Project views">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            <Tabs.Trigger value="team">Team</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="overview" className="mt-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-foreground-light">Tasks completed</p>
                <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight">{done}<span className="ml-1 text-sm font-normal text-foreground-lighter">/ 32</span></p>
                <Progress value={done / 32 * 100} className="mt-3 h-1.5" aria-label="Project completion" />
              </div>
              <div className="border-l pl-5">
                <p className="text-xs text-foreground-light">Time tracked</p>
                <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight">{period === 'week' ? '38.5' : '32.0'}<span className="ml-1 text-sm font-normal text-foreground-lighter">hrs</span></p>
                <p className="mt-2 text-xs text-brand-600">On track for Friday</p>
              </div>
            </div>
            <figure className="mt-6 rounded-lg border bg-surface-75 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <figcaption className="text-xs font-medium">Completed tasks</figcaption>
                <select aria-label="Activity period" value={period} onChange={(event) => setPeriod(event.target.value)} className="focus-ring rounded-md border bg-background py-1 pl-2 pr-7 text-xs text-foreground-light">
                  <option value="week">This week</option>
                  <option value="previous">Last week</option>
                </select>
              </div>
              <div className="mt-4 grid h-28 grid-cols-7 items-end gap-3" role="img" aria-label={'Completed tasks, Monday to Sunday: ' + bars.join(', ')}>
                {bars.map((value, index) => (
                  <div key={index} className="flex h-full flex-col justify-end gap-2 text-center">
                    <div className={cn('mx-auto w-full max-w-9 rounded-t-sm transition-[height] motion-reduce:transition-none', index === 3 ? 'bg-brand-default' : 'bg-brand-400 dark:bg-brand-default/60')} style={{ height: value / 5 * 78 + '%' }} />
                    <span className="text-[10px] text-foreground-lighter">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
                  </div>
                ))}
              </div>
            </figure>
            <div className="mt-5 flex flex-col gap-3">
              <p className="text-xs font-medium text-foreground-light">This week's milestones</p>
              {TASKS.map((task, index) => (
                <label key={task} className="flex cursor-pointer items-center gap-3 text-sm">
                  <Checkbox checked={completed[index]} onCheckedChange={(checked) => setCompleted((previous) => previous.map((value, i) => i === index ? checked === true : value))} />
                  <span className={cn(completed[index] && 'text-foreground-lighter line-through')}>{task}</span>
                </label>
              ))}
            </div>
          </Tabs.Content>
          <Tabs.Content value="activity" className="min-h-80 pt-5">
            <p className="mb-5 text-sm text-foreground-light">The latest from your project.</p>
            <ul className="flex flex-col gap-6">
              {ACTIVITY.map((item) => (
                <li key={item.initials} className="flex items-center gap-3">
                  <Avatar fallback={item.initials} className="h-8 w-8 text-xs" />
                  <div><p className="text-sm">{item.title}</p><p className="mt-1 text-xs text-foreground-lighter">{item.time}</p></div>
                </li>
              ))}
            </ul>
            {completed[2] && <p className="mt-6 flex items-center gap-2 text-sm text-brand-600"><Check aria-hidden="true" className="h-4 w-4" /> You completed the prototype review.</p>}
          </Tabs.Content>
          <Tabs.Content value="team" className="min-h-80 pt-5">
            <p className="mb-5 text-sm text-foreground-light">Three people, one shared workspace.</p>
            <ul className="divide-y">
              {TEAM.map((member) => (
                <li key={member.initials} className="flex items-center gap-3 py-4 first:pt-0">
                  <Avatar fallback={member.initials} className="h-9 w-9 text-xs" />
                  <div className="flex-1"><p className="text-sm font-medium">{member.name}</p><p className="mt-1 text-xs text-foreground-lighter">{member.role}</p></div>
                  <span aria-label="Available" className="h-2 w-2 rounded-full bg-brand-default" />
                </li>
              ))}
            </ul>
          </Tabs.Content>
        </Tabs.Root>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-surface-75 px-5 py-3.5">
        <p data-contrast="text" className="text-xs text-foreground">Built with the same components you install.</p>
        <Link to="/blocks" data-contrast="link" className="focus-ring inline-flex items-center gap-1 rounded-sm text-xs font-medium text-brand-600">Explore blocks <ArrowRight aria-hidden="true" className="h-3 w-3" /></Link>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="grid items-center gap-10 pt-4 pb-14 sm:pt-8 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
      <div className="min-w-0">
        <p className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-foreground-lighter"><span className="h-1.5 w-1.5 rounded-full bg-brand-default" /> A foundation for your next idea</p>
        <h1 className={cn('max-w-xl text-balance text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl', DISPLAY)}>
          Your color.<br />Your components.<br /><span className="text-brand-600">Your next product.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-foreground-light sm:text-lg">
          {COMPONENT_COUNT} React components and ready-to-use screens. Give them your brand color and start building.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="medium" iconRight={<ArrowRight />} data-contrast="button"><Link to="/components">Browse components</Link></Button>
          <Button asChild variant="default" size="medium"><Link to="/getting-started">Get started</Link></Button>
        </div>
        <div className="mt-5 max-w-md"><InstallCommand packages="@habibmustafa/ui" className="w-full" /></div>
        <ThemeInstrument />
      </div>
      <Specimen />
    </section>
  )
}
