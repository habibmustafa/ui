'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Checkbox, Form } from '../../../src'

const FormSchema = z.object({
  mobile: z.boolean().default(false).optional(),
})

export default function CheckboxReactHookFormSingle() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mobile: true,
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values:', {
      description: (
        <pre className="mt-2 w-85 rounded-md bg-foreground p-4">
          <code className="text-background">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Form.Field
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <Form.Item className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Form.Control>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </Form.Control>
              <div className="space-y-1 leading-none">
                <Form.Label>Use different settings for my mobile devices</Form.Label>
                <Form.Description>
                  You can manage your mobile notifications in the{' '}
                  <a href="/examples/forms">mobile settings</a> page.
                </Form.Description>
              </div>
            </Form.Item>
          )}
        />
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
