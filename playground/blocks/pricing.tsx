import { Check } from 'lucide-react'
import { useState } from 'react'

import { Badge, Button, ToggleGroup, cn } from '../../src'

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    blurb: 'For trying things out.',
    features: ['1 project', '3 members', '500 MB storage'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 12,
    blurb: 'For a team that ships every week.',
    features: ['Unlimited projects', '10 members', '100 GB storage', 'Daily backups'],
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 29,
    blurb: 'For larger groups with compliance needs.',
    features: ['Everything in Pro', 'Unlimited members', 'Single sign-on', 'Audit log'],
  },
]

export default function Pricing() {
  const [billing, setBilling] = useState('yearly')

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">Pick a plan that fits your team</h3>
          <p className="mt-1.5 text-sm text-foreground-light">You pay per seat, and you can change or cancel at any time.</p>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Billing period"
          value={billing}
          onValueChange={(value: string) => value && setBilling(value)}
          items={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly, save 20%' },
          ]}
        />
      </div>

      <div className="grid w-full items-stretch gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const price = billing === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly
          return (
            <section
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className={cn(
                'flex flex-col rounded-xl border bg-surface-100 p-6 shadow-sm',
                plan.popular && 'border-brand-default bg-brand-default/5 shadow-lg ring-1 ring-brand-default'
              )}
            >
              <div className="flex h-6 items-center justify-between gap-2">
                <h4 id={`plan-${plan.id}`} className="text-base font-semibold text-foreground">
                  {plan.name}
                </h4>
                {plan.popular && (
                  <Badge variant="success" className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal">
                    Most popular
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-foreground-light">{plan.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">${price}</span>
                <span className="text-sm text-foreground-lighter">{plan.monthly === 0 ? 'forever' : 'per seat / month'}</span>
              </p>
              <Button variant={plan.popular ? 'primary' : 'default'} size="medium" block className="mt-6">
                {plan.monthly === 0 ? 'Start for free' : `Choose ${plan.name}`}
              </Button>
              <ul className="mt-6 flex flex-1 flex-col gap-3 border-t pt-6 text-sm text-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
