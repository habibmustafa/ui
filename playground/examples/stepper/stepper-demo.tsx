import { useState } from 'react'

import { Button, Stepper } from '../../../src'

const steps = [
  { title: 'Account', description: 'Email and password' },
  { title: 'Project', description: 'Name and region' },
  { title: 'Plan', description: 'Free or Pro' },
  { title: 'Done' },
]

export default function StepperDemo() {
  const [active, setActive] = useState(1)

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <Stepper steps={steps} activeStep={active} onStepClick={setActive} />
      <div className="flex justify-center gap-2">
        <Button variant="default" disabled={active === 0} onClick={() => setActive((s) => s - 1)}>
          Back
        </Button>
        <Button disabled={active === steps.length} onClick={() => setActive((s) => s + 1)}>
          {active >= steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
