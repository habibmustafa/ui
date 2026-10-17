import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button, Form, FormItemLayout, Input } from '../../../src'

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
})

export default function FormItemLayoutDemo() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast('You submitted the following values:', { description: JSON.stringify(values) })
  }

  return (
    <Form {...form}>
      <form className="w-96 flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <Form.Field
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItemLayout
              label="Username"
              description="This is your public display name"
              labelOptional="optional"
            >
              <Form.Control>
                <Input placeholder="mildtomato" {...field} />
              </Form.Control>
            </FormItemLayout>
          )}
        />
        <Button size="small" variant="secondary" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
