import { zodResolver } from '@hookform/resolvers/zod'
import { Layers } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button, Form, FormCheckbox, FormInput, FormPasswordInput, Progress, toast } from '../../src'

const schema = z.object({
  name: z.string().min(1, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  terms: z.boolean().refine((accepted) => accepted, 'Accept the terms to continue.'),
})

type Values = z.infer<typeof schema>

/** One point each for length, a second length step, a digit and mixed case. */
function strengthOf(password: string) {
  const score = [
    password.length >= 8,
    password.length >= 12,
    /\d/.test(password),
    /[a-z]/.test(password) && /[A-Z]/.test(password),
  ].filter(Boolean).length
  return { score, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score] }
}

export default function SignUp() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', terms: false },
  })
  const password = useWatch({ control: form.control, name: 'password' })
  const strength = strengthOf(password)

  return (
    <div className="w-full max-w-sm rounded-xl border bg-surface-100 p-6 shadow-lg sm:p-8">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/40 bg-brand-default/15 text-brand-600">
        <Layers className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">Create your account</h3>
      <p className="mt-1 text-sm text-foreground-light">Free for 14 days. No card needed.</p>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(({ email }) => {
            toast.success(`Account created for ${email}`)
            form.reset()
          })}
          className="mt-6 flex flex-col gap-4"
        >
          <FormInput name="name" label="Full name" autoComplete="name" />
          <FormInput name="email" label="Work email" type="email" placeholder="name@company.com" autoComplete="email" />
          <div className="flex flex-col gap-2">
            <FormPasswordInput name="password" label="Password" autoComplete="new-password" />
            {password && (
              <div className="flex items-center gap-3" aria-live="polite">
                <Progress value={strength.score * 25} aria-label="Password strength" className="flex-1" />
                <span className="w-16 text-right text-xs text-foreground-light">{strength.label}</span>
              </div>
            )}
          </div>
          <FormCheckbox name="terms" label="I agree to the terms and the privacy policy" />
          <Button type="submit" variant="primary" size="medium" block loading={form.formState.isSubmitting}>
            Create account
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-foreground-light">
        Already have an account?{' '}
        <a href="#sign-up" className="focus-ring rounded-xs font-medium text-foreground underline underline-offset-2">
          Sign in
        </a>
      </p>
    </div>
  )
}
