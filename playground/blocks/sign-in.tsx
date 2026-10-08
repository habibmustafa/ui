import { zodResolver } from '@hookform/resolvers/zod'
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
    <div className="w-full max-w-sm">
      <h3 className="text-xl font-semibold text-foreground">Sign in</h3>
      <p className="mt-1 text-sm text-foreground-light">Use the email address you registered with.</p>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(({ email }) => {
            toast.success(`Signed in as ${email}`)
            form.reset({ email: '', password: '', remember: true })
          })}
          className="mt-6 flex flex-col gap-4"
        >
          <FormInput name="email" label="Email" type="email" placeholder="name@company.com" autoComplete="email" />
          <FormPasswordInput name="password" label="Password" autoComplete="current-password" />
          <div className="flex items-center justify-between gap-3">
            <FormCheckbox name="remember" label="Keep me signed in" />
            <a href="#sign-in" className="focus-ring rounded-xs text-sm text-brand-600 underline underline-offset-2">
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
        <a href="#sign-in" className="focus-ring rounded-xs text-brand-600 underline underline-offset-2">
          Create an account
        </a>
      </p>
    </div>
  )
}
