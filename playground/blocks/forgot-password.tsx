import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Form, FormInput } from '../../src'

const schema = z.object({ email: z.string().email('Enter a valid email address.') })

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  return (
    <div className="w-full max-w-sm rounded-xl border bg-surface-100 p-6 shadow-lg sm:p-8">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-surface-75 text-foreground-light">
        {sentTo ? <MailCheck className="h-5 w-5" aria-hidden="true" /> : <KeyRound className="h-5 w-5" aria-hidden="true" />}
      </span>

      {sentTo ? (
        <div role="status">
          <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">Check your email</h3>
          <p className="mt-1 text-sm text-foreground-light">
            We sent a link to <span className="font-medium text-foreground">{sentTo}</span>. It works for 30 minutes.
          </p>
          <Button
            variant="default"
            size="medium"
            block
            className="mt-6"
            onClick={() => {
              form.reset()
              setSentTo(null)
            }}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <>
          <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">Reset your password</h3>
          <p className="mt-1 text-sm text-foreground-light">Enter your email and we will send you a link to choose a new one.</p>
          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(({ email }) => setSentTo(email))} className="mt-6 flex flex-col gap-4">
              <FormInput name="email" label="Email" type="email" placeholder="name@company.com" autoComplete="email" />
              <Button type="submit" variant="primary" size="medium" block>
                Send reset link
              </Button>
            </form>
          </Form>
        </>
      )}

      <a
        href="#forgot-password"
        className="focus-ring mt-6 flex items-center justify-center gap-1.5 rounded-xs text-sm text-foreground-light hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </a>
    </div>
  )
}
