import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, FileUpload, Form, FormInput, FormSelect, Label, Mentions } from '../../src'

const TOPICS = [
  { value: 'sales', label: 'Talk to sales' },
  { value: 'support', label: 'I need support' },
  { value: 'press', label: 'Press and partnerships' },
]

const TEAM = [
  { value: 'sales', label: 'Sales team', description: 'Pricing and plans' },
  { value: 'support', label: 'Support team', description: 'Help with the product' },
  { value: 'grace', label: 'Grace Hopper', description: 'Customer success' },
]

const schema = z.object({
  name: z.string().min(1, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  topic: z.string().min(1, 'Choose what this is about.'),
})

export default function ContactForm() {
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [sent, setSent] = useState(false)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', topic: '' },
  })

  if (sent) {
    return (
      <div role="status" className="flex w-full max-w-xl flex-col items-center gap-3 rounded-xl border bg-surface-100 p-10 text-center shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/40 bg-brand-default/15 text-brand-600">
          <MailCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Message sent</h3>
        <p className="text-sm text-foreground-light">Thanks, {form.getValues('name')}. We reply within one working day.</p>
        <Button
          onClick={() => {
            form.reset()
            setMessage('')
            setFiles([])
            setSent(false)
          }}
        >
          Write another message
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          // The message is not a form field, so it is checked here with the rest.
          const empty = message.trim() === ''
          setMessageError(empty)
          form.handleSubmit(() => {
            if (!empty) setSent(true)
          })(event)
        }}
        className="w-full max-w-xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm"
      >
        <div className="border-b px-6 py-5">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Contact us</h3>
          <p className="mt-0.5 text-sm text-foreground-light">Tell us what you need and the right person will answer.</p>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput name="name" label="Name" autoComplete="name" />
            <FormInput name="email" label="Email" type="email" autoComplete="email" />
          </div>
          <FormSelect name="topic" label="What is this about?" options={TOPICS} placeholder="Choose a topic" />

          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-message">Message</Label>
            <Mentions
              id="contact-message"
              placeholder="How can we help? Type @ to bring in a teammate."
              rows={4}
              options={TEAM}
              value={message}
              onValueChange={(value) => {
                setMessage(value)
                setMessageError(false)
              }}
              aria-invalid={messageError || undefined}
            />
            {messageError && (
              <p role="alert" className="text-sm text-destructive">
                Write a short message.
              </p>
            )}
          </div>

          <FileUpload
            label="Attachment"
            description="PNG, JPG or PDF, up to 5 MB."
            accept="image/png,image/jpeg,application/pdf"
            maxSize={5 * 1024 * 1024}
            value={files}
            onValueChange={setFiles}
          />
        </div>

        <div className="flex justify-end border-t bg-surface-75 px-6 py-3.5">
          <Button type="submit" variant="primary">
            Send message
          </Button>
        </div>
      </form>
    </Form>
  )
}
