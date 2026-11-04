import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, DataInput, Form, FormItemLayout, Separator } from '../../../src'

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
})

export default function FormItemLayoutDemo() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    toast('You submitted the following values:', { description: JSON.stringify(values) })
  }
  return (
    <Form {...form}>
      <form className="w-130 flex flex-col gap-8" onSubmit={form.handleSubmit(onSubmit)}>
        <Form.Field
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItemLayout
              layout="horizontal"
              label="Username"
              description="This is your public display name"
              labelOptional="optional"
            >
              <Form.Control>
                <DataInput placeholder="mildtomato" {...field} />
              </Form.Control>
            </FormItemLayout>
          )}
        />
        <Separator />
        <div className="w-full flex justify-end">
          <Button size="small" variant="secondary" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}
