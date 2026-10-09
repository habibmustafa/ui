import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Button,
  Descriptions,
  Form,
  FormCombobox,
  FormDatePicker,
  FormInput,
  FormMultiSelect,
  Result,
  Stepper,
} from '../../src'

const COMPANIES = [
  { value: 'solo', label: 'Just me' },
  { value: 'small', label: '2 to 20 people' },
  { value: 'medium', label: '21 to 200 people' },
  { value: 'large', label: 'More than 200' },
]

const TOPICS = [
  { value: 'Design systems' },
  { value: 'Accessibility' },
  { value: 'Performance' },
  { value: 'Theming' },
  { value: 'Testing' },
]

const schema = z.object({
  name: z.string().min(1, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  company: z.string({ error: 'Choose a company size.' }).min(1, 'Choose a company size.'),
  topics: z.array(z.string()).min(1, 'Pick at least one topic.'),
  day: z.date({ error: 'Choose the day you will join.' }),
})

type Values = z.infer<typeof schema>

/** Which fields each step owns, so "Continue" validates only what the person can see. */
const STEP_FIELDS: (keyof Values)[][] = [['name', 'email', 'company'], ['topics', 'day'], []]

const steps = [{ title: 'About you' }, { title: 'Your day' }, { title: 'Review' }]

export default function MultiStepForm() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [today] = useState(() => new Date())
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', company: undefined, topics: [], day: undefined },
  })

  const next = async () => {
    if (await form.trigger(STEP_FIELDS[step])) setStep((current) => current + 1)
  }

  if (done) {
    return (
      <div className="w-full max-w-xl rounded-xl border bg-surface-100 p-8 shadow-sm">
        <Result
          status="success"
          size="small"
          level={3}
          title="You are registered"
          description={`We saved your seat for ${form.getValues('day')?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Check ${form.getValues('email')} for the details.`}
          extra={
            <Button
              onClick={() => {
                form.reset()
                setStep(0)
                setDone(false)
              }}
            >
              Register someone else
            </Button>
          }
        />
      </div>
    )
  }

  const values = form.getValues()

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <Stepper steps={steps} activeStep={step} aria-label="Registration progress" />
      </div>

      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(() => setDone(true))}>
          <div className="flex flex-col gap-5 px-6 py-6">
            {step === 0 && (
              <>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Tell us who you are</h3>
                <FormInput name="name" label="Full name" autoComplete="name" />
                <FormInput name="email" label="Work email" type="email" autoComplete="email" />
                <FormCombobox name="company" label="Company size" options={COMPANIES} placeholder="Choose a size" searchPlaceholder="Search sizes" />
              </>
            )}

            {step === 1 && (
              <>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Plan your day</h3>
                <FormMultiSelect name="topics" label="Topics you care about" placeholder="Pick topics" options={TOPICS} />
                <FormDatePicker name="day" label="Day you will join" minDate={today} />
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Check your answers</h3>
                <Descriptions
                  columns={1}
                  bordered
                  items={[
                    { label: 'Name', value: values.name },
                    { label: 'Email', value: values.email },
                    { label: 'Company size', value: COMPANIES.find((item) => item.value === values.company)?.label },
                    { label: 'Topics', value: values.topics.join(', ') },
                    { label: 'Day', value: values.day?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
                  ]}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t bg-surface-75 px-6 py-3.5">
            <Button type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
              Back
            </Button>
            <span className="text-xs tabular-nums text-foreground-lighter">
              Step {step + 1} of {steps.length}
            </span>
            {step < steps.length - 1 ? (
              <Button type="button" variant="primary" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="primary">
                Register
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
