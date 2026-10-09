import { Code2, Rocket } from 'lucide-react'
import { useId, useState } from 'react'

import { Button, Combobox, Descriptions, Input, Label, RadioGroupCard, Result, Slider } from '../../src'

const REGIONS = [
  { value: 'eu-central', label: 'Frankfurt' },
  { value: 'eu-west', label: 'Dublin' },
  { value: 'us-east', label: 'Virginia' },
  { value: 'ap-south', label: 'Singapore' },
]

const MEMORY = [1, 2, 4, 8, 16]
const PRICE_PER_GB = 6
const PRODUCTION_FEE = 10

export default function CreateProject() {
  const sizeId = useId()
  const [name, setName] = useState('')
  const [region, setRegion] = useState<string | null>('eu-central')
  const [mode, setMode] = useState('development')
  const [step, setStep] = useState(2)
  const [created, setCreated] = useState(false)

  const memory = MEMORY[step]
  const price = memory * PRICE_PER_GB + (mode === 'production' ? PRODUCTION_FEE : 0)
  const ready = name.trim() !== '' && region !== null

  if (created) {
    return (
      <div className="w-full max-w-xl rounded-xl border bg-surface-100 p-8 shadow-sm">
        <Result
          status="success"
          size="small"
          level={3}
          title={`${name.trim()} is being created`}
          description="It takes about a minute. We will email you when it is ready."
          extra={<Button onClick={() => setCreated(false)}>Create another</Button>}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Create a project</h3>
        <p className="mt-0.5 text-sm text-foreground-light">Pick a name, a place and how much power it needs.</p>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input id="project-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="billing-api" autoComplete="off" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="project-region">Region</Label>
          <Combobox
            id="project-region"
            options={REGIONS}
            value={region}
            onValueChange={setRegion}
            placeholder="Choose a region"
            searchPlaceholder="Search regions"
          />
          <p className="text-xs text-foreground-lighter">Pick the one closest to your users. You cannot change it later.</p>
        </div>

        <div className="flex flex-col gap-2">
          <span id="project-mode" className="text-sm font-medium text-foreground">
            Environment
          </span>
          <RadioGroupCard
            aria-labelledby="project-mode"
            value={mode}
            onValueChange={setMode}
            className="grid gap-3 sm:grid-cols-2"
            classNames={{
              item: 'w-full rounded-lg bg-surface-75 p-4 data-[state=checked]:border-brand-default data-[state=checked]:bg-brand-default/5 data-[state=checked]:ring-1 data-[state=checked]:ring-brand-default',
            }}
            options={[
              {
                value: 'development',
                label: (
                  <span className="flex flex-col gap-1 text-left">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground [&_svg]:h-4 [&_svg]:w-4">
                      <Code2 aria-hidden="true" />
                      Development
                    </span>
                    <span className="text-xs text-foreground-light">For trying things. It may pause when idle.</span>
                  </span>
                ),
              },
              {
                value: 'production',
                label: (
                  <span className="flex flex-col gap-1 text-left">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground [&_svg]:h-4 [&_svg]:w-4">
                      <Rocket aria-hidden="true" />
                      Production
                    </span>
                    <span className="text-xs text-foreground-light">Always on, with daily backups.</span>
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-sm">
            <span id={sizeId} className="font-medium text-foreground">
              Memory
            </span>
            <span className="tabular-nums text-foreground">{memory} GB</span>
          </div>
          <Slider value={[step]} onValueChange={([next]) => setStep(next)} min={0} max={MEMORY.length - 1} step={1} aria-labelledby={sizeId} />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t bg-surface-75 px-6 py-4">
        <Descriptions
          columns={1}
          classNames={{ item: 'justify-between', value: 'text-right tabular-nums' }}
          items={[
            { label: `${memory} GB of memory`, value: `$${memory * PRICE_PER_GB}` },
            { label: 'Production fee', value: mode === 'production' ? `$${PRODUCTION_FEE}` : 'None' },
            { label: <span className="font-medium text-foreground">Per month</span>, value: <span className="font-semibold text-foreground">${price}</span> },
          ]}
        />
        <Button variant="primary" size="medium" block disabled={!ready} onClick={() => setCreated(true)}>
          Create project
        </Button>
      </div>
    </div>
  )
}
