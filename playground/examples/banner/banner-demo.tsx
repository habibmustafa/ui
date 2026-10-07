import { AlertTriangle, Info, Sparkles } from 'lucide-react'

import { Banner, Button } from '../../../src'

export default function BannerDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Banner icon={<Info />} title="Scheduled maintenance" dismissible>
        Database upgrades on Oct 12, 02:00–03:00 UTC.
      </Banner>
      <Banner
        variant="brand"
        icon={<Sparkles />}
        title="Branching is here"
        action={
          <Button variant="default" size="tiny">
            Learn more
          </Button>
        }
      >
        Preview every pull request on its own database.
      </Banner>
      <Banner variant="warning" icon={<AlertTriangle />} title="Usage at 90%" dismissible>
        Upgrade before your project is paused.
      </Banner>
      <Banner variant="destructive" icon={<AlertTriangle />} title="Payment failed">
        Update your card to keep your projects running.
      </Banner>
    </div>
  )
}
