import { BarChart3, Bell, FolderKanban } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { Button, Popover } from '../../src'

const STEPS = [
  { id: 'projects', title: 'Your projects', text: 'Everything you are working on lives here. Open one to see its tasks.' },
  { id: 'reports', title: 'Reports', text: 'See how the team is doing without asking anyone for a spreadsheet.' },
  { id: 'alerts', title: 'Alerts', text: 'We tell you here when something needs a decision from you.' },
]

export default function OnboardingTour() {
  // -1 means the tour is not showing. Only the buttons move the tour: when Next unmounts one tip
  // and opens the next, focus briefly leaves it, which would otherwise count as a dismissal.
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  const tip = (id: string, target: ReactElement) => {
    const index = STEPS.findIndex((item) => item.id === id)
    return (
      <Popover
        open={step === index}
        onOpenChange={(open) => !open && setStep(-1)}
        trigger={target}
        className="w-72 p-4"
        slotProps={{ content: { 'aria-label': `Tour step ${index + 1} of ${STEPS.length}`, onOpenAutoFocus: (event) => event.preventDefault(), onInteractOutside: (event) => event.preventDefault() } }}
        content={
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{STEPS[index].title}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground-light">{STEPS[index].text}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs tabular-nums text-foreground-lighter">
                {index + 1} of {STEPS.length}
              </span>
              <div className="flex gap-2">
                <Button size="tiny" variant="text" onClick={() => setStep(-1)}>
                  Skip
                </Button>
                {index > 0 && (
                  <Button size="tiny" onClick={() => setStep(index - 1)}>
                    Back
                  </Button>
                )}
                <Button size="tiny" variant="primary" onClick={() => setStep(index === STEPS.length - 1 ? -1 : index + 1)}>
                  {index === STEPS.length - 1 ? 'Done' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        }
      />
    )
  }

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <span className="text-sm font-semibold text-foreground">Acme Inc.</span>
        <nav aria-label="Main" className="flex items-center gap-2">
          {tip('projects', <Button size="small" variant="text" icon={<FolderKanban />}>Projects</Button>)}
          {tip('reports', <Button size="small" variant="text" icon={<BarChart3 />}>Reports</Button>)}
          {tip('alerts', <Button size="small" variant="text" icon={<Bell />} aria-label="Alerts" />)}
        </nav>
      </div>

      <div className="flex min-h-72 flex-col items-center justify-end gap-3 px-6 pb-12 pt-24 text-center">
        <p className="text-sm font-medium text-foreground" aria-live="polite">
          {current ? `Tour: step ${step + 1} of ${STEPS.length}` : 'You are all set.'}
        </p>
        <p className="max-w-sm text-sm text-foreground-light">
          {current ? 'The highlighted menu item explains itself. Use Next to keep going.' : 'You can start the tour again at any time.'}
        </p>
        {!current && <Button onClick={() => setStep(0)}>Take the tour again</Button>}
      </div>
    </div>
  )
}
