import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useId, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormInput,
  FormSelect,
  FormSwitch,
  Label,
  NumberInput,
  Slider,
  TimePicker,
  ToggleGroup,
  toast,
} from '../../src'
import { findComponent } from '../registry'
import { Link } from '../router'

/*
 * Three small, working screens built only from the library — what a visitor would
 * actually build with it. Each lists the components it uses, linking to their pages.
 */

function UsedComponents({ ids }: { ids: string[] }) {
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-foreground-lighter">
      <span>Uses:</span>
      {ids.map((id, index) => (
        <span key={id} className="inline-flex items-center gap-1.5">
          <Link
            to={`/components/${id}`}
            className="focus-ring rounded-xs text-foreground-light underline decoration-border-stronger underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground-lighter"
          >
            {findComponent(id)?.title ?? id}
          </Link>
          {index < ids.length - 1 && <span aria-hidden="true">·</span>}
        </span>
      ))}
    </p>
  )
}

function ShowcaseCard({
  title,
  description,
  uses,
  children,
}: {
  title: string
  description: string
  uses: string[]
  children: ReactNode
}) {
  return (
    <Card
      title={title}
      description={description}
      footer={<UsedComponents ids={uses} />}
      className="flex h-full flex-col"
      classNames={{ content: 'flex-1' }}
    >
      {children}
    </Card>
  )
}

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  role: z.string({ error: 'Pick a role.' }),
  notify: z.boolean(),
})

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

function InviteCard() {
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', notify: true },
  })

  return (
    <ShowcaseCard
      title="Invite a teammate"
      description="Validation, error messages and focus, via react-hook-form."
      uses={['form-fields', 'input', 'select', 'switch', 'sonner']}
    >
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(({ email, role, notify }) => {
            const roleLabel = ROLES.find((r) => r.value === role)?.label
            toast.success(`${email} invited as ${roleLabel?.toLowerCase()}`, {
              description: notify ? 'Invitation email sent.' : 'No email sent.',
            })
            form.reset()
          })}
          className="flex flex-col gap-4"
        >
          <FormInput name="email" label="Email" type="email" placeholder="name@company.com" />
          <FormSelect name="role" label="Role" placeholder="Pick a role" options={ROLES} />
          <FormSwitch name="notify" label="Send invitation email" />
          <Button type="submit" variant="primary" size="small" block>
            Send invite
          </Button>
        </form>
      </Form>
    </ShowcaseCard>
  )
}

const DURATIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
]

function MeetingCard() {
  const id = useId()
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string | null>(null)
  const [duration, setDuration] = useState('30')
  const today = dayjs().startOf('day').toDate()
  const ready = date !== undefined && time !== null

  return (
    <ShowcaseCard
      title="Schedule a meeting"
      description="Calendar, clock dial and a segmented choice."
      uses={['date-picker', 'time-picker', 'toggle-group']}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label id={`${id}-date`}>Date</Label>
          <DatePicker
            minDate={today}
            triggerLabel={date ? dayjs(date).format('D MMM YYYY') : 'Pick a date'}
            buttonProps={{ className: 'w-full', 'aria-labelledby': `${id}-date` }}
            calendarProps={{ mode: 'single', selected: date, onSelect: setDate, autoFocus: true }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label id={`${id}-time`}>Time</Label>
          <TimePicker
            aria-labelledby={`${id}-time`}
            value={time}
            onValueChange={setTime}
            minuteStep={15}
            className="w-full [&>button]:ml-auto"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label id={`${id}-duration`}>Duration</Label>
          <ToggleGroup
            type="single"
            variant="segmented"
            tone="outline"
            allowDeselect={false}
            aria-labelledby={`${id}-duration`}
            value={duration}
            onValueChange={(value: string) => value && setDuration(value)}
            items={DURATIONS}
          />
        </div>
        <Button
          variant="primary"
          size="small"
          block
          disabled={!ready}
          onClick={() => {
            const label = DURATIONS.find((d) => d.value === duration)?.label
            toast.success('Meeting scheduled', {
              description: `${dayjs(date).format('D MMM YYYY')}, ${time} · ${label}`,
            })
          }}
        >
          Schedule
        </Button>
      </div>
    </ShowcaseCard>
  )
}

const PRICE_PER_SEAT = 8
const YEARLY_DISCOUNT = 0.2

function PlanCard() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [seats, setSeats] = useState(5)
  const seatsId = useId()
  const monthly = seats * PRICE_PER_SEAT
  const total = billing === 'monthly' ? monthly : Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT))

  return (
    <ShowcaseCard
      title="Subscription"
      description="A slider and number field kept in sync, with a live total."
      uses={['toggle-group', 'slider', 'number-input']}
    >
      <div className="flex flex-col gap-5">
        <ToggleGroup
          type="single"
          variant="segmented"
          tone="outline"
          allowDeselect={false}
          aria-label="Billing period"
          value={billing}
          onValueChange={(value: string) => value && setBilling(value as typeof billing)}
          items={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly −20%' },
          ]}
        />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={seatsId}>Seats</Label>
            <NumberInput
              id={seatsId}
              mode="numeric"
              min={1}
              max={50}
              value={seats}
              onValueChange={(value) => value !== null && setSeats(value)}
              size="tiny"
              className="w-24"
            />
          </div>
          <Slider
            aria-label="Seats"
            min={1}
            max={50}
            value={[seats]}
            onValueChange={([value]) => setSeats(value)}
          />
        </div>
        <div className="rounded-md border bg-surface-75 px-4 py-3">
          <p className="text-xs text-foreground-lighter">
            {seats} {seats === 1 ? 'seat' : 'seats'} × ${PRICE_PER_SEAT} / month
          </p>
          <p className="mt-1 text-2xl tabular-nums text-foreground" aria-live="polite">
            ${total}{' '}
            <span className="text-sm text-foreground-light">
              / {billing === 'monthly' ? 'month' : 'year'}
            </span>
          </p>
        </div>
        <Button
          variant="default"
          size="small"
          block
          onClick={() =>
            toast(`${seats} seats, ${billing} plan`, {
              description: `Total: $${total}`,
            })
          }
        >
          Continue
        </Button>
      </div>
    </ShowcaseCard>
  )
}

export function Showcase() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <InviteCard />
      <MeetingCard />
      <PlanCard />
    </div>
  )
}
