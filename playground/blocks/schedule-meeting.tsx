import { CalendarCheck, Clock, Video } from 'lucide-react'
import { useState } from 'react'

import { Avatar, Button, Calendar, Result, Select, ToggleGroup } from '../../src'

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '15:30', '16:00']

const ZONES = [
  { value: 'Asia/Baku', label: 'Baku (UTC+4)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
]

/** Made-up availability: the same day always has the same slots taken. */
const isTaken = (date: Date, index: number) => (date.getDate() + index) % 4 === 0

const dayLabel = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export default function ScheduleMeeting() {
  const [today] = useState(() => new Date())
  const [date, setDate] = useState<Date | undefined>()
  const [slot, setSlot] = useState('')
  const [zone, setZone] = useState('Asia/Baku')
  const [booked, setBooked] = useState(false)

  const zoneLabel = ZONES.find((item) => item.value === zone)?.label.split(' (')[0]

  if (booked && date) {
    return (
      <div className="w-full max-w-3xl rounded-xl border bg-surface-100 p-8 shadow-sm">
        <Result
          status="success"
          size="small"
          level={3}
          title="You are booked"
          description={`${dayLabel(date)} at ${slot}, ${zoneLabel} time. A calendar invite is on its way.`}
          extra={
            <Button
              onClick={() => {
                setBooked(false)
                setSlot('')
              }}
            >
              Book another time
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <Avatar fallback="GH" className="h-10 w-10 text-sm font-medium" />
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Intro call with Grace Hopper</h3>
          <p className="mt-0.5 flex items-center gap-3 text-sm text-foreground-light">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              30 minutes
            </span>
            <span className="inline-flex items-center gap-1">
              <Video className="h-3.5 w-3.5" aria-hidden="true" />
              Video call
            </span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[auto_minmax(0,1fr)] md:divide-x">
        <div className="flex justify-center p-4 md:p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(next) => {
              setDate(next)
              setSlot('')
            }}
            disabled={[{ before: today }, { dayOfWeek: [0, 6] }]}
            defaultMonth={today}
          />
        </div>

        <div className="flex flex-col gap-4 p-6">
          <Select options={ZONES} value={zone} onValueChange={setZone} aria-label="Time zone" />
          {date ? (
            <>
              <p className="text-sm font-medium text-foreground">{dayLabel(date)}</p>
              <ToggleGroup
                type="single"
                variant="outline"
                aria-label="Available times"
                className="grid grid-cols-2 gap-2"
                value={slot}
                onValueChange={(next: string) => setSlot(next)}
                items={SLOTS.map((time, index) => ({ value: time, label: time, disabled: isTaken(date, index) }))}
              />
            </>
          ) : (
            <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-surface-75 p-8 text-center text-sm text-foreground-light">
              Pick a weekday to see the times that are free.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-surface-75 px-6 py-3.5">
        <p className="text-sm text-foreground-light" aria-live="polite">
          {date && slot ? `${dayLabel(date)} at ${slot}, ${zoneLabel} time` : 'No time chosen yet.'}
        </p>
        <Button variant="primary" icon={<CalendarCheck />} disabled={!date || !slot} onClick={() => setBooked(true)}>
          Confirm booking
        </Button>
      </div>
    </div>
  )
}
