'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Select } from '../../../src'

const FormSchema = z.object({
  email: z
    .string({
      error: 'Please select an email to display.',
    })
    .email(),
})

export default function SelectForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values:', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-foreground p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a verified email to display" />
                  </Select.Trigger>
                </FormControl>
                <Select.Content>
                  <Select.Item value="m@example.com">m@example.com</Select.Item>
                  <Select.Item value="m@google.com">m@google.com</Select.Item>
                  <Select.Item value="m@support.com">m@support.com</Select.Item>
                </Select.Content>
              </Select.Root>
              <FormDescription>
                You can manage email addresses in your{' '}
                <a href="/examples/forms">email settings</a>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="secondary">
          Submit
        </Button>
      </form>
    </Form>
  )
}
