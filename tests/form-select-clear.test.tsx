// Clearing a FormSelect must fail a required schema again, not pass as an empty string.
import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { expect, test } from 'vitest'
import { z } from 'zod'

import { Form } from '../src/components/atoms/forms/form'
import { FormSelect } from '../src/components/fragments/form-fields'

const schema = z.object({ role: z.string({ error: 'Pick a role.' }) })

function Host() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'admin' } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormSelect
          name="role"
          label="Role"
          clearable
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'viewer', label: 'Viewer' },
          ]}
        />
        <button type="submit">Save</button>
      </form>
    </Form>
  )
}

test('clearing a FormSelect brings the required error back', async () => {
  render(<Host />)
  fireEvent.click(screen.getByText('Save'))
  expect(screen.queryByText('Pick a role.')).toBeNull()

  fireEvent.click(screen.getByTitle('Clear selection'))
  fireEvent.click(screen.getByText('Save'))
  await waitFor(() => expect(screen.getByText('Pick a role.')).toBeTruthy())
})
