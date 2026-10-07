// Validation errors must reach the field components. Runs under the React Compiler
// (vitest.config.ts), like the published build: useFormField used to read the context's
// formState proxy, which the compiler memoised away, so no error ever rendered.
import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { expect, test } from 'vitest'
import { z } from 'zod'

import { Form } from '../src/components/atoms/forms/form'
import { FormCheckbox, FormInput, FormSwitch } from '../src/components/fragments/form-fields'

const schema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  terms: z.literal(true, { error: 'You must accept the terms.' }),
  notifications: z.boolean(),
})

function SignupForm() {
  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', notifications: false },
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormInput name="username" label="Username" />
        <FormCheckbox name="terms" label="I accept the terms" />
        <FormSwitch name="notifications" label="Email notifications" />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

test('submitting an invalid form shows each field error and marks the control invalid', async () => {
  const user = userEvent.setup()
  render(<SignupForm />)
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  const username = screen.getByRole('textbox', { name: 'Username' })
  expect(await screen.findByText('Username must be at least 2 characters.')).toBeTruthy()
  expect(username.getAttribute('aria-invalid')).toBe('true')
  expect(username.getAttribute('aria-describedby')).toContain(
    screen.getByText('Username must be at least 2 characters.').id
  )

  const terms = screen.getByRole('checkbox', { name: 'I accept the terms' })
  expect(screen.getByText('You must accept the terms.')).toBeTruthy()
  expect(terms.getAttribute('aria-invalid')).toBe('true')

  // Fixing a field clears its error (after FormMessage's exit animation).
  await user.type(username, 'ada')
  await user.click(terms)
  expect(username.getAttribute('aria-invalid')).toBe('false')
  await waitFor(() => {
    expect(screen.queryByText('Username must be at least 2 characters.')).toBeNull()
    expect(screen.queryByText('You must accept the terms.')).toBeNull()
  })
})

test('FormCheckbox and FormSwitch get unique ids their labels point to', () => {
  render(<SignupForm />)
  const terms = screen.getByRole('checkbox', { name: 'I accept the terms' })
  const notifications = screen.getByRole('switch', { name: 'Email notifications' })
  expect(terms.id).not.toMatch(/^undefined/)
  expect(notifications.id).not.toMatch(/^undefined/)
  expect(terms.id).not.toBe(notifications.id)
})
