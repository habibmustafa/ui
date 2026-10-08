import { useState } from 'react'

import { Button, Input, Label, RadioGroup, Result, Stepper } from '../../src'

const steps = [
  { title: 'Workspace', description: 'Give it a name' },
  { title: 'Team', description: 'How many of you' },
  { title: 'Ready' },
]

const sizes = [
  { value: 'solo', label: 'Just me' },
  { value: 'small', label: '2 to 10 people' },
  { value: 'large', label: 'More than 10' },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [workspace, setWorkspace] = useState('')
  const [size, setSize] = useState('small')
  const finished = step === steps.length - 1

  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <Stepper steps={steps} activeStep={finished ? steps.length : step} onStepClick={setStep} aria-label="Setup progress" />

      {step === 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-workspace">Workspace name</Label>
          <Input
            id="onboarding-workspace"
            value={workspace}
            onChange={(event) => setWorkspace(event.target.value)}
            placeholder="Acme Inc."
            autoComplete="organization"
          />
          <p className="text-xs text-foreground-lighter">You can rename it later in settings.</p>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <p id="onboarding-size" className="text-sm font-medium text-foreground">
            How big is your team?
          </p>
          <RadioGroup aria-labelledby="onboarding-size" value={size} onValueChange={setSize} options={sizes} />
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

      {!finished && (
        <div className="flex justify-between border-t pt-5">
          <Button disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
            Back
          </Button>
          <Button variant="primary" disabled={step === 0 && workspace.trim() === ''} onClick={() => setStep((current) => current + 1)}>
            {step === steps.length - 2 ? 'Finish setup' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  )
}
