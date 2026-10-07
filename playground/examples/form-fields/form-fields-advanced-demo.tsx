'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Button,
  Form,
  FormCombobox,
  FormDatePicker,
  FormDateRangePicker,
  FormFileUpload,
  FormInputOTP,
  FormMultiSelect,
  FormNumberInput,
  FormPasswordInput,
  FormSlider,
  FormTimePicker,
  FormToggleGroup,
} from '../../../src'

const FormSchema = z.object({
  seats: z.number({ error: 'Enter a seat count.' }).min(1, { error: 'At least one seat.' }),
  password: z.string().min(8, { error: 'Use at least 8 characters.' }),
  region: z.string({ error: 'Pick a region.' }),
  tags: z.array(z.string()).min(1, { error: 'Pick at least one tag.' }),
  startDate: z.date({ error: 'Pick a start date.' }),
  period: z
    .object({ from: z.date().optional(), to: z.date().optional() }, { error: 'Pick a date range.' })
    .refine((range) => range.from && range.to, { error: 'Pick both a start and an end date.' }),
  startTime: z.string({ error: 'Enter a start time.' }),
  budget: z.array(z.number()).refine(([value]) => value >= 10, { error: 'Budget must be at least 10.' }),
  billing: z.string().min(1, { error: 'Pick a billing period.' }),
  code: z.string().length(6, { error: 'Enter the 6-digit code.' }),
  attachments: z.array(z.instanceof(File)).min(1, { error: 'Attach at least one file.' }),
})

type FormValues = z.infer<typeof FormSchema>

export default function FormFieldsAdvancedDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      tags: [],
      budget: [0],
      billing: '',
      code: '',
      attachments: [],
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
        <FormNumberInput name="seats" label="Seats" min={1} max={100} />
        <FormPasswordInput name="password" label="Password" showStrength />
        <FormCombobox
          name="region"
          label="Region"
          placeholder="Select a region"
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
          options={[
            { value: 'internal', label: 'Internal' },
            { value: 'billing', label: 'Billing' },
            { value: 'beta', label: 'Beta' },
          ]}
        />
        <FormDatePicker name="startDate" label="Start date" />
        <FormDateRangePicker name="period" label="Reporting period" />
        <FormTimePicker name="startTime" label="Start time" />
        <FormSlider name="budget" label="Budget" description="In thousands." step={5} />
        <FormToggleGroup
          name="billing"
          label="Billing period"
          variant="outline"
          items={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
        />
        <FormInputOTP name="code" label="Verification code" slots={6} groupSize={3} />
        <FormFileUpload name="attachments" label="Attachments" description="Any file, up to 5 MB." maxSize={5 * 1024 * 1024} />
        <Button type="submit" variant="secondary">
          Submit
        </Button>
      </form>
    </Form>
  )
}
