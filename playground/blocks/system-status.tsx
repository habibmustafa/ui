import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { Alert, Badge, CircularProgress, Gauge, Switch } from '../../src'

interface Service {
  id: string
  name: string
  uptime: number
}

const services: Service[] = [
  { id: 'api', name: 'API', uptime: 99.98 },
  { id: 'dashboard', name: 'Dashboard', uptime: 99.99 },
  { id: 'webhooks', name: 'Webhooks', uptime: 99.91 },
  { id: 'database', name: 'Database', uptime: 100 },
]

/** 30 days per service; with an incident, the API had a bad last day. */
const history = (service: Service, incident: boolean) =>
  Array.from({ length: 30 }, (_, day) => {
    if (service.id === 'api' && incident && day === 29) return 'down'
    if (service.id === 'webhooks' && (day === 8 || day === 21)) return 'slow'
    return 'up'
  })

const TONE = { up: 'bg-brand-default', slow: 'bg-warning', down: 'bg-destructive' } as const
const WORD = { up: 'operational', slow: 'slow', down: 'down' } as const

export default function SystemStatus() {
  const [incident, setIncident] = useState(false)
  const overall = incident ? 99.71 : 99.97

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">System status</h3>
          <p className="mt-0.5 text-sm text-foreground-light">What is running, and how it did over the last 30 days.</p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-foreground-light">
          <Switch checked={incident} onCheckedChange={setIncident} />
          Simulate an incident
        </label>
      </div>

      <div className="px-6 pt-6">
        {incident ? (
          <Alert
            variant="destructive"
            icon={<TriangleAlert />}
            title="The API is not answering"
            description="Some requests fail. We are looking into it and will post an update within 15 minutes."
          />
        ) : (
          <Alert icon={<CircleCheck />} title="All systems operational" description="Nothing is wrong right now." />
        )}
      </div>

      <div className="grid gap-6 border-b px-6 py-6 sm:grid-cols-2">
        <div className="flex items-center gap-4">
          <CircularProgress value={overall} size={72} thickness={6} tone={incident ? 'warning' : 'success'} aria-label="Overall uptime">
            <span className="text-sm font-medium tabular-nums">{overall}%</span>
          </CircularProgress>
          <div>
            <p className="text-sm font-medium text-foreground">Uptime, 30 days</p>
            <p className="text-xs text-foreground-lighter">Across every service.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Gauge value={incident ? 640 : 120} min={0} max={1000} size={112} formatValue={(value) => `${value} ms`} aria-label="Median response time" />
          <div>
            <p className="text-sm font-medium text-foreground">Median response</p>
            <p className="text-xs text-foreground-lighter">Lower is better.</p>
          </div>
        </div>
      </div>

      <ul className="divide-y" aria-label="Services">
        {services.map((service) => {
          const days = history(service, incident)
          const state = service.id === 'api' && incident ? 'down' : 'up'
          return (
            <li key={service.id} className="flex flex-col gap-3 px-6 py-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{service.name}</span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-foreground-light">
                    {service.id === 'api' && incident ? 99.71 : service.uptime}%
                  </span>
                  <Badge
                    variant={state === 'up' ? 'success' : 'destructive'}
                    className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal"
                  >
                    {state === 'up' ? 'Operational' : 'Down'}
                  </Badge>
                </span>
              </div>
              <div className="flex gap-0.5" role="img" aria-label={`${service.name}, last 30 days: ${days.filter((day) => day !== 'up').length} days with problems`}>
                {days.map((day, index) => (
                  <span key={index} title={`Day ${index + 1}: ${WORD[day]}`} className={`h-6 flex-1 rounded-xs ${TONE[day]}`} />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
