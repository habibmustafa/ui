// Every Form* field wrapper against react-hook-form: the label names the control a user
// reaches, a failed submit marks that control aria-invalid (described by the message) and
// focuses it, `onBlur` marks the field touched, and a filled field submits its value.
import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import type * as React from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'
import { z } from 'zod'

import { Form } from '../src/components/atoms/forms/form'
import {
  FormCombobox,
  FormDateField,
  FormFileUpload,
  FormInputOTP,
  FormMultiSelect,
  FormNumberInput,
  FormPasswordInput,
  FormSlider,
  FormTimePicker,
  FormToggleGroup,
} from '../src/components/fragments/form-fields'

// input-otp probes for password-manager badges with elementFromPoint once focused; jsdom
// lacks it. Stubbed here only — axe (tests/a11y) changes behaviour when it exists.
document.elementFromPoint ??= () => null

const MESSAGE = 'This field is invalid.'

interface Case {
  name: string
  schema: z.ZodType
  defaultValue: unknown
  field: React.ReactElement
  /** The element carrying the accessible name, aria-invalid and aria-describedby. */
  control: () => HTMLElement
  /** Where focus lands after a failed submit (defaults to `control`). */
  focusTarget?: () => HTMLElement
  fill: (user: UserEvent) => Promise<void>
  expected: unknown
}

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'pear', label: 'Pear' },
]

const CASES: Case[] = [
  {
    name: 'FormNumberInput',
    schema: z.number({ error: MESSAGE }).min(18, { error: MESSAGE }),
    defaultValue: null,
    field: <FormNumberInput name="value" label="Age" />,
    control: () => screen.getByRole('spinbutton', { name: 'Age' }),
    fill: async (user) => {
      await user.type(screen.getByRole('spinbutton', { name: 'Age' }), '21')
      await user.tab()
    },
    expected: 21,
  },
  {
    name: 'FormPasswordInput',
    schema: z.string().min(8, { error: MESSAGE }),
    defaultValue: '',
    field: <FormPasswordInput name="value" label="Password" />,
    control: () => screen.getByLabelText('Password', { selector: 'input' }),
    fill: async (user) => {
      await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'correct horse')
    },
    expected: 'correct horse',
  },
  {
    name: 'FormTimePicker',
    schema: z.string({ error: MESSAGE }),
    defaultValue: null,
    field: <FormTimePicker name="value" label="Start time" clock={false} />,
    control: () => screen.getByRole('group', { name: 'Start time' }),
    focusTarget: () => screen.getByRole('spinbutton', { name: 'Hours' }),
    fill: async (user) => {
      await user.click(screen.getByRole('spinbutton', { name: 'Hours' }))
      await user.keyboard('0930')
    },
    expected: '09:30',
  },
  {
    name: 'FormSlider',
    schema: z.array(z.number()).refine((v) => v[0] >= 50, { error: MESSAGE }),
    defaultValue: [0],
    field: <FormSlider name="value" label="Volume" step={10} />,
    control: () => screen.getByRole('slider', { name: 'Volume' }),
    fill: async () => {
      fireEvent.keyDown(screen.getByRole('slider', { name: 'Volume' }), { key: 'End' })
    },
    expected: [100],
  },
  {
    name: 'FormInputOTP',
    schema: z.string().length(4, { error: MESSAGE }),
    defaultValue: '',
    field: <FormInputOTP name="value" label="Code" slots={4} />,
    control: () => screen.getByRole('textbox', { name: 'Code' }),
    fill: async (user) => {
      await user.click(screen.getByRole('textbox', { name: 'Code' }))
      await user.keyboard('1234')
    },
    expected: '1234',
  },
  {
    name: 'FormDateField',
    schema: z.date({ error: MESSAGE }),
    defaultValue: null,
    field: <FormDateField name="value" label="Birthday" />,
    control: () => screen.getByRole('textbox', { name: 'Birthday' }),
    fill: async (user) => {
      await user.click(screen.getByRole('textbox', { name: 'Birthday' }))
      await user.keyboard('{Home}01022000')
    },
    expected: new Date(2000, 1, 1),
  },
  {
    name: 'FormCombobox',
    schema: z.string({ error: MESSAGE }),
    defaultValue: null,
    field: <FormCombobox name="value" label="Fruit" options={fruits} />,
    control: () => screen.getByRole('combobox', { name: 'Fruit' }),
    fill: async (user) => {
      await user.click(screen.getByRole('combobox', { name: 'Fruit' }))
      await user.click(screen.getByRole('option', { name: 'Pear' }))
    },
    expected: 'pear',
  },
  {
    name: 'FormMultiSelect',
    schema: z.array(z.string()).min(1, { error: MESSAGE }),
    defaultValue: [],
    field: <FormMultiSelect name="value" label="Fruits" placeholder="Pick fruits" options={fruits} />,
    control: () => screen.getByRole('combobox', { name: 'Fruits' }),
    fill: async () => {
      fireEvent.click(screen.getByRole('combobox', { name: 'Fruits' }))
      fireEvent.click(await screen.findByRole('option', { name: 'Apple' }))
    },
    expected: ['apple'],
  },
  {
    name: 'FormFileUpload',
    schema: z.array(z.instanceof(File)).min(1, { error: MESSAGE }),
    defaultValue: [],
    field: <FormFileUpload name="value" label="Attachments" />,
    control: () => screen.getByRole('button', { name: 'Attachments Browse files' }),
    fill: async (user) => {
      const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
      await user.upload(input, new File(['x'], 'a.txt', { type: 'text/plain' }))
    },
    expected: [expect.any(File)],
  },
  {
    name: 'FormToggleGroup',
    schema: z.string().min(1, { error: MESSAGE }),
    defaultValue: '',
    field: (
      <FormToggleGroup
        name="value"
        label="Plan"
        items={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />
    ),
    control: () => screen.getByRole('radiogroup', { name: 'Plan' }),
    focusTarget: () => screen.getByRole('radio', { name: 'Free' }),
    fill: async (user) => {
      await user.click(screen.getByRole('radio', { name: 'Pro' }))
    },
    expected: 'pro',
  },
]

