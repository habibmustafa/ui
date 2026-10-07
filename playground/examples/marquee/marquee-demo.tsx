import { Marquee } from '../../../src'

const names = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark', 'Wayne', 'Wonka']

export default function MarqueeDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Marquee fade pauseOnHover duration={25} aria-label="Customers">
        {names.map((name) => (
          <span key={name} className="rounded-md border bg-surface-100 px-4 py-2 text-sm font-medium">
            {name}
          </span>
        ))}
      </Marquee>
      <Marquee fade reverse duration={35} gap={32} aria-label="Customers, reversed">
        {names.map((name) => (
          <span key={name} className="text-lg font-semibold text-foreground-lighter">
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  )
}
