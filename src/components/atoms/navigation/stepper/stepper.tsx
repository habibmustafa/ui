import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Progress through a fixed sequence of steps. Rendered as an ordered list; the current
 * step carries aria-current="step" and each step's state is also spelled out for screen
 * readers ("completed", "current"). With `onStepClick`, completed steps become buttons so
 * a wizard can jump back; future steps are never clickable.
 */

export interface StepperStep {
  title: React.ReactNode
  description?: React.ReactNode
  /** Replaces the step number / check mark. */
  icon?: React.ReactNode
}

export type StepState = 'completed' | 'current' | 'upcoming'

export interface StepperClassNames {
  item?: string
  indicator?: string
  title?: string
  description?: string
  separator?: string
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  steps: readonly StepperStep[]
  /** Index of the current step (0-based). Steps before it are completed. Pass
   *  `steps.length` to show every step completed. @default 0 */
  activeStep?: number
  /** @default "horizontal" */
  orientation?: 'horizontal' | 'vertical'
  /** Makes completed steps clickable (e.g. to go back in a wizard). */
  onStepClick?: (index: number) => void
  /** Screen-reader text for step states. */
  stateLabels?: Partial<Record<StepState, string>>
  classNames?: StepperClassNames
}

const indicatorClasses: Record<StepState, string> = {
  completed: 'border-primary-solid bg-primary-solid text-white',
  current: 'border-brand-default bg-background text-foreground ring-2 ring-brand-default/30',
  upcoming: 'border-strong bg-surface-100 text-foreground-lighter',
}

const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    {
      steps,
      activeStep = 0,
      orientation = 'horizontal',
      onStepClick,
      stateLabels,
      className,
      classNames,
      'aria-label': ariaLabel = 'Progress',
      ...props
    },
    ref
  ) => {
    const labels = { completed: 'completed', current: 'current', upcoming: 'not started', ...stateLabels }
    const vertical = orientation === 'vertical'

    return (
      <ol
        ref={ref}
        aria-label={ariaLabel}
        data-orientation={orientation}
        className={cn('flex', vertical ? 'flex-col' : 'w-full items-start', className)}
        {...props}
      >
        {steps.map((step, index) => {
          const state: StepState =
            index < activeStep ? 'completed' : index === activeStep ? 'current' : 'upcoming'
          const isLast = index === steps.length - 1
          const clickable = onStepClick !== undefined && state === 'completed'

          const indicator = (
            <span
              aria-hidden="true"
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors',
                indicatorClasses[state],
                classNames?.indicator
              )}
            >
              {step.icon ?? (state === 'completed' ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1)}
            </span>
          )

          const text = (
            <span className={cn('flex min-w-0 flex-col', vertical ? 'pt-1' : 'mt-2 items-center text-center')}>
              <span
                className={cn(
                  'text-sm',
                  state === 'upcoming' ? 'text-foreground-lighter' : 'text-foreground',
                  classNames?.title
                )}
              >
                {step.title}
                <span className="sr-only">{` (${labels[state]})`}</span>
              </span>
              {step.description != null && (
                <span className={cn('mt-0.5 text-xs text-foreground-lighter', classNames?.description)}>
                  {step.description}
                </span>
              )}
            </span>
          )

          const content = (
            <>
              {indicator}
              {text}
            </>
          )
          const contentClass = cn(
            'group flex rounded-md',
            vertical ? 'items-start gap-3' : 'flex-col items-center',
            clickable && 'cursor-pointer focus-ring hover:opacity-80'
          )

          return (
            <li
              key={index}
              aria-current={state === 'current' ? 'step' : undefined}
              data-state={state}
              className={cn(
                'relative flex',
                vertical ? 'flex-col pb-6 last:pb-0' : 'flex-1 flex-col items-center',
                classNames?.item
              )}
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute transition-colors',
                    vertical
                      ? 'left-3.5 top-8 bottom-1 w-px -translate-x-1/2'
                      : 'top-3.5 left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] h-px',
                    state === 'completed' ? 'bg-brand-default' : 'bg-border-strong',
                    classNames?.separator
                  )}
                />
              )}
              {clickable ? (
                <button type="button" onClick={() => onStepClick(index)} className={contentClass}>
                  {content}
                </button>
              ) : (
                <div className={contentClass}>{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    )
  }
)
Stepper.displayName = 'Stepper'

export { Stepper }
