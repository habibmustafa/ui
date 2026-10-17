'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Button,
  Form,
  RadioGroupCard,
} from '../../../src'

const FormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none'], {
    error: 'You need to select a notification type.',
  }),
})

export default function RadioGroupCardForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values:', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-foreground p-4">
          <code className="text-background">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <Form.Field
          control={form.control}
          name="type"
          render={({ field }) => (
            <Form.Item className="space-y-4">
              <Form.Label>Notify me about...</Form.Label>
              <Form.Control>
                <RadioGroupCard.Root
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap gap-3"
                >
                  <RadioGroupCard.Item value="all" label="All new messages" />
                  <RadioGroupCard.Item value="mentions" label="Direct messages and mentions" />
                  <RadioGroupCard.Item value="none" label="Nothing" />
                </RadioGroupCard.Root>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" variant="secondary" size="small">
          Submit
        </Button>
      </form>
    </Form>
  )
}
