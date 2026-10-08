import { Building2, User, Users } from 'lucide-react'
import { useState } from 'react'

import { Button, Input, Label, RadioGroupCard, Result, Stepper } from '../../src'

const steps = [
  { title: 'Workspace', description: 'Give it a name' },
  { title: 'Team', description: 'How many of you' },
  { title: 'Ready' },
]

const sizes = [
  { value: 'solo', label: 'Just me', note: 'A personal workspace to start with.', icon: <User /> },
  { value: 'small', label: '2 to 10 people', note: 'A small team that works closely together.', icon: <Users /> },
  { value: 'large', label: 'More than 10', note: 'Several teams that need their own spaces.', icon: <Building2 /> },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [workspace, setWorkspace] = useState('')
  const [size, setSize] = useState('small')
  const finished = step === steps.length - 1

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <Stepper steps={steps} activeStep={finished ? steps.length : step} onStepClick={setStep} aria-label="Setup progress" />
      </div>

      <div className="px-6 py-8">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">Name your workspace</h3>
              <p className="mt-1 text-sm text-foreground-light">Your projects and teammates will live here.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="onboarding-workspace">Workspace name</Label>
              <Input
                id="onboarding-workspace"
                value={workspace}
                onChange={(event) => setWorkspace(event.target.value)}
                placeholder="Acme Inc."
                autoComplete="organization"
                size="medium"
              />
              <p className="text-xs text-foreground-lighter">You can rename it later in settings.</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 id="onboarding-size" className="text-xl font-semibold tracking-tight text-foreground">
                How big is your team?
              </h3>
              <p className="mt-1 text-sm text-foreground-light">We use this to suggest a starting plan.</p>
            </div>
            <RadioGroupCard
              aria-labelledby="onboarding-size"
              value={size}
              onValueChange={setSize}
              classNames={{
                item: 'w-full rounded-lg bg-surface-75 p-4 data-[state=checked]:border-brand-default data-[state=checked]:bg-brand-default/5 data-[state=checked]:ring-1 data-[state=checked]:ring-brand-default',
              }}
              options={sizes.map((item) => ({
                value: item.value,
                label: (
                  <span className="flex items-center gap-3 text-left">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-surface-100 text-foreground-light [&_svg]:h-4 [&_svg]:w-4"
                    >
                      {item.icon}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-foreground-light">{item.note}</span>
                    </span>
                  </span>
                ),
              }))}
            />
          </div>
        )}

        {finished && (
          <Result
            status="success"
            size="small"
            level={3}
            title={workspace ? `${workspace} is ready` : 'You are all set'}
            description="Invite your team or start with an empty project."
            extra={<Button variant="primary">Open the dashboard</Button>}
          />
        )}
      </div>

      {!finished && (
        <div className="flex items-center justify-between border-t bg-surface-75 px-6 py-3.5">
          <Button disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
            Back
          </Button>
          <span className="text-xs tabular-nums text-foreground-lighter">
            Step {step + 1} of {steps.length - 1}
          </span>
          <Button variant="primary" disabled={step === 0 && workspace.trim() === ''} onClick={() => setStep((current) => current + 1)}>
            {step === steps.length - 2 ? 'Finish setup' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  )
}