function TestForm({
  testCase,
  mode = 'onSubmit',
  onSubmit,
}: {
  testCase: Case
  mode?: 'onSubmit' | 'onBlur'
  onSubmit?: (values: { value: unknown }) => void
}) {
  const form = useForm<{ value: unknown }>({
    resolver: zodResolver(z.object({ value: testCase.schema })),
    defaultValues: { value: testCase.defaultValue },
    mode,
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit?.(values))}>
        {testCase.field}
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe.each(CASES)('$name', (testCase) => {
  test('a failed submit marks the labelled control invalid and focuses it', async () => {
    const user = userEvent.setup()
    render(<TestForm testCase={testCase} />)
    const control = testCase.control()
    expect(control.getAttribute('aria-invalid')).not.toBe('true')

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    const message = await screen.findByText(MESSAGE)
    expect(control.getAttribute('aria-invalid')).toBe('true')
    expect(control.getAttribute('aria-describedby')?.split(' ')).toContain(message.id)
    await waitFor(() =>
      expect(document.activeElement).toBe((testCase.focusTarget ?? testCase.control)())
    )
  })

  test('leaving the field marks it touched (mode: onBlur validates)', async () => {
    const user = userEvent.setup()
    render(<TestForm testCase={testCase} mode="onBlur" />)
    ;(testCase.focusTarget ?? testCase.control)().focus()
    await user.click(document.body)
    expect(await screen.findByText(MESSAGE)).toBeTruthy()
  })

  test('a filled field submits its value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TestForm testCase={testCase} onSubmit={onSubmit} />)
    await testCase.fill(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ value: testCase.expected }))
  })
})
