import { MapPin } from 'lucide-react'
import { useState } from 'react'

import { Avatar, Badge, Button, Statistic, Tabs } from '../../src'

const activity = [
  { text: 'Merged “Fix the invoice rounding bug”', when: '2 hours ago' },
  { text: 'Commented on “Review the new onboarding”', when: 'Yesterday' },
  { text: 'Opened “Migrate the billing tables”', when: 'Sep 27' },
]

const projects = [
  { name: 'Billing API', note: 'Invoices, retries and tax', status: 'Live' },
  { name: 'Design tokens', note: 'Color and spacing for every app', status: 'Live' },
  { name: 'Mobile app', note: 'Rewrite in progress', status: 'In review' },
]

export default function Profile() {
  const [following, setFollowing] = useState(false)

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div aria-hidden="true" className="h-28 bg-gradient-to-r from-brand-default/25 via-brand-default/10 to-surface-200" />

      <div className="flex flex-wrap items-end justify-between gap-4 px-6">
        <span className="-mt-10 rounded-full bg-surface-100 p-1">
          <Avatar fallback="AL" className="h-20 w-20 text-2xl font-medium" />
        </span>
        <Button variant={following ? 'default' : 'primary'} aria-pressed={following} onClick={() => setFollowing((current) => !current)}>
          {following ? 'Following' : 'Follow'}
        </Button>
      </div>

      <div className="px-6 pt-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Ada Lovelace</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground-light">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          London, Staff engineer
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-light">
          Writes about analytical engines and keeps the billing platform running. Happy to review anything that touches money.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x border-y">
        <div className="px-6 py-4">
          <Statistic title="Followers" value={1284} locale="en-US" />
        </div>
        <div className="px-6 py-4">
          <Statistic title="Projects" value={14} locale="en-US" />
        </div>
        <div className="px-6 py-4">
          <Statistic title="Reviews" value={392} locale="en-US" />
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <Tabs
          classNames={{ list: 'w-fit gap-6', trigger: 'flex-none px-0' }}
          items={[
            {
              value: 'activity',
              label: 'Activity',
              content: (
                <ul className="mt-4 divide-y rounded-lg border">
                  {activity.map((item) => (
                    <li key={item.text} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="text-foreground">{item.text}</span>
                      <span className="shrink-0 text-xs text-foreground-lighter">{item.when}</span>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              value: 'projects',
              label: 'Projects',
              content: (
                <ul className="mt-4 divide-y rounded-lg border">
                  {projects.map((project) => (
                    <li key={project.name} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-foreground-lighter">{project.note}</p>
                      </div>
                      <Badge
                        variant={project.status === 'Live' ? 'success' : 'default'}
                        className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal"
                      >
                        {project.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              value: 'about',
              label: 'About',
              content: (
                <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-foreground-lighter">Joined</dt>
                    <dd className="text-foreground">March 2023</dd>
                  </div>
                  <div>
                    <dt className="text-foreground-lighter">Works with</dt>
                    <dd className="text-foreground">Billing, Platform</dd>
                  </div>
                  <div>
                    <dt className="text-foreground-lighter">Languages</dt>
                    <dd className="text-foreground">English, French</dd>
                  </div>
                  <div>
                    <dt className="text-foreground-lighter">Email</dt>
                    <dd className="text-foreground">ada@example.com</dd>
                  </div>
                </dl>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
