import { Gauge as GaugeIcon, Layers, ShieldCheck, Zap } from 'lucide-react'

import { Button, Marquee, Statistic } from '../../src'

const customers = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark', 'Wayne', 'Wonka']

const features = [
  { icon: <Zap />, title: 'Fast by default', text: 'Pages open in under a second, even on a slow phone.' },
  { icon: <ShieldCheck />, title: 'Private by design', text: 'Your data stays in your region and is encrypted at rest.' },
  { icon: <GaugeIcon />, title: 'Built to measure', text: 'See what each change did to your numbers within minutes.' },
]

export default function Landing() {
  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-500/40 bg-brand-default/15 text-brand-600">
            <Layers className="h-4 w-4" aria-hidden="true" />
          </span>
          Meridian
        </span>
        <nav aria-label="Main" className="hidden items-center gap-5 text-sm text-foreground-light sm:flex">
          <a href="#landing" className="focus-ring rounded-xs hover:text-foreground">Product</a>
          <a href="#landing" className="focus-ring rounded-xs hover:text-foreground">Pricing</a>
          <a href="#landing" className="focus-ring rounded-xs hover:text-foreground">Docs</a>
        </nav>
        <Button size="small">Sign in</Button>
      </header>

      <section className="flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
        <h3 className="max-w-xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          Know what your customers do, the moment they do it
        </h3>
        <p className="max-w-lg text-balance text-foreground-light">
          Meridian turns raw product events into answers your whole team can read, without writing a query.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="large">
            Start for free
          </Button>
          <Button size="large">Book a demo</Button>
        </div>
      </section>

      <section aria-label="Customers" className="border-y bg-surface-75 py-6">
        <p className="mb-4 text-center text-xs text-foreground-lighter">Used by teams at</p>
        <Marquee fade pauseOnHover duration={30} gap={40} aria-label="Customer names">
          {customers.map((name) => (
            <span key={name} className="text-lg font-semibold text-foreground-lighter">
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      <section aria-label="In numbers" className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex justify-center p-6">
          <Statistic title="Events processed each day" value={2.4} precision={1} locale="en-US" suffix="B" />
        </div>
        <div className="flex justify-center p-6">
          <Statistic title="Teams on Meridian" value={3200} locale="en-US" suffix="+" />
        </div>
        <div className="flex justify-center p-6">
          <Statistic title="Uptime over the last year" value={99.99} precision={2} locale="en-US" suffix="%" />
        </div>
      </section>

      <section aria-label="Features" className="grid gap-6 border-t px-6 py-10 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-lg border bg-surface-75 text-foreground-light [&_svg]:h-4 [&_svg]:w-4"
            >
              {feature.icon}
            </span>
            <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
            <p className="text-sm leading-relaxed text-foreground-light">{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
