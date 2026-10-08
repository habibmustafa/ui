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
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Account settings</h3>
        <p className="mt-0.5 text-sm text-foreground-light">How you appear to others, and what we email you about.</p>
      </div>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => {
            toast.success('Changes saved')
            form.reset(values)
          })}
        >
          <section aria-labelledby="account-profile" className="flex flex-col gap-5 px-6 py-6">
            <h4 id="account-profile" className="text-sm font-medium text-foreground">
              Profile
            </h4>
            <div className="flex items-center gap-4">
              <Avatar fallback="AL" className="h-16 w-16 text-lg font-medium" />
              <div className="flex flex-col items-start gap-1.5">
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
          </section>

          <section aria-labelledby="account-email" className="border-t px-6 py-6">
            <h4 id="account-email" className="text-sm font-medium text-foreground">
              Email me about
            </h4>
            <div className="mt-4 flex flex-col divide-y rounded-lg border bg-surface-75">
              <div className="px-4 py-3.5">
                <FormSwitch name="productUpdates" label="New features and releases" />
              </div>
              <div className="px-4 py-3.5">
                <FormSwitch name="mentions" label="Mentions and replies" />
              </div>
              <div className="px-4 py-3.5">
                <FormSwitch name="weeklyDigest" label="A weekly summary" />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between gap-3 border-t bg-surface-75 px-6 py-3.5">
            <p className="text-sm text-foreground-light" aria-live="polite">
              {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <div className="flex gap-2">
              <Button type="button" disabled={!isDirty} onClick={() => form.reset(saved)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!isDirty} loading={form.formState.isSubmitting}>
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
