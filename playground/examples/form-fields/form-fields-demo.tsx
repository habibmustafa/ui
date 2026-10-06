'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Button,
  Form,
  FormCheckbox,
  FormDatePicker,
  FormInput,
  FormRadioGroup,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from '../../../src'

const FormSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  bio: z.string().max(160).optional(),
  role: z.string({ error: 'Pick a role.' }),
  plan: z.enum(['free', 'pro', 'team'], { error: 'Pick a plan.' }),
  renewalDate: z.date({ error: 'Pick a renewal date.' }),
  notifications: z.boolean(),
  terms: z.literal(true, { error: 'You must accept the terms.' }),
})

export default function FormFieldsDemo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { username: '', bio: '', plan: 'free', notifications: true },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values:', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-foreground p-4">
          <code className="text-background">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
        <FormInput name="username" label="Username" placeholder="shadcn" />
        <FormTextarea name="bio" label="Bio" description="Shown on your public profile." />
        <FormSelect
          name="role"
          label="Role"
          placeholder="Select a role"
          options={[
            { value: 'viewer', label: 'Viewer' },
            { value: 'editor', label: 'Editor' },
            { value: 'admin', label: 'Admin' },
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
        <FormDatePicker name="renewalDate" label="Renewal date" />
        <FormSwitch name="notifications" label="Email notifications" />
        <FormCheckbox name="terms" label="I accept the terms and conditions" />
        <Button type="submit" variant="secondary">
          Submit
        </Button>
      </form>
    </Form>
  )
}
