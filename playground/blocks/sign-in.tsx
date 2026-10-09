import { zodResolver } from '@hookform/resolvers/zod'
import { Fingerprint, KeyRound, Layers } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Form, FormCheckbox, FormInput, FormPasswordInput, toast } from '../../src'

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  remember: z.boolean(),
})

export default function SignIn() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  })

  return (
    <div className="w-full max-w-sm rounded-xl border bg-surface-100 p-6 shadow-lg sm:p-8">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/40 bg-brand-default/15 text-brand-600">
        <Layers className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">Welcome back</h3>
      <p className="mt-1 text-sm text-foreground-light">Sign in to pick up where you left off.</p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button type="button" size="medium" block icon={<Fingerprint />}>
          Passkey
        </Button>
        <Button type="button" size="medium" block icon={<KeyRound />}>
          Single sign-on
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-foreground-lighter" role="separator">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or use your email
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(({ email }) => {
            toast.success(`Signed in as ${email}`)
            form.reset({ email: '', password: '', remember: true })
          })}
          className="flex flex-col gap-4"
        >
          <FormInput name="email" label="Email" type="email" placeholder="name@company.com" autoComplete="email" />
          <FormPasswordInput name="password" label="Password" autoComplete="current-password" />
          <div className="flex items-center justify-between gap-3">
            <FormCheckbox name="remember" label="Keep me signed in" />
            <a href="#sign-in" className="focus-ring rounded-xs text-sm text-brand-600 underline-offset-2 hover:underline">
              Forgot password?
            </a>
          </div>
          <Button type="submit" variant="primary" size="medium" block loading={form.formState.isSubmitting}>
            Sign in
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-foreground-light">
        New here?{' '}
        <a href="#sign-in" className="focus-ring rounded-xs font-medium text-foreground underline underline-offset-2">
          Create an account
        </a>
      </p>
    </div>
  )
}
