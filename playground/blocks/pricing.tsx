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
    <div className="flex w-full max-w-5xl flex-col items-center gap-8">
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

      <div className="grid w-full gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const price = billing === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly
          return (
            <section
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className={cn(
                'flex flex-col rounded-lg border bg-surface-75 p-6',
                plan.popular && 'border-brand-default shadow-sm'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 id={`plan-${plan.id}`} className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                {plan.popular && (
                  <Badge variant="success" className="normal-case">
                    Most popular
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-foreground-light">{plan.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tabular-nums text-foreground">${price}</span>
                <span className="text-sm text-foreground-lighter">per seat / month</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm text-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? 'primary' : 'default'} size="medium" block className="mt-8">
                {plan.monthly === 0 ? 'Start for free' : `Choose ${plan.name}`}
              </Button>
            </section>
          )
        })}
      </div>
    </div>
  )
}
