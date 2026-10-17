'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Button,
  Form,
  FormCheckbox,
  FormCombobox,
  FormDateField,
  FormDatePicker,
  FormDateRangePicker,
  FormFileUpload,
  FormInput,
  FormInputOTP,
  FormMultiSelect,
  FormNumberInput,
  FormPasswordInput,
  FormRadioGroup,
  FormRating,
  FormSelect,
  FormSlider,
  FormSwitch,
  FormTextarea,
  FormTimePicker,
  FormToggleGroup,
} from '../../../src'

const FormSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  bio: z.string().max(160).optional(),
  password: z.string().min(8, { error: 'Use at least 8 characters.' }),
  seats: z.number({ error: 'Enter a seat count.' }).min(1, { error: 'At least one seat.' }),
  role: z.string({ error: 'Pick a role.' }),
  region: z.string({ error: 'Pick a region.' }),
  tags: z.array(z.string()).min(1, { error: 'Pick at least one tag.' }),
  plan: z.enum(['free', 'pro', 'team'], { error: 'Pick a plan.' }),
  billing: z.string().min(1, { error: 'Pick a billing period.' }),
  renewalDate: z.date({ error: 'Pick a renewal date.' }),
  birthday: z.date({ error: 'Type a complete date.' }),
  period: z
    .object({ from: z.date().optional(), to: z.date().optional() }, { error: 'Pick a date range.' })
    .refine((range) => range.from && range.to, { error: 'Pick both a start and an end date.' }),
  startTime: z.string({ error: 'Enter a start time.' }),
  budget: z.array(z.number()).refine(([value]) => value >= 10, { error: 'Budget must be at least 10.' }),
  satisfaction: z.number().min(1, { error: 'Rate at least one star.' }),
  code: z.string().length(6, { error: 'Enter the 6-digit code.' }),
  attachments: z.array(z.instanceof(File)).min(1, { error: 'Attach at least one file.' }),
  notifications: z.boolean(),
  terms: z.literal(true, { error: 'You must accept the terms.' }),
})

type FormValues = z.infer<typeof FormSchema>

export default function FormFieldsDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      bio: '',
      password: '',
      tags: [],
      plan: 'free',
      billing: '',
      budget: [0],
      satisfaction: 0,
      code: '',
      attachments: [],
      notifications: true,
    },
  })

  function onSubmit(data: FormValues) {
    const shown = { ...data, attachments: data.attachments.map((file) => file.name) }
    toast('You submitted the following values:', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-foreground p-4">
          <code className="text-background">{JSON.stringify(shown, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      {/* Submit empty: focus jumps to the first invalid field, whatever kind it is. */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
        <FormInput name="username" label="Username" placeholder="shadcn" />
        <FormTextarea name="bio" label="Bio" description="Shown on your public profile." />
        <FormPasswordInput name="password" label="Password" showStrength />
        <FormNumberInput name="seats" label="Seats" min={1} max={100} />
        <FormSelect
          name="role"
          label="Role"
          placeholder="Select a role"
          clearable
          options={[
            { value: 'viewer', label: 'Viewer' },
            { value: 'editor', label: 'Editor' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
        <FormCombobox
          name="region"
          label="Region"
          placeholder="Select a region"
          clearable
          options={[
            { value: 'frankfurt', label: 'Frankfurt' },
            { value: 'virginia', label: 'North Virginia' },
            { value: 'mumbai', label: 'Mumbai' },
          ]}
        />
        <FormMultiSelect
          name="tags"
          label="Tags"
          placeholder="Select tags"
          clearable
          options={[
            { value: 'internal', label: 'Internal' },
            { value: 'billing', label: 'Billing' },
            { value: 'beta', label: 'Beta' },
          ]}
        />
        <FormRadioGroup
          name="plan"
          label="Plan"
          options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'team', label: 'Team' },
          ]}
        />
        <FormToggleGroup
          name="billing"
          label="Billing period"
          variant="outline"
          items={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
        />
        <FormDatePicker name="renewalDate" label="Renewal date" />
        <FormDateField name="birthday" label="Birthday" description="Typed date, no calendar." />
        <FormDateRangePicker name="period" label="Reporting period" />
        <FormTimePicker name="startTime" label="Start time" />
        <FormSlider name="budget" label="Budget" description="In thousands." step={5} />
        <FormRating name="satisfaction" label="Satisfaction" />
        <FormInputOTP name="code" label="Verification code" slots={6} groupSize={3} />
        <FormFileUpload
          name="attachments"
          label="Attachments"
          description="Any file, up to 5 MB."
          maxSize={5 * 1024 * 1024}
        />
        <FormSwitch name="notifications" label="Email notifications" />
        <FormCheckbox name="terms" label="I accept the terms and conditions" />
        <Button type="submit" variant="secondary">
          Submit
        </Button>
      </form>
    </Form>
  )
}
