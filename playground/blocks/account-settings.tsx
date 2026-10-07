import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Avatar, Button, Form, FormInput, FormSwitch, FormTextarea, toast } from '../../src'

const schema = z.object({
  name: z.string().min(1, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  bio: z.string().max(160, 'Keep it under 160 characters.'),
  productUpdates: z.boolean(),
  mentions: z.boolean(),
  weeklyDigest: z.boolean(),
})

type Values = z.infer<typeof schema>

const saved: Values = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  bio: 'Writes about analytical engines.',
  productUpdates: true,
  mentions: true,
  weeklyDigest: false,
}

export default function AccountSettings() {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: saved })
  const { isDirty } = form.formState

  return (
    <div className="w-full max-w-xl">
      <h3 className="text-xl font-semibold text-foreground">Account settings</h3>
      <p className="mt-1 text-sm text-foreground-light">How you appear to others, and what we email you about.</p>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => {
            toast.success('Changes saved')
            form.reset(values)
          })}
          className="mt-6 flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <Avatar fallback="AL" className="h-14 w-14 text-base" />
            <div className="flex flex-col items-start gap-1">
              <Button type="button" size="small">
                Change photo
              </Button>
              <p className="text-xs text-foreground-lighter">JPG or PNG, up to 2 MB.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput name="name" label="Name" autoComplete="name" />
            <FormInput name="email" label="Email" type="email" autoComplete="email" />
          </div>
          <FormTextarea name="bio" label="Bio" description="Shown on your public profile." rows={3} />

          <fieldset className="flex flex-col gap-3 border-t pt-5">
            <legend className="mb-1 text-sm font-medium text-foreground">Email me about</legend>
            <FormSwitch name="productUpdates" label="New features and releases" />
            <FormSwitch name="mentions" label="Mentions and replies" />
            <FormSwitch name="weeklyDigest" label="A weekly summary" />
          </fieldset>

          <div className="flex justify-end gap-2 border-t pt-5">
            <Button type="button" disabled={!isDirty} onClick={() => form.reset(saved)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!isDirty} loading={form.formState.isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
